import Deriv from '$lib/state/deriv.svelte';
import viewport from '$lib/state/viewport.svelte';
import { dndOptions } from './deriv/dnd/dndOptions';
import type { KeyboardListeners, PartListeners } from './viewportC.svelte';
import { DT } from '../../../DT';
import draggable from '$lib/utils/interact/draggable.svelte';
import { tick } from 'svelte';
import { forceFocus } from './deriv/formula/multiSelection';
import { safeParseJSON } from '$lib/utils';

// See also DerivC component and Part+UID system in DerivRenderData as context for this file

export const keyboardListeners: KeyboardListeners = {
	keydown(e) {
		// Edge case: Keyboard use while dragging
		if (viewport.render.dragging) return;

		if (e.key === 'Delete') {
			if (e.shiftKey) viewport.render.shiftDeleteSelection();
			else viewport.render.deleteSelection();
		}
	},
	copy(e, clipboardData = e.clipboardData) {
		const sel = viewport.render.selection;
		if (!sel.length) return;
		clipboardData?.setData(
			'text/plain', 
			JSON.stringify(viewport.render.serializeSelection())
		);
		e.preventDefault();
	},
	paste(e, clipboardData = e.clipboardData) {
		if (!clipboardData) return;
		const str = clipboardData.getData('text/plain');
		if (!str) return;
		try {
			const serial = safeParseJSON(str);
			if (Array.isArray(serial)) { // Try pasting as selection
				viewport.render.deselectAll();
				viewport.render.deserializeSelection(serial);
			} else { // Try pasting as deriv
				const deriv = new Deriv(serial);
				viewport.render.deselectAll();
				deriv.attach(viewport);
				if (!serial.render || !("xTranslate" in serial.render || "yTranslate" in serial.render))
					deriv.render.moveTo(...viewport.render.center);
				viewport.render.selectOnly(deriv);
			}
		} catch (error) { // Paste as formula
			viewport.render.deselectAll();
			const deriv = new Deriv({
				conc: str,
				render: {
					xTranslate: viewport.render.center[0],
					yTranslate: viewport.render.center[1],
					bodySelected: true,
				},
			});
			deriv.attach(viewport);
		}
		// There's a bug where sometimes when in firefox, clipboardData.getData triggers the paste
		// prompt, copy-paste stops working. This line seems to fix.
		viewport.render.element!.focus();
	},
	cut(e, clipboardData = e.clipboardData) { // @ts-expect-error
		keyboardListeners.copy(e, clipboardData);
		viewport.render.deleteSelection();
	}
};

export const partListeners: PartListeners = {
	layout: {
		mousedown(e, l) {
			e.deriv.render.goToTop();
			// Selection shouldn't go automatically to the deriv that renders that adder, which is very
			// arbitrary. Instead it's manually set to the newly added deriv somewhere else.
			// This just disables that automatic behaviour.
			if (e.section === 'adder') e.updateSelecetion = false;
			l(e);
		},
		mouseup(e, l) {
			if (e.section === 'adder') e.updateSelecetion = false;
			l(e);
		},
	},
	body_: {
		mousedown(e) {
			e.deriv.render.bodyMuted = false;
			draggable.once(dndOptions(e.deriv, false));
		},
		mouseup(e) { 
			// Panzoom element that normally recieves focus on mousedown has multiSelection-prevent-blur
			// to prevent text selections being lost while navigating. So we have to manually focus it
			// with a function from multiSelection.
			forceFocus(viewport.render.element);
		}
	},
	bar_: {
		mousedown(e) {
			draggable.once(dndOptions(e.deriv, true));
		},
	},
	body_formula: {
		mousedown(e) {
			e.deriv.render.bodyMuted = false;
		},
	},
	adder_top: {
		mouseup(e) {
			const d = new Deriv();
			e.deriv.attachChild(d);
			d.render.focusEditor();
		}
	},
	adder_bottom: {
		mouseup(e) {
			const [x, y] = e.deriv.render.xy;
			const d = new Deriv();
			viewport.attachChild(d);
			d.attachChild(e.deriv);
			e.deriv.render.resetTranslate();
			d.render.moveTo(x, y + DT.derivRowOffsetN);
			d.render.focusEditor();
		}
	},
	adder_left: {
		mouseup(e) {
			addSibling(e.deriv);
		}
	},
	adder_right: {
		mouseup(e) {
			addSibling(e.deriv, 1);
		}
	},
};

// Helper for side adders (between adders are actually right adders)
function addSibling(d: Deriv, right = 0) {
	// To store old x positions of nearby derivs
	const fixer: [Deriv, number][] = [];
	const addToFixer = (d?: Deriv) => d && fixer.push([d, d.render.x]);

	let p = d.derivParent;
	if (p) {
		addToFixer(p.children[d.childIndex]);
		addToFixer(p.children[d.childIndex + (right * 2 - 1)]);
	} else {
		addToFixer(d);
		p = new Deriv();
		p.render.bodyMuted = true;
		p.attachChild(d);
		p.attach(viewport);
		p.render.moveTo(d.render.x, d.render.y + 2 * DT.derivRowOffsetN);
		d.render.resetTranslate();
	}

	const s = new Deriv();
	p.attachChild(s, d.childIndex + right);
	s.render.focusEditor();

	// Apply fixer
	tick().then(() => {
		let offset = 0;
		for (const [d, x] of fixer) offset += x - d.render.x;
		offset /= fixer.length || 1;
		d.root.render.moveBy(offset, 0);
	});
}