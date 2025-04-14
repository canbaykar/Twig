import type Deriv from "$lib/state/deriv.svelte";
import { DT } from "../../../../../DT";
import { dropzonePositioner, type DropzoneType } from "./dropzones.svelte";

////////////// Redifine DropzoneType

abstract class ZoneData {
    abstract readonly type: DropzoneType;
    abstract readonly owner: Deriv;
    abstract enter(dragged: Deriv): void;
    abstract exit(dragged: Deriv): void;
    abstract drop(dragged: Deriv): void;

    get rect(): { left: number, right: number, top: number, bottom: number } {
        const pos = dropzonePositioner[this.type](this.owner);
        const render = this.owner.render;

        let left = render.x + pos.left;
        let right = render.x - pos.left;
        const top = render.y + pos.top;
        return {
            top, left, right,
            bottom: top - DT.derivRowOffsetN,
        };
    }
}

export const zoneTypes = {
    child: class ChildZoneData extends ZoneData {
        readonly type = 'child';
        readonly owner: Deriv;
        readonly childIndex: number;

        constructor(owner: Deriv, childIndex: number) {
            super();
            this.owner = owner;
            this.childIndex = childIndex;
        }

        get rect(): { left: number; right: number; top: number; bottom: number; } {
            const srect = super.rect;
            const c = this.owner.children;
            // Centers of left and right siblings
            const leftCenter  = c[this.childIndex - 1]?.render?.x ?? -Infinity;
            const rightCenter = c[this.childIndex    ]?.render?.x ??  Infinity;
            srect.left = Math.max(srect.left, leftCenter);
            srect.right = Math.min(srect.right, rightCenter);
            return srect;
        }
    }
};