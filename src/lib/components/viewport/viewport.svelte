<script lang="ts">
	import { addExampleProof } from "$lib/state/deriv.svelte";
	import type { Viewport } from "$lib/state/viewport.svelte";
	import { onDestroy } from "svelte";
	import Deriv from "./deriv/deriv.svelte";
	import DerivRenderData from "./deriv/renderData.svelte";
	import Panzoom from "./panzoom/panzoom.svelte";
	import { mouse } from "$lib/utils/interact/mouse.svelte";
	import { bgDependency } from "./deriv/bg.svelte";
    
    interface Props {
        viewport: Viewport;
    }
    
    let { viewport }: Props = $props();

    viewport.detachAll();
    addExampleProof();

    // Lifecycle hooks
    mouse.init();
    onDestroy(() => DerivRenderData.onDestroy());

    // Update hovered for both viewport and derivs if its changed.
    // expect-error's are needed because the hovered props are readonly.
    // These are also used for some drag events to cover the case of
    // formula text selection being dragged.
	function onmouseover(e: MouseEvent) { 
        const hovered = DerivRenderData.lookup(e.target);
        if (hovered === viewport.render.hovered) return;

        // @ts-expect-error
        if (viewport.render.hovered) viewport.render.hovered.render.hovered = false;
        // @ts-expect-error
        viewport.render.hovered = DerivRenderData.lookup(e.target);
        // @ts-expect-error
        if (hovered) hovered.render.hovered = true;
	}
    function onmouseleave() {
        if (!viewport.render.hovered) return;
        // @ts-expect-error
        viewport.render.hovered.render.hovered = false;
        // @ts-expect-error
        viewport.render.hovered = null;
    }
</script>

{@render bgDependency()}

<!-- The :global(.hover) class is used to determine non-DND when hover effects should happen -->
<div
	bind:this={viewport.render.element}
    class="font-math w-full h-full overflow-hidden"
    class:dragging={viewport.render.dragging}
    class:hover={!viewport.render.dragging}
>
    <Panzoom
        data={viewport.render}
        {onmouseover}
        {onmouseleave}
        ondragover={onmouseover}
        ondragleave={onmouseleave}
        data-uid={uid.null}
    >
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