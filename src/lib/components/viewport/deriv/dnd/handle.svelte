<script lang="ts">
	import Deriv from '$lib/state/deriv.svelte';
    import GripVertical from '~icons/lucide/grip-vertical';
	import type { DraggableOptions } from '$lib/utils/interact/draggable.svelte';
	import draggable from '$lib/utils/interact/draggable.svelte';
	import viewport from '$lib/state/viewport.svelte';
	import { DT } from '../../../../../DT';
	import { IndicatorPopup } from './indicatorPopup.svelte';
	import { dragLog } from '../deriv.svelte';
	import { zoneTypes, type DropzoneType } from './zoneData';

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

    type DropAction = null | {
        deriv: Deriv;
        type: DropzoneType;
        childIndex: number;
    }

    /** Takes in world coords, not screen! */
    function DAFromPoint(x: number, y: number): DropAction {
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

    function executeDA(a: DropAction) {
        // ...
    }
    
    function indicateDA(a: DropAction, ind: IndicatorPopup) {
        if (!a) {
            // If a is null, make ind invisible but keep it on dragged deriv for animation
            ind.opacity = 0;
            ind.left = data.render.x - data.render.width / 2;
            ind.top = data.render.y - DT.derivBarBottomN;
            ind.width = data.render.width;
            return;
        }
        const pos = zoneTypes[a.type].getElementRect(a.deriv);
        const render = a.deriv.render;
        ind.top = render.y + pos.top;
        ind.opacity = 1;

        const left = render.x + pos.left;
        const right = render.x - pos.left;
        console.log({left, ...a})
        if (a.type !== 'child') {
            ind.left = left;
            ind.width = right - left;
        } else {
            const c = a.deriv.children;
            // Centers of left and right siblings
            const leftCenter  = c[a.childIndex - 1]?.render?.x ?? -Infinity;
            const rightCenter = c[a.childIndex    ]?.render?.x ??  Infinity;
            ind.left = Math.max(left, leftCenter);
            ind.width = Math.min(right, rightCenter) - ind.left;
        }
    }
    
    const opt: DraggableOptions = {
        cursor: "all-scroll",
        start(e) {
            if (data.parent !== viewport) {
                const x = data.render.x;
                const y = data.render.y;
                data.attach(viewport);
                data.render.xTransform = x;
                data.render.yTransform = y;
            }

            dragged = true;
            dragLog(true);

            let dropAction: DropAction = null;
            // Rectangle popup that indicates current dropAction
            const indicator = new IndicatorPopup();
            indicator.height = DT.derivRowOffsetN;

            function updateDA() {
                const x = data.render.x;
                const y = data.render.y;
                dropAction = DAFromPoint(x, y);
                indicateDA(dropAction, indicator); 
            }

            return {
                move(e) {
                    const cl2wrld = viewport.render.cl2wrld;
                    data.render.xTransform += cl2wrld.scale(e.dx);
                    data.render.yTransform += cl2wrld.scale(e.dy);

                    updateDA();
                },

                end(e) {
                    dragged = false;
                    dragLog(false);

                    updateDA();
                    indicator.detach();
                    executeDA(dropAction);
                }
            };
        },
    };
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