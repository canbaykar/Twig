<script module lang="ts">
    let dragging = $state(false);
</script>

<script lang="ts">
    import Bar from './bar.svelte';
	import Deriv from '$lib/state/deriv.svelte';
    import Formula from './formula.svelte';
    import GripVertical from '~icons/lucide/grip-vertical';
	import type { DraggableOptions } from '$lib/utils/interact/draggable.svelte';
	import draggable from '$lib/utils/interact/draggable.svelte';
	import viewport from '$lib/state/viewport.svelte';
	import { DT } from '../../../../DT';
	import { IndicatorPopup } from './indicatorPopup.svelte';

    interface Props {
        data: Deriv;
    }
    
    let { data }: Props = $props();

    // Temporary
    let label = $state('1');
    let rule = $state('∧E');
    // let rule = $state('2');
    
    let dragged = $state(false);
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
            dragging = true;
            dragged = true;

            let activeZone: null | Element = null;
            function updateActiveZone(val: null | Element) {
                if (val && !val.classList.contains("dropzone")) val = null;
                if (val === activeZone) return;
                if (activeZone) activeZone.classList.remove('active-dropzone');
                if (val) val.classList.add('active-dropzone');
                activeZone = val;
            }

            const indicator = new IndicatorPopup();
            indicator.left = 10;
            indicator.top = 10;
            indicator.width = 10;
            indicator.height = 10;
            indicator.opacity = 1;

            return {
                move(e) {
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

                    updateActiveZone(el);
                },

                end(e) {
                    dragging = false;
                    dragged = false;

                    const zone = activeZone;
                    updateActiveZone(null);

                    indicator.detach();

                    if (!(zone instanceof HTMLElement)) return;
                    const adr = zone.dataset.address;
                    if (typeof adr !== 'string') return;
                    console.log(Deriv.lookup(adr)?.conc);
                }
            };
        },
    };
</script>

<div 
    class="deriv"
    class:dragged
    style:translate="{data.render.x}px {data.render.y}px" 
    style:z-index={data.render.zId}
    data-address={data.address}
>
    <Formula {data}>
        {@render handle("right-[100%]")}
        {@render handle("left-[100%]")}
    </Formula>
    <Bar {data} {rule} {label} />

    {@render dropzones()}
</div>

<!-- SNIPPETS -->
<!-- TODO: Remove relative! -->
{#snippet handle(tw: string)}
    <div use:draggable={opt} class="{tw} popup inset-y-0 cursor-all-scroll flex items-center">
        <GripVertical width="0.75em" height="0.75em" class="relative!" />
    </div>
{/snippet}

{#snippet dropzones()}
    {#if dragging}
        {@const r = data.render}
        {@const padding = 0.75 * DT.derivRowOffsetN}
        {@const barWidth2 = r.barWidth / 2}
        {#if data.root === data}
            {@const right = r.width / 2 + padding}
            <!-- Root -->
            {@render dropzone(-right, right, 0)}
            <!-- Bottom -->
            {@render dropzone(Math.max(-barWidth2, -right), Math.min(barWidth2, right), -1)}
        {/if}

        {@const N = data.children.length - 1}
        {#if N === -1}
            <!-- Top -->
            {@render dropzone(-barWidth2, barWidth2)}
        {:else}
            {@const x = r.x}
            {@const c0r = data.children[0].render}
            {@const cNr = data.children[N].render}
            <!-- Leaf -->
            {@render dropzone(Math.min(-barWidth2, c0r.x - x - c0r.width / 2 - padding), Math.max(cNr.x - x + cNr.width / 2 + padding, barWidth2))}
        {/if}
    {/if}
{/snippet}

{#snippet dropzone(left: number, right: number, y = 1)}
    <div
        class="dropzone outline-10 h-(--DERIV-ROW-OFFSET) bg-amber-500/10 [.active-dropzone]:bg-sky-500/10"
        style:left="{left}px"
        style:width="{right - left}px"
        style:bottom="{(y - 1) * DT.derivRowOffsetN + DT.derivBarBottomN}px"
        data-address={data.address}
    ></div>
{/snippet}

<style>
    /* Preprocessor removes it if I do ".popup" 😑 */
    .deriv :global(.popup) {
        opacity: 0;
    }
    .dragged :global(.popup),
    .deriv:hover :global(.popup) {
        opacity: 1;
    }
    .dragged {
        pointer-events: none;
    }
</style>
