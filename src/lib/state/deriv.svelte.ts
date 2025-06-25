import DerivRenderData from "$lib/components/viewport/deriv/renderData.svelte";
import { Parent } from "$lib/utils/parent.svelte";
import { LogicData } from "./logic/index.svelte";
import viewport, { type Serial, type Viewport } from "./viewport.svelte";

export default class Deriv extends Parent {
	declare readonly children: Deriv[];
	/** ($derived) Utility for parent */
	readonly derivParent: Deriv | null = $derived(this.parent instanceof Deriv ? this.parent : null);
	/** ($derived) */
	readonly root: Deriv = $derived.by(() => {
		return this.parent instanceof Deriv ? this.parent.root : this;
	});

	/** ($derived) String of childIndexes, upwards */
	readonly address: string = $derived.by(() => {
		return this.parent instanceof Deriv ? this.parent.address + '.' + this.childIndex : this.childIndex + '';
	});
	static lookup(address: string): Deriv | null {
		const directions = address.split('.');
		let pos: any = viewport;
		for (let i = 0; i < directions.length; i++) {
			pos = pos.children[parseInt(directions[i])];
			if (!(pos instanceof Deriv)) return null;
		}
		return pos;
	}

	/** ($state) */
	conc = $state('');

	readonly render: DerivRenderData;
	readonly logic: LogicData;

	/** @param s Serialized Deriv */
	constructor(s: Serial<Deriv> = {}) {
		super();
		if (s.conc) this.conc = s.conc;
		if (s.children) this.attachChildren(s.children.map((ch) => new Deriv(ch)));

		this.logic = new LogicData(this);
		this.render = new DerivRenderData(this, s.render ?? {});
	}

	/** Util for crawling Derivs to find the first one that satisfies fn
	 * 	The ordering isn't symmetric so going backwards in the ordering and going forwards in the reversed ordering are different.
	 * 	Limit is the height limit relative to current position, integer or Infinity. When it's 0 (or negative), doesn't go any higher. */
	static find(start: Deriv, fn: (d: Deriv) => boolean, backwards = false, reverse = false, limit = Infinity): Deriv | null {
		return Crawler.find(start, fn, backwards, reverse, limit);
	}
}


// --- Crawler Util ---
export class Crawler {
	/** Current node being crawled */
	curr: Deriv;
	/** Height limit (integer or infinite) relative to curr. If 0, can't gat higher. */
	limit: number;

	constructor(deriv: Deriv, limit = Infinity) {
		this.curr = deriv;
		this.limit = limit;
	}

	next(reverse = false) {
		const next = this.getNext(this.curr, reverse);
		if (!next) return false;
		this.curr = next;
		return true;
	}
	prev(reverse = false) {
		const prev = this.getPrev(this.curr, reverse);
		if (!prev) return false;
		this.curr = prev;
		return true;
	}

	static find(start: Deriv, fn: (d: Deriv) => boolean, backwards = false, reverse = false, limit = Infinity): Deriv | null {
		return new Crawler(start, limit).find(fn, backwards, reverse);
	}
	find(fn: (d: Deriv) => boolean, backwards = false, reverse = false): Deriv | null {
		return (backwards ? this.findBackwards : this.findForwards).bind(this)(fn, reverse);
	}
	private findForwards(fn: (d: Deriv) => boolean, reverse = false): Deriv | null {
		if (fn(this.curr)) return this.curr;
		if (!this.next(reverse)) return null;
		return this.findForwards(fn, reverse);
	}
	private findBackwards(fn: (d: Deriv) => boolean, reverse = false): Deriv | null {
		if (fn(this.curr)) return this.curr;
		if (!this.prev(reverse)) return null;
		return this.findBackwards(fn, reverse);
	}

	// Variable names and explanations below assume reverse = false
	getNext(curr = this.curr, reverse = false): Deriv | null {
		// Case: Has children
		const firstChild = curr.children[reverse ? curr.children.length - 1 : 0];
		if (firstChild && this.limit > 0) {
			this.limit--;
			return firstChild;
		}
		// Case: Check for right cousin (sibling counts as cuisin)
		return this.getNextCousin(curr, reverse);
	}
	private getNextCousin(curr = this.curr, reverse = false): Deriv | null {
		// Case: No parent
		if (!curr.derivParent) return null;
		// Case: Has right sibling
		const rightSib = curr.derivParent.children[curr.childIndex + 1 - +reverse * 2];
		if (rightSib) return rightSib;
		// Case: Check right (lower) cousins of higher degree
		this.limit++;
		return this.getNextCousin(curr.derivParent, reverse);
	}

	// Variable names and explanations below assume reverse = false
	getPrev(curr = this.curr, reverse = false): Deriv | null {
		// Case: No parent
		if (!curr.derivParent) return null;
		// Case: Is first child
		if (curr.childIndex === (reverse ? curr.children.length - 1 : 0)) {
			this.limit++;
			return curr.derivParent;
		}
		// Case: Return last node of left sibling
		const leftSib = curr.derivParent.children[curr.childIndex - 1 + +reverse * 2];
		return this.getLast(leftSib);
	}
	private getLast(curr = this.curr, reverse = false): Deriv | null {
		if (!curr.children.length || this.limit <= 0) return curr;
		this.limit--;
		return this.getLast(curr.children[reverse ? 0 : curr.children.length - 1]);
	}
}


// --- Example deriv ---
export function addExampleProof() {
	viewport.attachChild(
		new Deriv({
			conc: '(A∧B)→C',
			// rule: '→I',
			// label: '1',
			render: {
				xTransform: -130,
				yTransform: 70,
			},
			children: [
				{
					conc: 'C',
					// rule: '→E',
					children: [
						{
							conc: 'B',
							// rule: '∧E',
							children: [
								{
									conc: 'A∧B'
									// rule: '1',
								}
							]
						},
						{
							conc: 'B→C',
							// rule: '→E',
							children: [
								{
									conc: 'A',
									// rule: '∧E',
									children: [
										{
											conc: 'A∧B'
											// rule: '1'
										}
									]
								},
								{
									conc: 'A→(B→C)'
								}
							]
						}
					]
				}
				// {
				//     conc: 'a',
				// },
			]
		})
	);

	viewport.attachChild(
		new Deriv({
			conc: 'a',
			render: {
				xTransform: 0,
				yTransform: 6000
			},
			children: [
				// ---- Right leaning stack ----
				{
					conc: 'b',
					children: [
						{ conc: 'c' },
						{
							conc: 'd',
							children: [
								{ conc: 'e' },
								{
									conc: 'f',
									children: [
										{ conc: 'g' },
										{
											conc: 'h',
											children: [{ conc: 'i' }, { conc: 'j' }]
										}
									]
								}
							]
						}
					]
				},

				// ---- Middle ----
				{ conc: 'k' },
				{ conc: 'l' },

				// ---- Left leaning stack ----
				{
					conc: 'm',
					children: [
						{
							conc: 'n',
							children: [
								{
									conc: 'o',
									children: [
										{
											conc: 'p',
											children: [{ conc: 'q' }, { conc: 'r' }]
										},
										{ conc: 's' }
									]
								},
								{ conc: 't' }
							]
						},
						{ conc: 'u' }
					]
				}
			]
		})
	);
}