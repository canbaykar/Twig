import type Deriv from "$lib/state/deriv.svelte";
import { DT } from "../../../../../DT";

export type DropzoneType = keyof typeof zoneTypes;

// Dragged element makes instances of this (some class that extends ZoneData). 
// Dropzone components/elements don't have instances because they may represent multiple zones.
abstract class ZoneData {
    abstract readonly type: DropzoneType;
    abstract readonly deriv: Deriv;
    abstract enter(dragged: Deriv): void;
    abstract exit(dragged: Deriv): void;
    abstract drop(dragged: Deriv): void;
    
    /** In relative world coordinates */
    static getElementRect(deriv: Deriv): { left: number, top: number, width: number, height: number } {
        throw new Error('Abstract static method not implemented.');
    }

    /** In absolute world coordinates */
    // Overwritten in child. So it doesn't have to match getElementRect!
    get rect(): { left: number, top: number, width: number, height: number } {
        const render = this.deriv.render;
        const er = (this.constructor as typeof ZoneData).getElementRect(this.deriv);
        return {
            ...er,
            left: render.x + er.left,
            top: render.y + er.top,
        };
    }
}

// Used below in getElementRect methods
const row2height = (row: number) => row * DT.derivRowOffsetN - DT.derivBarBottomN;

export const zoneTypes = {
    // ---- ROOT ----
    root: class RootZoneData extends ZoneData {
        readonly type = 'root';
        readonly deriv: Deriv;
        readonly childIndex: number;

        constructor(deriv: Deriv, childIndex: number) {
            super();
            this.deriv = deriv;
            this.childIndex = childIndex;
        }

        enter(dragged: Deriv): void {
            // ...
        }
        exit(dragged: Deriv): void {
            // ...
        }
        drop(dragged: Deriv): void {
            // ...
        }

        // One elementRect (and thus one dropzone component is shared among siblings)
        // But the ZoneData instance and rect is per child
        static getElementRect(deriv: Deriv): { left: number; top: number; width: number; height: number; } {
            const left = -deriv.render.width / 2 - DT.derivDropZonePaddingN;
            return { left, top: row2height(0), width: -2 * left, height: DT.derivRowOffsetN };
        }
    },
    
    // ---- BOTTOM ----
    bottom: class BottomZoneData extends ZoneData {
        readonly type = 'bottom';
        readonly deriv: Deriv;

        constructor(deriv: Deriv) {
            super();
            this.deriv = deriv;
        }

        enter(dragged: Deriv): void {
            // ...
        }
        exit(dragged: Deriv): void {
            // ...
        }
        drop(dragged: Deriv): void {
            // ...
        }

        // One elementRect (and thus one dropzone component is shared among siblings)
        // But the ZoneData instance and rect is per child
        static getElementRect(deriv: Deriv): { left: number; top: number; width: number; height: number; } {
            const left = -Math.min(deriv.render.width / 2 + DT.derivDropZonePaddingN, deriv.render.barWidth / 2);
            return { left, top: row2height(1), width: -2 * left, height: DT.derivRowOffsetN };
        }
    },
    
    // ---- TOP ----
    top: class TopZoneData extends ZoneData {
        readonly type = 'top';
        readonly deriv: Deriv;

        constructor(deriv: Deriv) {
            super();
            this.deriv = deriv;
        }

        enter(dragged: Deriv): void {
            // ...
        }
        exit(dragged: Deriv): void {
            // ...
        }
        drop(dragged: Deriv): void {
            // ...
        }

        // One elementRect (and thus one dropzone component is shared among siblings)
        // But the ZoneData instance and rect is per child
        static getElementRect(deriv: Deriv): { left: number; top: number; width: number; height: number; } {
            const left = -deriv.render.barWidth / 2;
            return { left, top: row2height(-1), width: -2 * left, height: DT.derivRowOffsetN };
        }
    },

    // ---- CHILD ----
    child: class ChildZoneData extends ZoneData {
        readonly type = 'child';
        readonly deriv: Deriv;
        readonly childIndex: number;

        constructor(deriv: Deriv, childIndex: number) {
            super();
            this.deriv = deriv;
            this.childIndex = childIndex;
        }

        enter(dragged: Deriv): void {
            // ...
        }
        exit(dragged: Deriv): void {
            // ...
        }
        drop(dragged: Deriv): void {
            // ...
        }

        // One elementRect (and thus one dropzone component is shared among siblings)
        // But the ZoneData instance and rect is per child
        static getElementRect(deriv: Deriv): { left: number; top: number; width: number; height: number; } {
            const c0r = deriv.children[0].render;
            const left = Math.min(-deriv.render.barWidth / 2, c0r.x - deriv.render.x - c0r.width / 2 - DT.derivDropZonePaddingN);
            return { left, top: row2height(-1), width: -2 * left, height: DT.derivRowOffsetN };
        }
        
        get rect() {
            const d = this.deriv;
            const er = ChildZoneData.getElementRect(this.deriv);
            
            // Centers of left and right siblings
            const leftCenter  = d.children[this.childIndex - 1]?.render?.x ?? -Infinity;
            const rightCenter = d.children[this.childIndex    ]?.render?.x ??  Infinity;

            const left = Math.max(d.render.x + er.left, leftCenter);
            const right = Math.min(d.render.x - er.left, rightCenter);
            return {
                left,
                top: d.render.y + er.top,
                width: right - left,
                height: er.left,
            };
        }
    },
};