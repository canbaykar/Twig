<script lang="ts">
	import { addExampleProof } from "$lib/state/deriv.svelte";
	import type { Viewport } from "$lib/state/viewport.svelte";
	import { onDestroy } from "svelte";
	import Deriv from "./deriv/deriv.svelte";
	import DerivRenderData from "./deriv/renderData.svelte";
	import Panzoom from "./panzoom/panzoom.svelte";
	import { mouse } from "$lib/utils/interact/mouse.svelte";
    
    interface Props {
        viewport: Viewport;
    }
    
    let { viewport }: Props = $props();

    viewport.detachAll();
    addExampleProof();

    onDestroy(() => DerivRenderData.onDestroy());
</script>

<!-- The :global(.hover) class is used to determine non-DND when hover effects should happen -->
<div
    class="font-math w-full h-full overflow-hidden"
    class:dragging={viewport.render.dragging}
    class:hover={!viewport.render.dragging}
    use:mouse.action
>
    <Panzoom data={viewport.render}>
        {#each DerivRenderData.displayed as data (data)}
            <Deriv {data}></Deriv>
        {/each}
        
        {#each viewport.render.panzoomPopups.children as popup (popup)}
            <popup.component {popup} {...popup.props} />
        {/each}
        
        {#snippet noPanzoom()}
            {#each viewport.render.popups.children as popup (popup)}
                <popup.component {popup} {...popup.props} />
            {/each}
        {/snippet}
    </Panzoom>
</div>

<style>
    .dragging {
        :global(*) {
            pointer-events: none;
        }
        :global(.dnd) { /* dnd: drag and drop */
            pointer-events: all;
        }
    }
</style>