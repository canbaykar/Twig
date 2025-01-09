import { browser } from '$app/environment';

// Used to stlye cursor on drag
let sheet: CSSStyleSheet;
if (browser) {
	sheet = new CSSStyleSheet();
	document.adoptedStyleSheets.push(sheet);
}

export interface DraggableOptions {
	allowFrom?: string | HTMLElement | HTMLElement[];
	ignoreFrom?: string | HTMLElement | HTMLElement[];
	start?(e: MouseEvent): void;
	move?(e: MouseEvent & { dx: number; dy: number }): void;
	cursor?: string;
}

// So that only one drag interaction activates at once
let active = false;
// Used in listeners
let x = 0, y = 0;

export default function draggable(node: HTMLElement, op?: DraggableOptions) {
	let {
        allowFrom = [node],
        ignoreFrom = [],
        start = () => {},
        move = () => {},
        cursor = 'grabbing',
    } = op ?? {};

	let aFChecker = (_: HTMLElement) => true;
	const iFChecker = resolveChecker(ignoreFrom, node);

	if (allowFrom instanceof HTMLElement) allowFrom = [allowFrom];
	if (Array.isArray(allowFrom)) {
		allowFrom.forEach(n => n.addEventListener('mousedown', onDown));
		return {
			destroy() {
				allowFrom.forEach(n => n.removeEventListener('mousedown', onDown));
			}
		}
	}

	// else allowFrom is string
	aFChecker = n => stringChecker(allowFrom, node, n);
	node.addEventListener('mousedown', onDown);
	return {
		destroy() {
			node.removeEventListener('mousedown', onDown);
		}
	};

	// ---- Listeners ----
	function onDown(e: MouseEvent) {
		const t = e.target as HTMLElement;
		if (active || !aFChecker(t) || iFChecker(t)) return;
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

function resolveChecker(op: string | HTMLElement | HTMLElement[], ctx: HTMLElement): (n: HTMLElement) => boolean {
    if (typeof op === 'string') {
        return n => stringChecker(op, ctx, n);
    } else if (Array.isArray(op)) 
		return n => op.some(el => el.contains(n));
	else return n => op.contains(n);
}

function stringChecker(selector: string, ctx: HTMLElement, node: HTMLElement) {
	// Is n in an element mathching selector that's inside node?
	const match = node.closest(selector);
	return !!match && ctx.contains(match);
}