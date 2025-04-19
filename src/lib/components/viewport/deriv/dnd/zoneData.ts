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
        // But the ZoneData instance is per child
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
    },
};