import { browser } from '$app/environment';

// Used to stlye cursor on drag
let sheet: CSSStyleSheet;
if (browser) {
	sheet = new CSSStyleSheet();
	document.adoptedStyleSheets.push(sheet);
}

export interface DraggableOptions {
	start?(e: MouseEvent): void;
	move?(e: MouseEvent & { dx: number; dy: number }): void;
	cursor?: string;
	checker?: (n: HTMLElement) => boolean;
}

// So that only one drag interaction activates at once
let active = false;
// Used in listeners
let x = 0, y = 0;

export default function draggable(node: HTMLElement, op?: DraggableOptions) {
	let {
        start = () => {},
        move = () => {},
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
		x = e.screenX;
		y = e.screenY;
		document.addEventListener('mouseup', onUp, { once: true });
		document.addEventListener('mousemove', onDragStart, { once: true });
	}

	function onDragStart(e: MouseEvent) {
		document.addEventListener('mousemove', onMove);
		// Set cursor
		sheet.insertRule(`* { cursor: ${cursor} !important; user-select: none !important; }`);
		start(e);
	}

	function onUp(e: MouseEvent) {
		document.removeEventListener('mousemove', onMove);
		// Reset cursor
		sheet.replace('');
		active = false;
	}

	function onMove(e: MouseEvent) {
		move(Object.assign(e, {
			dx: e.screenX - x,
			dy: e.screenY - y,
		}));
		x = e.screenX;
		y = e.screenY;
	}
}