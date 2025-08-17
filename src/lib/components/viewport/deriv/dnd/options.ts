import type Deriv from "$lib/state/deriv.svelte";
import viewport from "$lib/state/viewport.svelte";
import { DT } from "../../../../../DT";
import { DraggableType } from "../../renderData.svelte";
import { defaultAnchor } from "../renderData.svelte";

interface Rect { left: number, top: number, width: number, height: number }

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
 * since its mutable.)
 * Renderable zones are rendered in dropzones.svelte. Initial zone data are only made at the start of
 * DND, it doesn't make sense for them to have elements bc elements are used to make zone data with hover.
 */
abstract class ZoneData {
	readonly deriv: Deriv;

	enter(dragged: Deriv) {}
	exit(dragged: Deriv) {}
	drop(dragged: Deriv) {}

	constructor(deriv: Deriv) {
		this.deriv = deriv;
	}

	// Default implementation
	// The top and height props here are made to be consistent with element
	// rects of the class below (except padding). That's why padding is 
	// asymmetrical when it doesn't have to be.
	/** In ABSOLUTE world coordinates */
	get boundingRect(): Rect {
		const rd = this.deriv.render;
		return addPadding({
			left: rd.x - rd.width / 2,
			top: rd.y - DT.derivBarBottomN,
			width: rd.width,
			height: DT.derivRowOffsetN,
		});
	}
}

export type { RenderableZoneData };
/** 
 * (abstract) See ZoneData which this extends. Notes: Dropzone components/elements don't carry 
 * instances of this! One element described with getElementRect may represent multiple "zones" 
 * next to each other. Classes extending this MUST have readonly static "type" prop that is 
 * the same as their key in renderedZoneOptions (for matching HTML and state). This has to be 
 * unique per renderable type.
 */
abstract class RenderableZoneData extends ZoneData {
	static readonly type: string;
	/** Condition for when the zone is enabled, see examples */
	static condition(deriv: Deriv) { return true; }

	// Abstract static method
	/** In RELATIVE world coordinates (relative to deriv origin point) */
	static getElementRect(deriv: Deriv): Rect {
		throw new Error("Attempting to getElementRect for zone without element");
	}

	// Default implementation
	get boundingRect(): Rect {
		const elRect = (this.constructor as typeof RenderableZoneData).getElementRect(this.deriv);
		// Relative to absolute coords
		elRect.left += this.deriv.render.x;
		elRect.top += this.deriv.render.y;
		return addPadding(elRect);
	}
}

// Used below in getElementRect methods
const row2height = (row: number) => row * DT.derivRowOffsetN - DT.derivBarBottomN;

/** Defines behaviour of initial zones. See ZoneData for more info. */
export const initialZoneOptions = {
	[DraggableType.Deriv]: class initial extends ZoneData {
		exit(dragged: Deriv): void {
			dragged.attach(viewport);
		}
	},
	// WIP
	[DraggableType.Bar]: class initial extends ZoneData {
		exit(dragged: Deriv): void {
			dragged.attach(viewport);
		}
	},
};

/** 
 * Defines behaviour of renderable zones accepting deriv. See ZoneData for more info.
 * Contains classes extending RenderableZoneOptions. 
 */
const renderableDerivZoneOptions = {
    top_deriv: class extends RenderableZoneData {
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
            const left = -deriv.render.barWidth / 2;
            return { left, top: row2height(-1), width: -2 * left, height: DT.derivRowOffsetN };
        }
    },

	child_deriv: class extends RenderableZoneData {
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

/** 
 * Defines behaviour of renderable zones accepting bar. See ZoneData for more info.
 * Contains classes extending RenderableZoneData. 
 */
const renderableBarZoneOptions = {};

// --- Final Exports ---
/** Do renderableZoneTypes[t] to get the ZoneData class for ZoneType t */
export const renderableZoneOptions = {
	...renderableDerivZoneOptions,
	...renderableBarZoneOptions,
};
export type RenderableZoneOption = ValueOf<typeof renderableZoneOptions>;
export type ZoneType = keyof typeof renderableZoneOptions;

/** Do renderableZoneOptionsByDragType[viewport.render.dragType] to get currently rendered zone options as array */
const renderableZoneOptionsByDragType: Record<DraggableType, RenderableZoneOption[]> = {
	[DraggableType.Deriv]: Object.values(renderableDerivZoneOptions),
	[DraggableType.Bar]: Object.values(renderableBarZoneOptions),

	// Types not related to this file are also here as renderedZoneData
	// should return empty array in those cases
	[DraggableType.None]:    [],
	[DraggableType.Panzoom]: [],
};
/** Returns zone options classes (as array) for zones that should be currently rendered. */
export function getRenderedZoneOptions() {
	return renderableZoneOptionsByDragType[viewport.render.dragType];
}

// Utility type
type ValueOf<T> = T[keyof T];