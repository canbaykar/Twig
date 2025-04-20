<script lang="ts">
	import Deriv from '$lib/state/deriv.svelte';
    import GripVertical from '~icons/lucide/grip-vertical';
	import type { DraggableOptions } from '$lib/utils/interact/draggable.svelte';
	import draggable from '$lib/utils/interact/draggable.svelte';
	import viewport from '$lib/state/viewport.svelte';
	import { DT } from '../../../../../DT';
	import { IndicatorPopup } from './indicatorPopup.svelte';
	import { dragLog } from '../deriv.svelte';
	import { zoneTypes, type ZoneData, type ZoneType } from './zoneData';
	import { ZoneDataFromPoint } from './dropzones.svelte';

    interface Props {
        data: Deriv;
        /** ($bindable) Is the deriv dragged? */
        dragged?: boolean;
        [key: string]: any;
    }
    
    let {
        data, 
        dragged = $bindable(false),
        ...restProps
    }: Props = $props();
    
    const opt: DraggableOptions = {
        cursor: "all-scroll",
        start(e) {
            dragged = true;
            dragLog(true);

            // null: free, else: bound
            const zd = data.parent === viewport ? null : new zoneTypes.initial(data);

            function updateZD() {
                
            }

            return {
                move(e) {
                    const cl2wrld = viewport.render.cl2wrld;
                    data.render.xTransform += cl2wrld.scale(e.dx);
                    data.render.yTransform += cl2wrld.scale(e.dy);

                    updateZD();
                },

                end(e) {
                    dragged = false;
                    dragLog(false);

                    updateZD();

                    if (data.parent !== viewport)
                        data.render.xTransform = data.render.yTransform = 0;
                }
            };
        },
    };

    function getBindingRect(d: Deriv) {
        // Half width
        const w2 = d.render.width / 2 + DT.derivDropZonePaddingN;
        let left  = d.render.x - w2;
        let right = d.render.x + w2;

        // Extend rect to neighbouring siblings' centers
        if (d.parent instanceof Deriv) {
            const prevSib = d.parent.children[d.childIndex - 1];
            if (prevSib) left = Math.min(left, prevSib.render.x);

            const nextSib = d.parent.children[d.childIndex + 1];
            if (nextSib) right = Math.max(right, nextSib.render.x);
        }

        return {
            left,
            top: d.render.y - DT.derivRowOffsetN,
            width: right - left,
            height: DT.derivRowOffsetN + DT.derivDropZonePaddingN / 3,
        };
    }
    
    // function indicateDA(a: ZoneData | null, ind: IndicatorPopup) {
    //     if (!a) {
    //         // If a is null, make ind invisible but keep it on dragged deriv for animation
    //         ind.opacity = 0;
    //         ind.left = data.render.x - data.render.width / 2;
    //         ind.top = data.render.y - DT.derivBarBottomN;
    //         ind.width = data.render.width;
    //         return;
    //     }
    //     const pos = zoneTypes[a.type].getElementRect(a.deriv);
    //     const render = a.deriv.render;
    //     ind.top = render.y + pos.top;
    //     ind.opacity = 1;

    //     const left = render.x + pos.left;
    //     const right = render.x - pos.left;
    //     console.log({left, ...a})
    //     if (a.type !== 'child') {
    //         ind.left = left;
    //         ind.width = right - left;
    //     } else {
    //         const c = a.deriv.children;
    //         // Centers of left and right siblings
    //         const leftCenter  = c[a.childIndex - 1]?.render?.x ?? -Infinity;
    //         const rightCenter = c[a.childIndex    ]?.render?.x ??  Infinity;
    //         ind.left = Math.max(left, leftCenter);
    //         ind.width = Math.min(right, rightCenter) - ind.left;
    //     }
    // }
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