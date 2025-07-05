import { browser } from '$app/environment';
import { mouse } from './mouse.svelte';

// Used to stlye cursor on drag
let sheet: CSSStyleSheet;
if (browser) {
	sheet = new CSSStyleSheet();
	document.adoptedStyleSheets.push(sheet);
}

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
}

// So that only one drag interaction activates at once
let active = false;

export default function draggable(node: HTMLElement, op?: DraggableOptions) {
	let {
        start = () => {},
		move = () => {},
		end = () => {},
        cursor = 'grabbing',
		checker = () => true,
    } = op ?? {};
	
	node.addEventListener('mousedown', onDown);
	return {
		destroy() {
			node.removeEventListener('mousedown', onDown);
		}
	}

	// ---- Listeners ----
	function onDown(e: MouseEvent) {
		if (active || !checker(e.target as HTMLElement)) return;
		active = true;
		document.addEventListener('mouseup', onUp, { once: true });
		document.addEventListener('mousemove', onDragStart, { once: true });
		sheet.insertRule(`* { cursor: ${cursor} !important; user-select: none !important; }`);
	}

	function onDragStart(e: MouseEvent) {
		document.addEventListener('mousemove', onMove);
		try {
			const res = start(e) ?? {};
			if (res?.move) move = res.move;
			if (res?.end) end = res.end;
		} catch (error) {
			onUp(e);
			throw error;
		}
	}

	function onUp(e: MouseEvent) {
		document.removeEventListener('mouseup', onUp);
		document.removeEventListener('mousemove', onDragStart);
		document.removeEventListener('mousemove', onMove);
		// Reset cursor
		sheet.replace('');
		active = false;
		end(e);
	}

	function onMove(e: MouseEvent) {
		try {
			move(Object.assign(e, {
				dx: mouse.dx,
				dy: mouse.dy,
			}));
		} catch (error) {
			onUp(e);
			throw error;
		}
	}
}