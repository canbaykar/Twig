import { Slice, type Node, type ResolvedPos } from "prosemirror-model";
import { Plugin, Selection, TextSelection, Transaction } from "prosemirror-state";
import type { Mappable } from "prosemirror-transform";

const jsonID = 'multi';

export class MultiSelection extends Selection {
	readonly selections: Selection[];
	readonly main: Selection;
	/** Number of selections */
	get length() { return this.selections.length; }

	constructor(selections: Selection[], main = selections[0]) {
		if (!main) throw new Error("Invalid arguments for MultiSelection. Main selection doesn't exist.");
		// Normalise array
		selections = selections
			.map(s => s instanceof MultiSelection ? s.selections : s).flat()
			.sort((a, b) => a.from - b.from)
			// Handles conflicts (remove if intersecting, merge ones in the same place, etc.)
			.reduce((acc: Selection[], curr) => {
				const prev = acc[acc.length - 1];
				if (!prev) return [curr];
				if (prev.to < curr.from) return [...acc, curr];
				if (prev.empty && prev.head === curr.head) {
					if (prev === main) main = curr;
					return [...acc.slice(0, acc.length - 2), curr];
				}
				if (curr.empty && prev.head === curr.head) {
					if (curr === main) main = prev;
					return acc;
				}
				if (prev.to === curr.from) return [...acc, curr];
				if (prev === main) main = curr;
				return [...acc.slice(0, acc.length - 2), curr];
			}, []);
		const ranges = selections.map(s => s.ranges).flat();
		super(main.$anchor, main.$head, ranges);
		this.selections = selections;
		this.main = main;
	}

	// Default imlementation of these falsely assumed ranges[0] is the main range
    get $from() {
        return this.main.$from;
    }
    get $to() {
        return this.main.$to;
    }

	map(doc: Node, mapping: Mappable): Selection {
		return new MultiSelection(this.selections.map(s => s.map(doc, mapping)));
	}

	eq(s: Selection): boolean {
		if (
			!(s instanceof MultiSelection) ||
			this.selections.length !== s.selections.length
		) return false;
		for (let i = 0; i < this.selections.length; i++) {
			if (!this.selections[i].eq(s.selections[i])) return false;
		}
		return true;
	}

	replace(tr: Transaction, content?: Slice): void {
		const newS: Selection[] = [];
		let newMain: Selection | undefined = undefined;
		for (const sel of this.selections) {
			sel.replace(tr, content);
			newS.push(tr.selection);
			if (sel === this.main) newMain = tr.selection;
		}
		tr.setSelection(new MultiSelection(newS, newMain));
	}
	replaceWith(tr: Transaction, node: Node): void {
		const newS: Selection[] = [];
		let newMain: Selection | undefined = undefined;
		for (const sel of this.selections) {
			sel.replaceWith(tr, node);
			newS.push(tr.selection);
			if (sel === this.main) newMain = tr.selection;
		}
		tr.setSelection(new MultiSelection(newS, newMain));
	}

	toJSON() {
		return { type: jsonID, selections: this.selections };
	}
	static fromJSON(doc: Node, json: any): Selection {
		if (!Array.isArray(json.selections))
			throw new RangeError("Invalid input for MultiSelection.fromJSON");
		return new MultiSelection(json.selections.map((j: any) => Selection.fromJSON(doc, j)));
	}

	/** Wrapper for TextSelection.between */
	static between($anchor: ResolvedPos, $head: ResolvedPos, bias?: number) {
		return new MultiSelection([TextSelection.between($anchor, $head, bias)]);
	}

	/** Backspace or Delete, dir is -1(Backspace) or 1 based on direction */
	delete(tr: Transaction, dir = -1) {
		// When a selection is empty, head of selection is moved in direction of dir
		const offsetHead = dir < 0 
			? (sel: Selection) => tr.doc.resolve(Math.max(sel.head - 1, 0))
			: (sel: Selection) => tr.doc.resolve(Math.min(sel.head + 1, tr.doc.content.size));
		const newS: Selection[] = [];
		let newMain: Selection | undefined = undefined;
		for (const sel of this.selections) {
			if (sel.empty)
				TextSelection.between(sel.$anchor, offsetHead(sel)).replace(tr, Slice.empty);
			else sel.replace(tr, Slice.empty);
			newS.push(tr.selection);
			if (sel === this.main) newMain = tr.selection;
		}
		tr.setSelection(new MultiSelection(newS, newMain));
	}
}

// TODO: Uncomment the following after you're done with this file
// bc it causes errors with hot-reload.
// Register jsonID
// Selection.jsonID(jsonID, MultiSelection); //////////////////////////////////////////////////////////////////////////

// Copied from prosemirror-view (browser.ts and capturekeys.ts) for handleKeyDown below
const nav = typeof navigator != "undefined" ? navigator : null;
const agent = (nav && nav.userAgent) || "";
const ie_edge = /Edge\/(\d+)/.exec(agent);
const ie_upto10 = /MSIE \d/.exec(agent);
const ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(agent);
const ie = !!(ie_upto10 || ie_11up || ie_edge);
const safari = !ie && !!nav && /Apple Computer/.test(nav.vendor);
const ios = safari && (/Mobile\/\w+/.test(agent) || !!nav && nav.maxTouchPoints > 2);
const mac = ios || (nav ? /Mac/.test(nav.platform) : false);
function getMods(event: KeyboardEvent) {
  let result = ""
  if (event.ctrlKey) result += "c"
  if (event.metaKey) result += "m"
  if (event.altKey) result += "a"
  if (event.shiftKey) result += "s"
  return result
}

export const multiSelectionPlugin: Plugin = new Plugin({
	props: {
		createSelectionBetween(view, $anchor, $head) {
			// Default behaviour:
			// return TextSelection.between($anchor, $head);
			return MultiSelection.between($anchor, $head);
		},

		handleKeyDown(view, event) {
			const state = view.state;
			const sel = state.selection;
			if (!(sel instanceof MultiSelection)) return false;

			// Copied logic from prosemirror-view/src/capturekeys
			let key = event.key, mods = getMods(event);
			if (key == 'Backspace' || (mac && key == 'h' && mods == "c")) {
				// Backspace, Ctrl-h on Mac
				const tr = state.tr;
				sel.delete(tr, -1);
				view.dispatch(tr);
			} else if ((key == 'Delete' && !event.shiftKey) || (mac && key == 'd' && mods == "c")) {
				// Delete, Ctrl-d on Mac
				const tr = state.tr;
				sel.delete(tr, 1);
				view.dispatch(tr);
			}
			return false;
		},
	}
});