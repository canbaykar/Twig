import type { Listeners } from "../../viewportC.svelte";
import Deriv from '$lib/state/deriv.svelte';
import type { DraggableOptions } from '$lib/utils/interact/draggable.svelte';
import draggable from '$lib/utils/interact/draggable.svelte';
import viewport from '$lib/state/viewport.svelte';
import { DT } from '../../../../../DT';
import { IndicatorPopup } from './indicatorPopup.svelte';
import { zoneDataFromPoint } from './dropzones.svelte';
import { defaultAnchor, mouseAnchor } from '../renderData.svelte';
import { mouse } from '$lib/utils/interact/mouse.svelte';
import { DraggableType } from "../../renderData.svelte";
import { initialZoneData, zoneOptions, type ZoneData } from "./options";

// null: free, else: bound (assumes parent can't be null while dragging!)
const free = (data: Deriv) => data.parent === viewport;

const opt = (data: Deriv): DraggableOptions => ({
	cursor: 'all-scroll',
	start() {
		data.render.dragged = true;
		viewport.render.dragType = DraggableType.Deriv;

		let zd: ZoneData | null = initialZoneData(data, DraggableType.Deriv);

		// Rectangle popup that indicates current binding zone rect
		const indicator = new IndicatorPopup();

		// if (free()) shrinkTree();

		data.render.swapAnchor(mouseAnchor);

		function updateZD() {
			const x = data.render.x;
			const y = data.render.y;

			const tr = getTransition(x, y);
			if (tr) {
				const sideZoneData = determineSideZones(data, tr);

				tr[0]?.exit(data);
				tr[1]?.enter(data);

				zd = tr[1];

				data.render.moveTo(x, y);

				// If entering caused an exit or vice versa, move viewport to prevent it;
				// but only if dragging slowly.
				const dx = mouse.dx;
				const dy = mouse.dy;
				const v = Math.sqrt(dx * dx + dy * dy);
				if (v < 10) clip(data, sideZoneData); // 10 is arbitrary
			}

			// if (free()) shrinkTree();

			indicateBoundingRect(data, zd, indicator);
		}

		function getTransition(x: number, y: number): false | [ZoneData | null, ZoneData | null] {
			const oldZ = zd;
			let newZ = zd;

			// Did we exit a zone?
			if (newZ && !inBoundingRect(data, x, y)) newZ = null;
			// Did we enter a zone?
			if (!newZ) newZ = zoneDataFromPoint(x, y);

			return oldZ === newZ ? false : [oldZ, newZ];
		}

		return {
			move(e) {
				const cl2wrld = viewport.render.cl2wrld;
				// data.render.xTransform += cl2wrld.scale(e.dx);
				// data.render.yTransform += cl2wrld.scale(e.dy);

				updateZD();
			},

			end(e) {
				data.render.dragged = false;
				viewport.render.dragType = DraggableType.None

				updateZD();
				if (zd) zd.drop(data);

				// Reset stuff used for DND
				if (data.parent !== viewport) data.render.xTranslate = data.render.yTranslate = 0;
				data.render.treeOverwrite = null;

				indicator.detach();

				data.render.swapAnchor(defaultAnchor);
				if (data.derivParent) data.render.resetTranslate();
			}
		};
	}
});

function getBoundingRect(d: Deriv) {
	const padding = DT.derivDropZonePaddingN;
	// Half width
	const w2 = d.render.width / 2 + padding;
	// TODO: Change DerivRenderData so as to remove these two
	const xy = defaultAnchor(d.render);
	let left = xy[0] - w2;
	let right = xy[0] + w2;

	// Stretch rect to neighbouring siblings' centers or to ends
	// of the parent's child zone
	if (d.parent instanceof Deriv) {
		const zoneRect = zoneOptions['child_deriv'].getElementRect(d.parent);
		zoneRect.left += d.parent.render.x;

		const prevSib = d.parent.children[d.childIndex - 1];
		left = Math.min(left, prevSib ? prevSib.render.x : zoneRect.left - padding);

		const nextSib = d.parent.children[d.childIndex + 1];
		right = Math.max(
			right,
			nextSib ? nextSib.render.x : zoneRect.left + zoneRect.width + padding
		);
	}

	// There's extra 1 UNIT top padding to make height cover both a bottom bar and top bar
	// (rowOffset is distance between bars + 1 UNIT bar width, add another UNIT for 2nd bar)
	return {
		left,
		top: xy[1] - DT.derivBarBottomN - padding - DT.UNIT,
		width: right - left,
		height: DT.derivRowOffsetN + padding * 2 + DT.UNIT,
	};
}

