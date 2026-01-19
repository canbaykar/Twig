import Deriv from '$lib/state/deriv.svelte';
import type { DraggableOptions } from '$lib/utils/interact/draggable.svelte';
import viewport from '$lib/state/viewport.svelte';
import { DT } from '../../../../../DT';
import { IndicatorPopup } from './indicatorPopup.svelte';
import { zoneStateFromPoint } from './dropzones.svelte';
import { defaultAnchor, defaultBarAnchor } from '../renderState.svelte';
import { mouse } from '$lib/utils/interact/mouse.svelte';
import { DraggableType } from "../../renderState.svelte";
import { prepareInitialZoneState, zoneDataObject, type Rect, type ZoneState } from "./zoneData";
import { ConnectionPopup } from './connectionPopup.svelte';

// See draggable util
export const dndOptions = (data: Deriv, bar: boolean): DraggableOptions => ({
	cursor: 'all-scroll',
	start() {
		bar ? data.render.barDragged = true : data.render.bodyDragged = true;
		const dragType = bar ? DraggableType.Bar : DraggableType.Deriv;
		viewport.render.dragType = dragType;

		let zs: ZoneState | null = prepareInitialZoneState(data, dragType);

		// Rectangle popup that indicates current binding zone rect
		const indicator = new IndicatorPopup();
		const connection = new ConnectionPopup();
		indicateBoundingRect(data, zs, indicator);
		updateConnection(data, zs, connection, bar);

		// if (free()) shrinkTree();

		function updateZS() {
			const [x, y] = bar ? data.render.xyBar : data.render.xy;

			const tr = getTransition(x, y, data);
			if (tr) {
				const sideZoneState = determineSideZones(data, tr, x, y, bar);

				tr[0]?.exit();
				tr[1]?.enter();

				zs = tr[1];

				data.render.moveTo(x, y, bar);

				// If entering caused an exit or vice versa, move viewport to prevent it;
				// but only if dragging slowly.
				const dx = mouse.dx;
				const dy = mouse.dy;
				const v = Math.sqrt(dx * dx + dy * dy);
				if (v < 10) clip(data, zs, sideZoneState, bar); // 10 is arbitrary
			}

			// if (free()) shrinkTree();

			indicateBoundingRect(data, zs, indicator);
			updateConnection(data, zs, connection, bar);
		}

		function getTransition(x: number, y: number, dragged: Deriv): false | [ZoneState | null, ZoneState | null] {
			const oldZ = zs;
			let newZ = zs;

			// Did we exit a zone?
			if (zs && !inRect(zs.boundingRect, x, y)) newZ = null;
			// Did we enter a zone?
			if (!newZ) newZ = zoneStateFromPoint(x, y, dragged);

			return oldZ === newZ ? false : [oldZ, newZ];
		}

		return {
			move(e) {
				updateZS();
			},

			end(e) {
				bar ? data.render.barDragged = false : data.render.bodyDragged = false;
				viewport.render.dragType = DraggableType.None

				updateZS();
				if (zs) zs.drop();

				// Reset stuff used for DND
				if (data.parent !== viewport) data.render.xTranslate = data.render.yTranslate = 0;
				data.render.treeOverwrite = null;

				indicator.detach();
				connection.detach();

				// Reset positioning
				data.render.swapAnchor(defaultAnchor);
				data.render.barAnchor = defaultBarAnchor;
				if (data.derivParent) data.render.resetTranslate(true, false);
				data.render.resetTranslate(false, true);
			}
		};
	}
});

function inRect(r: Rect, x: number, y: number) {
	return y >= r.top && y - r.top <= r.height && x >= r.left && x - r.left <= r.width;
}

