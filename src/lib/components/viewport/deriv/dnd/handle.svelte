<script lang="ts">
	import Deriv from '$lib/state/deriv.svelte';
    import GripVertical from '~icons/lucide/grip-vertical';
	import type { DraggableOptions } from '$lib/utils/interact/draggable.svelte';
	import draggable from '$lib/utils/interact/draggable.svelte';
	import viewport from '$lib/state/viewport.svelte';
	import { DT } from '../../../../../DT';
	import { IndicatorPopup } from './indicatorPopup.svelte';
	import { dragLog } from '../deriv.svelte';

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
            if (data.parent === viewport)
                // Detach & reattach to get to front
                data.attach(viewport); 
            else {
                const x = data.render.x;
                const y = data.render.y;
                data.attach(viewport);
                data.render.xTransform = x;
                data.render.yTransform = y;
            }
            dragged = true;
            dragLog(true);

            // let activeZone: null | Element = null;
            // function updateActiveZone(val: null | Element) {
            //     if (val && !val.classList.contains("dropzone")) val = null;
            //     if (val === activeZone) return;
            //     if (activeZone) activeZone.classList.remove('active-dropzone');
            //     if (val) val.classList.add('active-dropzone');
            //     activeZone = val;
            // }

            const indicator = new IndicatorPopup();
            indicator.height = DT.derivRowOffsetN;

            function updateIndicator() {
                indicator.left = data.render.x - data.render.width / 2;
                indicator.top = data.render.y - DT.derivBarBottomN;
                indicator.width = data.render.width;
                indicator.opacity = 1;
            }
            updateIndicator();

            return {
                move(e) {
                    updateIndicator();

                    const cl2wrld = viewport.render.cl2wrld;
                    const wrld2cl = viewport.render.wrld2cl;
                    
                    // Move
                    data.render.xTransform += cl2wrld.scale(e.dx);
                    data.render.yTransform += cl2wrld.scale(e.dy);
                    
                    // Root formula center
                    const x = data.render.x;
                    const y = data.render.y - DT.derivLineHeightN / 2;
                    const el = document.elementFromPoint(
                        wrld2cl.x(x),
                        wrld2cl.y(y),
                    );

                    // updateActiveZone(el);
                },

                end(e) {
                    dragged = false;
                    dragLog(false);

                    // const zone = activeZone;
                    // updateActiveZone(null);

                    indicator.detach();

                    // if (!(zone instanceof HTMLElement)) return;
                    // const adr = zone.dataset.address;
                    // if (typeof adr !== 'string') return;
                    // console.log(Deriv.lookup(adr)?.conc);
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