function inBoundingRect(data: Deriv, x: number, y: number, r = getBoundingRect(data)) {
	return y >= r.top && y - r.top <= r.height && x >= r.left && x - r.left <= r.width;
}

/** Getters for right side of the zone at the left of data and left side of ... */
function determineSideZones(data: Deriv, tr: [ZoneData | null, ZoneData | null]): [() => number, () => number] {
	// Side zones are only applicable when !tr[1].
	if (tr[1]) return [() => -Infinity, () => Infinity];

	const x = data.render.x;
	const y = data.render.y;

	// Number of rows over root that are relevant
	const limit = Math.floor((data.root.render.y + DT.derivBgPaddingN - y) / DT.derivRowOffsetN);

	// Helper functions
	const getRect = (d: Deriv) => {
		const rect = zoneOptions[d.children.length ? 'child_deriv' : 'top_deriv'].getElementRect(d);
		rect.left += d.render.x; // Relative to absolute coord. y is not used
		return rect;
	}
	const rectRight = (r: any) => r.left + r.width;
	const oneRowBelow = (d: Deriv) =>
		y >= d.render.y + DT.derivBgPaddingN - 2 * DT.derivRowOffsetN
		&& y <= d.render.y + DT.derivBgPaddingN - DT.derivRowOffsetN;
	const atRight = (d: Deriv) => oneRowBelow(d) && x < getRect(d).left;
	const atLeft = (d: Deriv) => oneRowBelow(d) && x > rectRight(getRect(d));

	// Var. names below assume reverse = false,
	// Also the vars below aren't zones, they are owners of the zones (so they are one row down)
	const leftZone = Deriv.find(data.root, atLeft, false, true, limit);
	const rightZone = Deriv.find(leftZone ?? data.root, atRight, false, false, limit);

	return [
		leftZone ? () => rectRight(getRect(leftZone)) : () => -Infinity,
		rightZone ? () => getRect(rightZone).left : () => Infinity,
	];
}

// Only in x direction
function clip(data: Deriv, sideZoneData: [() => number, () => number]) {
	if (free(data)) {
		// Clip into between side zones
		clipToInterval(data, [sideZoneData[0](), sideZoneData[1]()]);
	} else {
		// Clip into bounding rect
		const r = getBoundingRect(data);
		clipToInterval(data, [r.left, r.left + r.width]);
	}
}

function clipToInterval(data: Deriv, int: [number, number]) {
	const x = data.render.x;
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
	data.render.moveTo(x_, data.render.y);
}

function indicateBoundingRect(dragged: Deriv, zd: ZoneData | null, ind: IndicatorPopup) {
	if (zd) {
		const r = getBoundingRect(dragged);
		ind.left = r.left;
		ind.top = r.top;
		ind.width = r.width;
		ind.height = r.height;
		ind.opacity = 1;
	} else {
		// If zd is null, make ind invisible but keep it on dragged deriv for animation
		ind.opacity = 0;
		ind.left = dragged.render.x - dragged.render.width / 2;
		ind.top = dragged.render.y - DT.derivBarBottomN;
		ind.width = dragged.render.width;
		ind.height = DT.derivRowOffsetN;
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

// Part listeners to be managed by viewport
// (see part + uid system in deriv render data)
export const dndListeners: Listeners = {
	bg: {
		mousedown(e) {
			draggable.once(opt(e.deriv));
		},
	},
};