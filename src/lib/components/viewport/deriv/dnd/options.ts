import Deriv from "$lib/state/deriv.svelte";
import viewport from "$lib/state/viewport.svelte";
import { DT } from "../../../../../DT";
import { DraggableType } from "../../renderData.svelte";
import { defaultAnchor } from "../renderData.svelte";

export interface Rect { left: number, top: number, width: number, height: number }

// Extention dimentions for zone rects (not related to padding in CSS):
// There's extra 1 UNIT top padding to make height cover both a bottom bar and top bar
// (rowOffset is distance between bars + 1 UNIT bar width, add another UNIT for 2nd bar)
// Also see the default implementation of boundingRect in ZoneOptions below.
const paddings: Rect = {
	left: -DT.derivDropZonePaddingN,
	top: -DT.derivDropZonePaddingN - DT.UNIT,
	width: 2 * DT.derivDropZonePaddingN,
	height: 2 * DT.derivDropZonePaddingN + DT.UNIT,
};
// Do addPadding({ ...rect }) to make this non-modifying
function addPadding(rect: Rect) {
	rect.left += paddings.left;
	rect.top += paddings.top;
	rect.width += paddings.width;
	rect.height += paddings.height;
	return rect;
}

// Currently there are only two types of draggable elements using this zone system:
// deriv and bar. (panzoom and native text dragging for example doesn't use it, the 
// latter may need extensive refactoring if we need to add them her)

export type { ZoneData };
/** 
 * Instances of this are created by dragged item during DND. There's no such object/class 
 * called a "zone" here, we have elements each representing (possibly multiple) zones.
 * For two pixel, if both of them are associated with ZoneData with matching contents 
 * (see zoneDataFromPoint) they "belong to the same zone". (Can't use === with ZoneData 
 * since its mutable.) Zone elements are rendered in dropzones.svelte.
 * Notes: Dropzone components/elements don't carry instances of this! One element described 
 * with getElementRect may represent multiple "zones" next to each other. Classes extending 
 * this MUST have readonly static "type" prop that is the same as their key in zoneOptions 
 * (for matching HTML and state). This has to be unique per type.
 */
abstract class ZoneData {
	static readonly type: string;
	/** Condition for when the zone is enabled, see examples */
	static condition(deriv: Deriv) { return true; }

	readonly deriv: Deriv;

	enter(dragged: Deriv) {}
	exit(dragged: Deriv) {}
	drop(dragged: Deriv) {}

	constructor(deriv: Deriv) {
		this.deriv = deriv;
	}

	// Abstract static method
	/** In RELATIVE world coordinates (relative to deriv origin point) */
	static getElementRect(deriv: Deriv): Rect {
		throw new Error("Attempting to getElementRect for zone without element");
	}

	// Default implementation
	get boundingRect(): Rect {
		const elRect = (this.constructor as typeof ZoneData).getElementRect(this.deriv);
		// Relative to absolute coords
		elRect.left += this.deriv.render.x;
		elRect.top += this.deriv.render.y;
		return addPadding(elRect);
	}
}

// Used below in getElementRect methods
const row2height = (row: number) => row * DT.derivRowOffsetN - DT.derivBarBottomN;

/** Defines behaviour of zones accepting deriv. Contains classes extending ZoneData. */
const derivZoneOptions = {
	// This is separate from child_deriv below because it will behave different later
    top_deriv: class extends ZoneData {
		static readonly type = 'top_deriv';
		static condition(deriv: Deriv) { return deriv.children.length === 0; }

        enter(dragged: Deriv): void {
            dragged.attach(this.deriv);
			this.deriv.render.goToTop();
        }
        exit(dragged: Deriv): void {
            dragged.attach(viewport);
        }

        static getElementRect(deriv: Deriv): { left: number; top: number; width: number; height: number; } {
            const left = -deriv.render.barWidth / 2 - DT.derivDropZonePaddingN;
            return { left, top: row2height(-1), width: -2 * left, height: DT.derivRowOffsetN };
        }
    },

	child_deriv: class extends ZoneData {
		static readonly type = 'child_deriv';
		static condition(deriv: Deriv) { return deriv.children.length !== 0; }

		readonly prevSib: Deriv | undefined;

		constructor(deriv: Deriv, x: number) {
			super(deriv);
			for (let i = deriv.children.length - 1; i >= 0; i--)
				if (x > deriv.children[i].render.x) {
					this.prevSib = deriv.children[i];
					if (this.prevSib.render.dragged)
						this.prevSib = deriv.children[i - 1];
					return;
				}
		}

		enter(dragged: Deriv): void {
			const i = this.prevSib ? this.deriv.children.indexOf(this.prevSib) + 1 : 0;
			dragged.attach(this.deriv, i);
			this.deriv.render.goToTop();
		}
		exit(dragged: Deriv): void {
			dragged.attach(viewport);
		}

		// One elementRect (and thus one dropzone component is shared among siblings)
		// But the instance is per child. So boundingRect is reimplemented.
		static getElementRect(deriv: Deriv): { left: number; top: number; width: number; height: number; } {
			const c0r = deriv.children[0].render;
			const left = Math.min(-deriv.render.barWidth / 2, defaultAnchor(c0r)[0] - deriv.render.x - c0r.width / 2 - DT.derivDropZonePaddingN);
			return { left, top: row2height(-1), width: -2 * left, height: DT.derivRowOffsetN };
		}

		get boundingRect(): Rect {
			let { left, top, width, height } = super.boundingRect;
			let right = left + width;

			// Restrict sides with neighboring siblings' centers
			// Left:
			if (this.prevSib) left = this.prevSib.render.x;
			// Right:
			const nextSibIndex = (this.prevSib?.childIndex ?? -1) + 2;
			const nextSib = this.deriv.children[nextSibIndex];
			if (nextSib) right = nextSib.render.x;

			return { left, top, width: right - left, height };
		}
	},
};

/** Defines behaviour of zones accepting bar. Contains classes extending ZoneData. */
const barZoneOptions = {};

/** Determines initial zone data when starting DND. This can't be generated automatically... */
export function initialZoneData(d: Deriv, type: DraggableType.Deriv | DraggableType.Bar) {
	if (!(d.parent instanceof Deriv)) return null;
	if (type === DraggableType.Deriv)
		return new zoneOptions["child_deriv"](d.parent, d.render.x)
	else throw new Error('Bar drag-and-drop not implemented yet.');
}

// --- Final Exports ---
// See zoneDataFromPoint from dropzones.svelte for use of this
/** Do zoneOptions[t] to get the ZoneData class for ZoneType t */
export const zoneOptions = {
	...derivZoneOptions,
	...barZoneOptions,
};
export type ZoneOption = ValueOf<typeof zoneOptions>;
export type ZoneType = keyof typeof zoneOptions;

/** Do zoneOptionsByDragType[viewport.render.dragType] to get currently rendered zone 
 *  options as array */
const zoneOptionsByDragType: Record<DraggableType, ZoneOption[]> = {
	[DraggableType.Deriv]: Object.values(derivZoneOptions),
	[DraggableType.Bar]: Object.values(barZoneOptions),

	// Types not related to this file are also here as ZoneData should return empty 
	// array in those cases
	[DraggableType.None]:    [],
	[DraggableType.Panzoom]: [],
};
/** Returns zone options classes (as array) for all zones that should be currently rendered. */
function getZoneOptions() {
	return zoneOptionsByDragType[viewport.render.dragType];
}
export function getZonesOf(d: Deriv) {
	return getZoneOptions().filter(opt => opt.condition(d));
}

// Utility type
type ValueOf<T> = T[keyof T];