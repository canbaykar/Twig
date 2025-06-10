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

	/** Util for crawling Derivs to find the first one that satisfies fn */
	static find(start: Deriv, fn: (d: Deriv) => boolean): Deriv | null {
		return Crawler.find(start, fn);
	}
}


// --- Crawler Util ---
export class Crawler {
	/** Current node being crawled */
	curr: Deriv;
	constructor(deriv: Deriv) {
		this.curr = deriv;
	}

	next() {
		const next = this.getNext();
		if (!next) return false;
		this.curr = next;
		return true;
	}
	prev() {
		const prev = this.getPrev();
		if (!prev) return false;
		this.curr = prev;
		return true;
	}

	static find(start: Deriv, fn: (d: Deriv) => boolean): Deriv | null {
		return new Crawler(start).find(fn);
	}
	find(fn: (d: Deriv) => boolean): Deriv | null {
		if (fn(this.curr)) return this.curr;
		if (!this.next()) return null;
		return this.find(fn);
	}

	getNext(curr = this.curr): Deriv | null {
		// Case: Has children
		const firstChild = curr.children[0];
		if (firstChild) return firstChild;
		// Case: Check for right cousin (sibling counts as cuisin)
		return this.getNextCousin(curr);
	}
	private getNextCousin(curr: Deriv): Deriv | null {
		// Case: No parent
		if (!curr.derivParent) return null;
		// Case: Has right sibling
		const rightSib = curr.derivParent.children[curr.childIndex + 1];
		if (rightSib) return rightSib;
		// Case: Check right (lower) cousins of higher degree
		return this.getNextCousin(curr.derivParent);
	}

	getPrev(curr = this.curr): Deriv | null {
		// Case: No parent
		if (!curr.derivParent) return null;
		// Case: Is first child
		if (curr.childIndex === 0) return curr.derivParent;
		// Case: Return last node of left sibling
		const leftSib = curr.derivParent.children[curr.childIndex - 1];
		return this.getLast(leftSib);
	}
	private getLast(curr: Deriv): Deriv | null {
		if (!curr.children.length) return curr;
		return this.getLast(curr.children[curr.children.length - 1]);
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
					conc: 'a',
					children: [
						{ conc: 'a' },
						{
							conc: 'a',
							children: [
								{ conc: 'a' },
								{
									conc: 'a',
									children: [
										{ conc: 'a' },
										{
											conc: 'a',
											children: [{ conc: 'a' }, { conc: 'a' }]
										}
									]
								}
							]
						}
					]
				},

				// ---- Middle ----
				{ conc: 'a' },
				{ conc: 'a' },

				// ---- Left leaning stack ----
				{
					conc: 'a',
					children: [
						{
							conc: 'a',
							children: [
								{
									conc: 'a',
									children: [
										{
											conc: 'a',
											children: [{ conc: 'a' }, { conc: 'a' }]
										},
										{ conc: 'a' }
									]
								},
								{ conc: 'a' }
							]
						},
						{ conc: 'a' }
					]
				}
			]
		})
	);
}