import { browser } from '$app/environment';
import { mouse } from './mouse.svelte';

// Used to stlye cursor on drag
let sheet: CSSStyleSheet;
if (browser) {
	sheet = new CSSStyleSheet();
	document.adoptedStyleSheets.push(sheet);
}

let downX = 0, downY = 0;

export interface DraggableOptions {
	start?(e: MouseEvent): void | {
		// These are here too to allow you to make vars scoped in start 
		// and use them in move & end. (so more performant)
		move?(e: MouseEvent & { dx: number; dy: number }): void;
		end?(e: MouseEvent): void;
	};
	move?(e: MouseEvent & { dx: number; dy: number }): void;
	end?(e: MouseEvent): void;
	cursor?: string;
	checker?: (target: HTMLElement) => boolean;
	/** How much should mouse move before DND triggers? (in px, default: 2) */
	tolerance?: number;
}

// So that only one drag interaction activates at once
let active = false;

// Less headache than making a Draggable class or something
// This only exists to not redifine these listeners in two places
function getListeners(op?: DraggableOptions) {
	let {
        start = () => {},
		move = () => {},
		end = () => {},
        cursor = 'grabbing',
		checker = () => true,
		tolerance = 2,
    } = op ?? {};

	const l = {
		onDown(e: MouseEvent) {
			if (!checker(e.target as HTMLElement)) return;
			l._onDown();
		},
		// Used in draggable.once that force-starts an onDown without e
		_onDown() {
			if (active) return;
			active = true;
			downX = mouse.x;
			downY = mouse.y;
			document.addEventListener('mouseup', l.onUp, { once: true });
			document.addEventListener('mousemove', l.onDragStart);
			sheet.insertRule(`* { cursor: ${cursor} !important; user-select: none !important; }`);
		},

		onDragStart(e: MouseEvent) {
			if (Math.hypot(downX - mouse.x, downY - mouse.y) < tolerance) return;
			document.removeEventListener('mousemove', l.onDragStart);
			document.addEventListener('mousemove', l.onMove);
			try {
				const res = start(e) ?? {};
				if (res?.move) move = res.move;
				if (res?.end) end = res.end;
			} catch (error) {
				l.onUp(e);
				throw error;
			}
		},

		onUp(e: MouseEvent) {
			document.removeEventListener('mouseup', l.onUp);
			document.removeEventListener('mousemove', l.onDragStart);
			document.removeEventListener('mousemove', l.onMove);
			// Reset cursor
			sheet.replace('');
			active = false;
			end(e);
		},

		onMove(e: MouseEvent) {
			try {
				move(Object.assign(e, {
					dx: mouse.dx,
					dy: mouse.dy,
				}));
			} catch (error) {
				l.onUp(e);
				throw error;
			}
		},
	};

	return l;
}

/** 
 * Svelte action for DND. Use draggable.once for a one time DND interaction (not action). 
 * Works similar to interact.js 
 */
export default function draggable(node: HTMLElement | Document, op?: DraggableOptions) {
	let l = getListeners(op);
	
	// @ts-expect-error For some reason this works with HTMLElement and Document but not their union
	node.addEventListener('mousedown', l.onDown);

	return {
		destroy() {
			// @ts-expect-error
			node.removeEventListener('mousedown', l.onDown);
		}
	}
}

/**
 * Starts a potential DND interaction. Call on mouse down.
 * Potential because the real interaction starts with mouse movement after.
 * Of course op.checker is ignored.
 */
draggable.once = function(op?: DraggableOptions) {
	getListeners(op)._onDown();
}