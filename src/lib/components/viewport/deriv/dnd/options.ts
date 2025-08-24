import Deriv from "$lib/state/deriv.svelte";
import viewport from "$lib/state/viewport.svelte";
import { DT } from "../../../../../DT";
import { DraggableType } from "../../renderData.svelte";
import { defaultAnchor, followBarAnchor, mouseAnchor } from "../renderData.svelte";

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
	readonly dragged: Deriv;

	enter() {}
	exit() {}
	drop() {}

	constructor(deriv: Deriv, dragged: Deriv) {
		this.deriv = deriv;
		this.dragged = dragged;
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
	// This is separate from child below because it will behave different later
    top: class extends ZoneData {
		static readonly type = 'top';
		static condition(deriv: Deriv) { return deriv.children.length === 0; }

        enter(): void {
            this.dragged.attach(this.deriv);
			this.deriv.render.goToTop();
        }
        exit(): void {
            this.dragged.attach(viewport);
        }

        static getElementRect(deriv: Deriv): { left: number; top: number; width: number; height: number; } {
            const left = -deriv.render.barWidth / 2 - DT.derivDropZonePaddingN;
            return { left, top: row2height(-1), width: -2 * left, height: DT.derivRowOffsetN };
        }
    },

	child: class extends ZoneData {
		static readonly type = 'child';
		static condition(deriv: Deriv) { return deriv.children.length !== 0; }

		readonly prevSib: Deriv | undefined;

		constructor(deriv: Deriv, dragged: Deriv) {
			super(deriv, dragged);
			const x = dragged.render.x;
			for (let i = deriv.children.length - 1; i >= 0; i--)
				if (x > deriv.children[i].render.x) {
					this.prevSib = deriv.children[i];
					if (this.prevSib.render.dragged)
						this.prevSib = deriv.children[i - 1];
					return;
				}
		}

		enter(): void {
			const i = this.prevSib ? this.deriv.children.indexOf(this.prevSib) + 1 : 0;
			this.dragged.attach(this.deriv, i);
			this.deriv.render.goToTop();
		}
		exit(): void {
			this.dragged.attach(viewport);
		}

		// One elementRect (and thus one dropzone component is shared among siblings)
		// But the instance is per child. So boundingRect is reimplemented.
		static getElementRect(deriv: Deriv): { left: number; top: number; width: number; height: number; } {
			const left = -deriv.render.barWidth / 2 - DT.derivDropZonePaddingN;
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
// Note: When dragging bar, the checked point for drop target is the middle point of bar.
const barZoneOptions = {
	bar: class BarZoneData extends ZoneData {
		static readonly type = 'bar';
		static condition(deriv: Deriv) { return deriv.children.length === 0; }

		// Stores initial dragged.conc
		private conc = '';

        enter(): void {
			this.conc = this.dragged.conc;
			swapDeriv(this.deriv, this.dragged);
			this.dragged.conc = this.deriv.conc;
			// Hacky fix: baseWidth doesn't update right away which creates an issue
			// with the clipping feature of DND
			this.dragged.render.baseWidth = this.deriv.render.baseWidth;

			// this.deriv.attachChildren(dragged.children);
			// dragged.detach();
			// this.deriv.render.barAnchor = mouseAnchor;
			// this.deriv.render.moveTo(...dragged.render.xyBar, true);

			// const parent = this.deriv.parent;
			// const index = this.deriv.childIndex;
			// this.deriv.detach();
			// dragged.render.anchor = defaultAnchor;
			// if (parent) {
			// 	parent.attachChild(dragged, index);
			// 	dragged.render.resetTranslate(true, false);
			// }
			// // This moves formula, not bar!
			// else dragged.render.moveTo(...this.deriv.render.xy);
			this.dragged.render.goToTop();
        }
        exit(): void {
			swapDeriv(this.dragged, this.deriv);
			this.dragged.attach(viewport);
			this.dragged.conc = this.conc;
			this.dragged.render.anchor = followBarAnchor;
			this.dragged.render.resetTranslate();

			// dragged.attachChildren(this.deriv.children);
			// dragged.attach(viewport);
			// this.deriv.render.barAnchor = defaultBarAnchor;
			// this.deriv.render.resetTranslate();

			// const parent = dragged.parent;
			// const index = dragged.childIndex;
            // dragged.attach(viewport);
			// dragged.render.anchor = followBarAnchor;
			// dragged.render.resetTranslate(true, false);
			// if (parent) parent.attachChild(this.deriv, index);
			// else viewport.attachChild(this.deriv);
        }

        static getElementRect(deriv: Deriv): { left: number; top: number; width: number; height: number; } {
            const left = -deriv.render.barWidth / 2 - DT.derivDropZonePaddingN;
            return { left, top: row2height(-1), width: -2 * left, height: DT.derivRowOffsetN };
        }

		// Reimplemented because this.deriv is detached on enter()
		get boundingRect(): Rect {
			const elRect = BarZoneData.getElementRect(this.dragged);
			// Relative to absolute coords
			elRect.left += this.dragged.render.x;
			elRect.top += this.dragged.render.y;
			return addPadding(elRect);
		}
    },
};

// Puts d1 in d0's place for bar zone option's enter
// Assumes d0's parent != null
// Assumes d0's anchor's default, sets anchor & position of d1 to match...
function swapDeriv(d0: Deriv, d1: Deriv) {
	const parent = d0.parent as Deriv | typeof viewport;
	const index = d0.childIndex;
	d0.detach();
	d1.render.anchor = defaultAnchor;
	if (parent instanceof Deriv) parent.attachChild(d1, index);
	else d1.render.moveTo(d0.render.xTranslate, d0.render.yTranslate);
	if (!d1.parent) d1.attach(viewport);
}

/** Determines initial zone data when starting DND. This can't be generated automatically... */
export function prepareInitialZoneData(d: Deriv, type: DraggableType.Deriv | DraggableType.Bar) {
	if (type === DraggableType.Deriv) {
		d.render.swapAnchor(mouseAnchor);
		if (d.parent instanceof Deriv) 
			return new zoneOptions.child(d.parent, d);
		else return null;
	} else {
		d.render.swapAnchor(mouseAnchor, true);
		if (d.parent === viewport && d.conc.match(/^[ \xC2\xA0\t\n\r]*$/)) {
			d.render.swapAnchor(followBarAnchor);
			return null;
		}
		const clone = new Deriv({ conc: d.conc, render: d.render });
		clone.attach(viewport);
		swapDeriv(d, clone);
		// enter() below requires baseWidth to be up-to-date
		clone.render.baseWidth = d.render.baseWidth;
		const zd = new zoneOptions.bar(clone, d);
		zd.enter();
		return zd;
	}
}

// --- Final Exports ---
// See zoneDataFromPoint from dropzones.svelte for use of this
/** Do zoneOptions.t to get the ZoneData class for ZoneType t */
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