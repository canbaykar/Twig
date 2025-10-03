import { Slice, type Node, type ResolvedPos } from "prosemirror-model";
import { Plugin, Selection, TextSelection, Transaction } from "prosemirror-state";
import type { Mappable } from "prosemirror-transform";
import { Decoration, DecorationSet, type EditorView } from "prosemirror-view";

const jsonID = 'multi';

export class MultiSelection extends Selection {
	readonly selections: Selection[];
	readonly main: Selection;
	/** Number of selections */
	get length() { return this.selections.length; }
	/** Index of main */
	get mainIndex() { return this.selections.indexOf(this.main); }

	constructor(selections: Selection[], main = selections[selections.length - 1]) {
		if (!main) 
			throw new Error("Invalid arguments for MultiSelection. Main selection doesn't exist.");
		
		// Normalise main
		while (main instanceof MultiSelection) main = main.main;

		// Normalise selections
		selections = selections
			.map(s => s instanceof MultiSelection ? s.selections : s).flat()
			.map(s => s.$from.doc === doc ? s : TextSelection.create(doc, s.anchor, s.head));
		if (!selections.includes(main)) 
			throw new Error("Invalid arguments for MultiSelection. Main selection isn't in selections.");
		selections = selections
			.sort((a, b) => a.from - b.from)
			// Handles conflicts (remove if intersecting, merge ones in the same place, etc.)
			.reduce((acc: Selection[], curr) => {
				const prev = acc[acc.length - 1];
				if (!prev) return [curr];
				if (prev.to < curr.from) return [...acc, curr];
				if (prev.empty && prev.head === curr.head) {
					if (prev === main) main = curr;
					return [...acc.slice(0, -1), curr];
				}
				if (curr.empty && prev.head === curr.head) {
					if (curr === main) main = prev;
					return acc;
				}
				if (prev.to === curr.from) return [...acc, curr];
				if (prev === main) return acc;
				return [...acc.slice(0, -1), curr];
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
		if (!this.main.eq(s.main)) return false;
		for (let i = 0; i < this.selections.length; i++) {
			if (!this.selections[i].eq(s.selections[i])) return false;
		}
		return true;
	}

	replace(tr: Transaction, content?: Slice): void {
		let newS: Selection[] = [];
		for (const sel of this.selections) {
			const sel_ = sel.map(tr.doc, tr.mapping);
			sel_.replace(tr, content);
			newS.push(tr.selection);
		}
		// newS = newS.map(s => s.map(tr.doc, tr.mapping));
		tr.setSelection(new MultiSelection(newS, newS[this.mainIndex]));
	}
	replaceWith(tr: Transaction, node: Node): void {
		let newS: Selection[] = [];
		for (const sel of this.selections) {
			const sel_ = sel.map(tr.doc, tr.mapping);
			sel_.replaceWith(tr, node);
			newS.push(tr.selection);
		}
		// newS = newS.map(s => s.map(tr.doc, tr.mapping));
		tr.setSelection(new MultiSelection(newS, newS[this.mainIndex]));
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
		
		let newS: Selection[] = [];
		for (const sel of this.selections) {
			const sel_ = sel.map(tr.doc, tr.mapping);
			if (sel_.empty)
				TextSelection.between(sel_.$anchor, offsetHead(sel_))
					.replace(tr, Slice.empty);
			else sel_.replace(tr, Slice.empty);
			newS.push(tr.selection);
		}
		// newS = newS.map(s => s.map(tr.doc, tr.mapping));
		tr.setSelection(new MultiSelection(newS, newS[this.mainIndex]));
	}

	/** Add s2 (as main) to s1 and return the resulting MultiSelection */
	static withAdded(s1: Selection, s2: Selection) {
		return new MultiSelection([s1, s2]);
	}

	/** If s isn't an instance of MultiSelection, return newMain. 
	 *  Else return s with it's main selection thrown out and replaced with newMain */
	static withReplacedMain(s: Selection, newMain: Selection) {
		if (!(s instanceof MultiSelection)) return newMain;
		const selections = [...s.selections];
		selections.splice(selections.indexOf(s.main), 1, newMain);
		return new MultiSelection(selections, newMain);
	}

	/** Apply left(dir = -1) or right(dir = 1) arrow press. Accounts for Shift+Arrow but
	 *  not Ctrl+Arrow and assumes all selections are text :(. For mod argument refer to 
	 * 	getMods from prosemirror-view/srv/capturekeys.ts */
	move(tr: Transaction, dir: number, mods: string) {
		const offsetHead = dir < 0 
			? (sel: Selection) => tr.doc.resolve(Math.max(sel.head - 1, 0))
			: (sel: Selection) => tr.doc.resolve(Math.min(sel.head + 1, tr.doc.content.size));
		// Assumes s is TextSelection
		const toMoved = mods.indexOf('s') > -1 
			? (s: Selection) => TextSelection.between(s.$anchor, offsetHead(s))
			: (s: Selection) => {
				const $h = s.empty ? (offsetHead(s)) : (dir < 0 ? s.$from : s.$to);
				return TextSelection.between($h, $h);
			};
		let newS: Selection[] = [];
		for (const sel of this.selections) {
			newS.push(toMoved(sel));
		}
		tr.setSelection(new MultiSelection(newS, newS[this.mainIndex]));
	}
}

// TODO: Uncomment the following after you're done with this file
// bc it causes errors with hot-reload.
// Register jsonID
// Selection.jsonID(jsonID, MultiSelection); //////////////////////////////////////////////////////////////////////////

// == Copied from prosemirror-view (browser.ts and capturekeys.ts) for handleKeyDown below ==
const nav = typeof navigator != "undefined" ? navigator : null;
const agent = (nav && nav.userAgent) || "";
const ie_edge = /Edge\/(\d+)/.exec(agent);
const ie_upto10 = /MSIE \d/.exec(agent);
const ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(agent);
const ie = !!(ie_upto10 || ie_11up || ie_edge);
const safari = !ie && !!nav && /Apple Computer/.test(nav.vendor);
const ios = safari && (/Mobile\/\w+/.test(agent) || !!nav && nav.maxTouchPoints > 2);
const mac = ios || (nav ? /Mac/.test(nav.platform) : false);
const _chrome = !ie && /Chrome\/(\d+)/.exec(agent);
const chrome = !!_chrome;
const windows = nav ? /Win/.test(nav.platform) : false;
function findDirection(view: EditorView, pos: number): "rtl" | "ltr" {
  let $pos = view.state.doc.resolve(pos)
  if (!(chrome || windows) && $pos.parent.inlineContent) {
    let coords = view.coordsAtPos(pos)
    if (pos > $pos.start()) {
      let before = view.coordsAtPos(pos - 1)
      let mid = (before.top + before.bottom) / 2
      if (mid > coords.top && mid < coords.bottom && Math.abs(before.left - coords.left) > 1)
        return before.left < coords.left ? "ltr" : "rtl"
    }
    if (pos < $pos.end()) {
      let after = view.coordsAtPos(pos + 1)
      let mid = (after.top + after.bottom) / 2
      if (mid > coords.top && mid < coords.bottom && Math.abs(after.left - coords.left) > 1)
        return after.left > coords.left ? "ltr" : "rtl"
    }
  }
  let computed = getComputedStyle(view.dom).direction
  return computed == "rtl" ? "rtl" : "ltr"
}
function getMods(event: KeyboardEvent) {
  let result = ""
  if (event.ctrlKey) result += "c"
  if (event.metaKey) result += "m"
  if (event.altKey) result += "a"
  if (event.shiftKey) result += "s"
  return result
}
// == End of copied dependencies ==

/** Selection state preserved while holding alt */
type AltState = {
	altKey: boolean;
	fresh: boolean; // mousedown fired but selection didn't update yet
	deletionMode: boolean; // selection updated and deleted a selection but didn't update yet after that
};
const altUp = { altKey: false, fresh: false, deletionMode: false };
function getAltState(view: EditorView): AltState {
	return multiSelectionPlugin.getState(view.state);
}
function setAltState(view: EditorView, val: AltState) {
	view.dispatch(view.state.tr.setMeta(multiSelectionPlugin, val));
}

export const multiSelectionPlugin: Plugin = new Plugin({
	state: {
		init(): AltState {
			return altUp;
		},
		apply(tr, value): AltState {
			return tr.getMeta(multiSelectionPlugin) ?? value;
		},
	},

	props: {
		handleDOMEvents: {
			mousedown(view, e) {
				if (e.altKey) 
					setAltState(view, { altKey: true, fresh: true, deletionMode: false });
			},
			keyup(view, e) {
				if (e.key === 'Alt') setAltState(view, altUp);
			}
		},

		createSelectionBetween(view, $anchor, $head) {
			const altState = getAltState(view);
			const newS = TextSelection.between($anchor, $head);
			if (!altState.altKey)
				return newS; // Default behaviour
			if (altState.fresh) {
				setAltState(view, { altKey: true, fresh: false, deletionMode: false });
				return MultiSelection.withAdded(view.state.selection, newS);
			}
			else return MultiSelection.withReplacedMain(view.state.selection, newS);
		},

		handleKeyDown(view, e) {
			const state = view.state;
			const sel = state.selection;
			
			if (!(sel instanceof MultiSelection)) return;
			
			// This function has some copied logic from prosemirror-view/src/capturekeys
			// so if confused, see that.
			const key = e.key, mods = getMods(e), tr = state.tr;
			if (key === 'Backspace' || (mac && key == 'h' && mods == "c")) {
				// Backspace, Ctrl-h on Mac
				sel.delete(tr, -1);
				view.dispatch(tr);
				return true;
			} else if ((key === 'Delete' && !e.shiftKey) || (mac && key == 'd' && mods == "c")) {
				// Delete, Ctrl-d on Mac
				sel.delete(tr, 1);
				view.dispatch(tr);
				return true;
			} else if (key === 'ArrowLeft' || (mac && key === 'b' && mods == "c")) {
    			let dir = key === 'ArrowLeft' ? (findDirection(view, view.state.selection.from) == "ltr" ? -1 : 1) : -1;
				sel.move(tr, dir, mods);
				view.dispatch(tr);
				return true;
			} else if (key === 'ArrowRight' || (mac && key === 'f' && mods == "c")) {
				let dir = key === 'ArrowRight' ? (findDirection(view, view.state.selection.from) == "ltr" ? 1 : -1) : 1;
				sel.move(tr, dir, mods);
				view.dispatch(tr);
				return true;
			}
		},

		decorations(state) {
			const selections = state.selection instanceof MultiSelection
				? state.selection.selections
				: [state.selection];

			const caretCSS = (left = true) => `
			box-shadow: ${left ? '-' : ''}10px 0 0 var(--color-fg), ${left ? '' : '-'}10px 0 0 var(--color-fg) inset
			`;
			
			return DecorationSet.create(state.doc, selections.map(s => {
				if (!s.empty)
					return Decoration.inline(s.from, s.to, { style: 'background: crimson;' + caretCSS(s.head < s.anchor) });
				return s.from !== 0
					? Decoration.inline(s.from, s.from + 1, { style: caretCSS() })
					: state.doc.content.size !== 0
						? Decoration.inline(0, 1, { style: caretCSS() })
						: Decoration.widget(s.head, () => {
							const caret = document.createElement('span');
							caret.style = "outline: 10px solid";
							return caret;
						});
			}).flat());
		},
	},
});