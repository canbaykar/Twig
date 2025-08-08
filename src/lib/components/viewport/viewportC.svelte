<script lang="ts">
	import Deriv, { addExampleProof } from "$lib/state/deriv.svelte";
	import type { Viewport } from "$lib/state/viewport.svelte";
	import { onDestroy } from "svelte";
	import DerivC from "./deriv/derivC.svelte";
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
        const hovered = DerivRenderData.lookup(e.target).deriv;
        if (hovered === viewport.render.hovered) return;

        // @ts-expect-error
        if (viewport.render.hovered) viewport.render.hovered.render.hovered = false;
        // @ts-expect-error
        viewport.render.hovered = DerivRenderData.lookup(e.target).deriv;
        // @ts-expect-error
        if (hovered) hovered.render.hovered = true;
	}
    function onmouseleave(e: MouseEvent) {
		// When this is called in ondragleave, it fires in child elements too even tho
		// this function is for leaving viewport only, hence the 2nd check
		if (!viewport.render.hovered || e.relatedTarget) return;
        // @ts-expect-error
        viewport.render.hovered.render.hovered = false;
        // @ts-expect-error
        viewport.render.hovered = null;
    }

    function onmousedown(e: MouseEvent) {
        const clicked = DerivRenderData.lookup(e.target).deriv;
        if (clicked && viewport.render.selected.includes(clicked)) return;
        updateSelected(clicked);
    }
    function onmouseup(e: MouseEvent) {
        const clicked = DerivRenderData.lookup(e.target).deriv;
        if (!clicked) return;
        updateSelected(clicked);
    }
    function updateSelected(clicked: Deriv | null) {
        // @ts-expect-error
        for (const deriv of viewport.render.selected) deriv.render.selected = false;
        // @ts-expect-error
        viewport.render.selected = clicked ? [clicked] : [];
        // @ts-expect-error
        if (clicked) clicked.render.selected = true;
    }
</script>

{@render bgDependency()}

<!-- The :global(.hover) class is used to determine when non-DND hover effects should happen -->
<!-- See deriv.renderData.lookup for data-part -->
<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<div
	bind:this={viewport.render.element}
    class="font-math w-full h-full overflow-hidden"
    class:dragging={viewport.render.dragging}
    class:hover={!viewport.render.dragging}
	{onmouseover}
	{onmouseleave}
	ondragover={onmouseover}
	ondragleave={onmouseleave}
	{onmousedown}
	{onmouseup}
	role="presentation"
	data-part="viewport"
>
    <Panzoom
        data={viewport.render}
    >
        {#each DerivRenderData.displayed as data (data)}
            <DerivC {data}></DerivC>
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