<script lang="ts">
	import Deriv from '$lib/state/deriv.svelte';
    import GripVertical from '~icons/lucide/grip-vertical';
	import type { DraggableOptions } from '$lib/utils/interact/draggable.svelte';
	import draggable from '$lib/utils/interact/draggable.svelte';
	import viewport from '$lib/state/viewport.svelte';
	import { DT } from '../../../../../DT';
	import { IndicatorPopup } from './indicatorPopup.svelte';
	import { dragLog } from '../deriv.svelte';
	import { dropzonePositioner, type DropzoneType } from './dropzones.svelte';

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

    interface ZoneData_ {
        deriv: Deriv;
        type: DropzoneType;
        childIndex: number;
    }

    /** Takes in world coords, not screen! */
    function ZDFromPoint(x: number, y: number): ZoneData_ | null {
        const wrld2cl = viewport.render.wrld2cl;
        const el = document.elementFromPoint(wrld2cl.x(x), wrld2cl.y(y));
        // if ((el instanceof HTMLElement) && !el.classList.contains('dropzone')) console.log(el)
        if (!(el instanceof HTMLElement) || !el.classList.contains('dropzone')) 
            return null;
        
            const type = el.dataset.type as DropzoneType | undefined;
            const adr = el.dataset.address;
            if (!type || !adr) return null;
            const deriv = Deriv.lookup(adr);
            if (!deriv) return null;

            switch (type) {
                case 'child':
                    for (let i = deriv.children.length - 1; i >= 0; i--)
                        if (x > deriv.children[i].render.x)
                            return { childIndex: i + 1, deriv, type: 'child' };
                    return { childIndex: 0, deriv, type: 'child' };
                case 'top':
                    return { childIndex: 0, deriv, type: 'top' };
                case 'root':
                    return { childIndex: x > deriv.render.x ? 1 : 0, deriv, type: 'root' };
                default: // case 'bottom'
                    return { childIndex: 0, deriv, type: 'bottom' };
            }
    }

    function getRect(zd: ZoneData_) {
        const pos = dropzonePositioner[zd.type](zd.deriv);
        const render = zd.deriv.render;

        let left = render.x + pos.left;
        let right = render.x - pos.left;
        console.log({left, ...zd})
        if (zd.type === 'child') {
            const c = zd.deriv.children;
            // Centers of left and right siblings
            const leftCenter  = c[zd.childIndex - 1]?.render?.x ?? -Infinity;
            const rightCenter = c[zd.childIndex    ]?.render?.x ??  Infinity;
            left = Math.max(left, leftCenter);
            right = Math.min(right, rightCenter);
        }

        const top = render.y + pos.top;
        return {
            top, left, right,
            bottom: top - DT.derivRowOffsetN,
        };
    }
    function rectHovered(
        x: number, y: number, 
        rect: { left: number, right: number, top: number, bottom: number }
    ) {
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    }

    function ZDNStart(zdn: ZoneData_ | null) {
        if (!zdn) return;
        switch (zdn.type) {
            case 'root':
                // ...
            case 'bottom':
                // ...
            default:
                // ...
        }
    }
    function ZDNEnd(zdn: ZoneData_ | null) {
        if (!zdn) return;
        switch (zdn.type) {
            case 'root':
                // ...
            case 'bottom':
                // ...
            default:
                // ...
        }
    }
    function ZDNMove(zdn: ZoneData_ | null, dx: number, dy: number) {
        if (!zdn) return;
        switch (zdn.type) {
            case 'bottom':
                // ...
            default:
                // ...
        }
    }
    
    function indicateDragged(ind: IndicatorPopup, opacity = 1) {
        ind.left = data.render.x - data.render.width / 2;
        ind.top = data.render.y - DT.derivBarBottomN;
        ind.width = data.render.width;
        ind.opacity = opacity;
    }
    
    const opt: DraggableOptions = {
        cursor: "all-scroll",
        start(e) {
            dragged = true;
            dragLog(true);

            // Rectangle popup that indicates where the deriv goes when dropped
            const indicator = new IndicatorPopup();
            indicator.height = DT.derivRowOffsetN;
            indicateDragged(indicator);

            // Null when not free or not over zone
            let zdn: ZoneData_ | null = null;
            function updateDND() {
                const par = data.parent;
                const x = data.render.x;
                const y = data.render.y;

                // If zd not changed, do nothing
                if (zdn && rectHovered(x, y, getRect(zdn))) return;

                zdn = ZDFromPoint(x, y);
            }

            return {
                move(e) {
                    const cl2wrld = viewport.render.cl2wrld;
                    data.render.xTransform += cl2wrld.scale(e.dx);
                    data.render.yTransform += cl2wrld.scale(e.dy);

                    updateDND();
                },

                end(e) {
                    dragged = false;
                    dragLog(false);

                    updateDND();

                    indicator.detach();
                }
            };
        },
    };
    
    // function indicateZD(a: ZoneData, ind: IndicatorPopup) {
    //     if (!a) {
    //         // If a is null, make ind invisible but keep it on dragged deriv for animation
    //         indicateDragged(ind, 0);
    //         return;
    //     }
    //     const pos = dropzonePositioner[a.type](a.deriv);
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