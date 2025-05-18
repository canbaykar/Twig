<script lang="ts">
	import Deriv from '$lib/state/deriv.svelte';
    import GripVertical from '~icons/lucide/grip-vertical';
	import type { DraggableOptions } from '$lib/utils/interact/draggable.svelte';
	import draggable from '$lib/utils/interact/draggable.svelte';
	import viewport from '$lib/state/viewport.svelte';
	import { DT } from '../../../../../DT';
	import { IndicatorPopup } from './indicatorPopup.svelte';
	import { zoneTypes, type ZoneData, type ZoneType } from './zoneData';
	import { zoneDataFromPoint } from './dropzones.svelte';

    interface Props {
        data: Deriv;
        [key: string]: any;
    }
    
    let {
        data, 
        ...restProps
    }: Props = $props();
    
    const opt: DraggableOptions = {
        cursor: "all-scroll",
        start(e) {
            data.render.dragged = true;
            viewport.render.dragLog(true);

            // null: free, else: bound (assumes parent can't be null while dragging!)
            const free = () => data.parent === viewport;
            let zd: ZoneData | null = free() ? null : new zoneTypes.initial(data);

            // Rectangle popup that indicates current binding zone rect
            const indicator = new IndicatorPopup();

            function updateZD() {
                const x = data.render.x;
                const y = data.render.y;

                // Did we exit a zone?
                if (zd && !inBoundingRect(data, x, y)) {
                    zd.exit(data);
                    zd = null;
                }

                // Did we enter a zone? (single = isn't typo!)
                if (!zd && (zd = zoneDataFromPoint(x, y))) {
                    zd.enter(data);
                }

                // Enter and exit functions may have moved dragged as a side effect
                // of attaching-detaching.
                data.render.moveTo(x, y);

                indicateBoundingRect(data, zd, indicator);
            }

            return {
                move(e) {
                    const cl2wrld = viewport.render.cl2wrld;
                    data.render.xTransform += cl2wrld.scale(e.dx);
                    data.render.yTransform += cl2wrld.scale(e.dy);

                    updateZD();
                },

                end(e) {
                    data.render.dragged = false;
                    viewport.render.dragLog(false);

                    updateZD();
                    if (zd) zd.drop(data);

                    // Reset stuff used for DND
                    if (data.parent !== viewport)
                        data.render.xTransform = data.render.yTransform = 0;
                    data.render.treeOverwrite = null;

                    indicator.detach();
                }
            };
        },
    };

    function getBindingRect(d: Deriv) {
        // Half width
        const w2 = d.render.width / 2 + DT.derivDropZonePaddingN;
        // TODO: Change DerivRenderData so as to remove these two
        const xBase = d.render.x - d.render.xTransform;
        const yBase = d.render.y - d.render.yTransform;
        let left  = xBase - w2;
        let right = xBase + w2;

        // Stretch rect to neighbouring siblings' centers or to ends
        // of the parent's child zone
        if (d.parent instanceof Deriv) {
            const zoneRect = zoneTypes["child"].getElementRect(d.parent);
            zoneRect.left += d.parent.render.x;

            const prevSib = d.parent.children[d.childIndex - 1];
            left = Math.min(left, prevSib ? prevSib.render.x : zoneRect.left);

            const nextSib = d.parent.children[d.childIndex + 1];
            right = Math.max(right, nextSib ? nextSib.render.x : zoneRect.left + zoneRect.width);
        }

        const delta = DT.derivDropZonePaddingN / 6;
        return {
            left,
            top: yBase - DT.derivBarBottomN - delta,
            width: right - left,
            height: DT.derivRowOffsetN + delta * 2,
        };
    }

    function inBoundingRect(d: Deriv, x: number, y: number) {
        const r = getBindingRect(d);
        return y >= r.top && y - r.top <= r.height && x >= r.left && x - r.left <= r.width;
    }

    function indicateBoundingRect(dragged: Deriv, zd: ZoneData | null, ind: IndicatorPopup) {
        if (zd) {
            const r = getBindingRect(dragged);
            ind.left = r.left;
            ind.top = r.top;
            ind.width = r.width;
            ind.height = r.height;
            ind.opacity = 1;
        } else {
            // If zd is null, make ind invisible but keep it on dragged deriv for animation
            ind.opacity = 0;
            ind.left = data.render.x - data.render.width / 2;
            ind.top = data.render.y - DT.derivBarBottomN;
            ind.width = data.render.width;
            ind.height = DT.derivRowOffsetN;
        } 
    }
</script>

<!-- TODO: Remove "relative!" -->
<div
    {...restProps}
    use:draggable={opt}
    class="handle inset-y-0 cursor-all-scroll flex items-center {restProps?.class ?? ''}"
>
    <GripVertical width="0.75em" height="0.75em" class="relative!" />
</div>

<style>
    :global(.deriv) .handle {
        opacity: 0;
    }
    :global(.deriv.dragged) .handle,
    :global(.deriv:hover) .handle {
        opacity: 1;
    }
</style>