/** Getters for right side of the zone at the left of data and left side of ... */
function determineSideZones(
	data: Deriv, tr: [ZoneState | null, ZoneState | null], x: number, y: number, bar: boolean
): [() => number, () => number] {
	// Side zones are only applicable when !tr[1].
	if (tr[1]) return [() => -Infinity, () => Infinity];

	// Row number of y, 0 if the same row as root
	const yDepth = Math.floor((data.root.render.y + DT.derivBgPaddingN - y) / DT.derivRowOffsetN);

	const type = bar ? 'bar' : 'child';
	const dragged = tr[0]!.dragged;

	// Two utilities
	function right(r: Rect) { return r.left + r.width }
	// Only left and width of the rects are used, vertical stuff is with d.depth
	function getAbsRect(d: Deriv) {
		const r = zoneDataObject[type].getElementRect(d);
		r.left += d.render.x;
		// r.top  += d.render.y; // Not needed
		return r;
	}
	
	const depthCheck = (d: Deriv) => d.depth === yDepth - 1;
	const zoneAtLeft =  (d: Deriv) => x > right(getAbsRect(d));
	const zoneAtRight = (d: Deriv) => x < getAbsRect(d).left;
	// For bar, add an extra check to filter out non-leaf nodes (only those have the zone)
	const barless = (d: Deriv) => d.children.length === 0 || d === dragged;
	
	const leftCheck  = bar 
		? (d: Deriv) => depthCheck(d) && barless(d) && zoneAtLeft(d)
		: (d: Deriv) => depthCheck(d) && zoneAtLeft(d)
	const rightCheck = bar 
		? (d: Deriv) => depthCheck(d) && barless(d) && zoneAtRight(d) 
		: (d: Deriv) => depthCheck(d) && zoneAtRight(d)

	// These also crawl through the dragged deriv but it doesn't currently cause any issues
	let leftDeriv  = Deriv.find(             data.root, leftCheck,  false, true,  yDepth - 1);
	let rightDeriv = Deriv.find(leftDeriv ?? data.root, rightCheck, false, false, yDepth - 1);

	// A hacky fix: tr[0]'s dragged and deriv are exchanged on exit() so for the getters,
	// we have to exchange them beforehand if we are referencing them.
	if (bar) {
		if      (leftDeriv  === dragged) leftDeriv  = tr[0]!.deriv;
		else if (rightDeriv === dragged) rightDeriv = tr[0]!.deriv;
	}

	return [
		leftDeriv  ? () => right(getAbsRect(leftDeriv)) : () => -Infinity,
		rightDeriv ? () => getAbsRect(rightDeriv).left  : () =>  Infinity,
	];
}

// Only in x direction
function clip(data: Deriv, zs: ZoneState | null, sideZoneState: [() => number, () => number], bar: boolean) {
	if (!zs) { // i.e. if data is free
		// Clip into between side zones
		clipToInterval(data, [sideZoneState[0](), sideZoneState[1]()], bar);
	} else {
		// Clip into bounding rect
		const r = zs!.boundingRect;
		clipToInterval(data, [r.left, r.left + r.width], bar);
	}
}

function clipToInterval(data: Deriv, int: [number, number], bar: boolean) {
	const [x, y] = bar ? data.render.xyBar : data.render.xy;
	if (x >= int[0] && x <= int[1]) return;
	const len = int[1] - int[0]; // May be infinite or NaN

	// Shrink interval by padding to not have put the element too close to an edge
	let pad = DT.derivRowOffsetN;
	// For the case: width < 2 * padding
	if (isFinite(len)) pad = Math.min(pad, (int[1] - int[0]) / 2);

	const l = int[0] + pad;
	const r = int[1] - pad;

	// The displaced location
	let x_ = Math.min(Math.max(x, l), r);

	// Apply displacement
	viewport.render.x -= (x_ - x) / DT.UNIT * viewport.render.scale;
	data.render.moveTo(x_, y, bar);
}

function indicateBoundingRect(dragged: Deriv, zs: ZoneState | null, ind: IndicatorPopup) {
	if (zs) {
		const r = zs.boundingRect;
		ind.left = r.left;
		ind.top = r.top;
		ind.width = r.width;
		ind.height = r.height;
		ind.opacity = 1;
	} else {
		// If zs is null, make ind invisible but keep it on dragged deriv for animation
		ind.opacity = 0;
		ind.left = dragged.render.x - dragged.render.width / 2;
		ind.top = dragged.render.y - DT.derivBarBottomN;
		ind.width = dragged.render.width;
		ind.height = DT.derivRowOffsetN;
	}
}

function updateConnection(dragged: Deriv, zs: ZoneState | null, con: ConnectionPopup, bar: boolean) {
	[con.x1, con.y1] = bar ? dragged.render.xyBar : dragged.render.xy;
	con.connected = !!zs;
	if (zs) {
		[con.x2, con.y2] = bar ? defaultBarAnchor(dragged.render) : defaultAnchor(dragged.render);
	}
}

// function shrinkTree() {
//     const tree = data.render.tree;
//     data.render.treeOverwrite = {
//         ...tree,
//         collider: {
//             l: tree.collider.l.slice(0,1),
//             r: tree.collider.r.slice(0,1),
//         },
//     };
// }