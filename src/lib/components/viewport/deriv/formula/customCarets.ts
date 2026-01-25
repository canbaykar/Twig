import { Plugin } from "prosemirror-state";
import { MultiSelection } from "./multiSelection";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";

const CURSOR_ON_TIME  = 500;
const CURSOR_OFF_TIME = 500;

let activeViews: EditorView[] = [];
function viewCreated(view: EditorView) {
	activeViews.push(view);
	if (activeViews.length === 1) triggerTracker();
}
function viewDestroyed(view: EditorView) {
	const i = activeViews.indexOf(view);
	if (i !== -1) activeViews.splice(i, 1);
	if (!activeViews.length) stopTracker();
}

// Caret blink tracker
let timeoutId = 0;
function triggerTracker() {
	stopTracker();
	step1();
}
function stopTracker() {
	clearTimeout(timeoutId);
	timeoutId = 0;
}
function step1() { // Caret visible
	for (const view of activeViews) {
		view.dom.classList.remove('caret-off');
	}
	timeoutId = setTimeout(step2, CURSOR_ON_TIME);
}
function step2() { // Caret invisible
	for (const view of activeViews) {
		view.dom.classList.add('caret-off');
	}
	timeoutId = setTimeout(step1, CURSOR_OFF_TIME);
}

/**
 * To be used with multiSelectionPlugin. Hide caret and selection with
 * caret-transparent selection:bg-transparent when using this.
 * Has additional CSS in formula component.
 */
export const customCaretsPlugin: Plugin = new Plugin({
	view(view) {
		viewCreated(view);
		return {
			update(view, prevState) {
				triggerTracker();
			},
			destroy() {
				viewDestroyed(view);
			},
		};
	},

	props: {
		// See CSS style in formula component
		decorations(state) {
			const selections = state.selection instanceof MultiSelection
				? state.selection.selections
				: [state.selection];
			
			// Using only widget to render caret doesn't work in Chrome. Starting selection with
			// from left side of a letter (with mouse) doesn't work when you try it.
			// So here it's rendered with ::before and ::after.
			return DecorationSet.create(state.doc, selections.map(s => {
				if (!s.empty)
					return Decoration.inline(s.from, s.to, {
						class: s.head < s.anchor ? "caret-right" : "caret-left",
						style: 'background: var(--color-selection);'
					});
				return s.from !== 0
					? Decoration.inline(s.from - 1, s.from, { class: "caret-left" })
					: state.doc.content.size !== 0
						? Decoration.inline(0, 1, { class: "caret-right" })
						: Decoration.widget(s.head, () => {
							const caret = document.createElement('span');
							caret.style = "outline: 10px solid";
							return caret;
						});
			}).flat());
		},
	},
});