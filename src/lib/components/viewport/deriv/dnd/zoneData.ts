import type Deriv from "$lib/state/deriv.svelte";
import viewport from "$lib/state/viewport.svelte";
import { DT } from "../../../../../DT";
import { defaultAnchor } from "../renderData.svelte";

// Following doesn't work due to circularity, update manually
// export type ZoneType = keyof typeof zoneTypes;
export type ZoneType = "initial" | "top" | "child";

export type ZoneData = InstanceType<typeof zoneTypes[ZoneType]>;

// Dragged element makes instances of this (some class that extends ZoneData). 
// Dropzone components/elements don't have instances because they may represent multiple zones.
abstract class ZoneDataBase {
    readonly deriv: Deriv;
    abstract readonly type: ZoneType;
    enter(dragged: Deriv) {}
    exit(dragged: Deriv) {}
    drop(dragged: Deriv) {}

    constructor(deriv: Deriv) {
        this.deriv = deriv;
    }
    
    /** In relative world coordinates */
    static getElementRect(deriv: Deriv): { left: number, top: number, width: number, height: number } {
        throw new Error("Attempting to getElementRect for zone without element");
    }
}

// Used below in getElementRect methods
const row2height = (row: number) => row * DT.derivRowOffsetN - DT.derivBarBottomN;

export const zoneTypes = {
    // ---- INITIAL ----
    // This is special because it doesn't have an element in dropzones.svelte. So it's not enterable.
    initial: class InitialZoneData extends ZoneDataBase {
        readonly type = 'initial';

        exit(dragged: Deriv): void {
            dragged.attach(viewport);
        }
    },
    
    // ---- TOP ----
    top: class TopZoneData extends ZoneDataBase {
        readonly type = 'top';

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

    // ---- CHILD ----
    child: class ChildZoneData extends ZoneDataBase {
        readonly type = 'child';
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
        // But the ZoneData instance is per child
        static getElementRect(deriv: Deriv): { left: number; top: number; width: number; height: number; } {
            const c0r = deriv.children[0].render;
            const left = Math.min(-deriv.render.barWidth / 2, defaultAnchor(c0r)[0] - deriv.render.x - c0r.width / 2 - DT.derivDropZonePaddingN);
            return { left, top: row2height(-1), width: -2 * left, height: DT.derivRowOffsetN };
        }
    },
    
    // TODO: Implement root and bottom dropzones
    // // ---- ROOT ----
    // root: class RootZoneData extends ZoneDataBase {
    //     readonly type = 'root';
    //     readonly childIndex: number;

    //     constructor(deriv: Deriv, x: number) {
    //         super(deriv);
    //         this.childIndex = x > deriv.render.x ? 1 : 0;
    //     }

    //     enter(dragged: Deriv): void {
    //         dragged.attach(this.deriv, this.childIndex);
    //     }
    //     exit(dragged: Deriv): void {
    //         dragged.attach(viewport);
    //     }

    //     static getElementRect(deriv: Deriv): { left: number; top: number; width: number; height: number; } {
    //         const left = -deriv.render.width / 2 - DT.derivDropZonePaddingN;
    //         return { left, top: row2height(0), width: -2 * left, height: DT.derivRowOffsetN };
    //     }
    // },
    
    // ---- BOTTOM ----
    // bottom: class BottomZoneData extends ZoneDataBase {
    //     readonly type = 'bottom';

    //     enter(dragged: Deriv): void {
    //         // ...
    //     }
    //     exit(dragged: Deriv): void {
    //         // ...
    //     }
    //     drop(dragged: Deriv): void {
    //         // ...
    //     }

    //     // One elementRect (and thus one dropzone component is shared among siblings)
    //     // But the ZoneData instance and rect is per child
    //     static getElementRect(deriv: Deriv): { left: number; top: number; width: number; height: number; } {
    //         const left = -Math.min(deriv.render.width / 2 + DT.derivDropZonePaddingN, deriv.render.barWidth / 2);
    //         return { left, top: row2height(1), width: -2 * left, height: DT.derivRowOffsetN };
    //     }
    // },
} as const;