<script module lang="ts">
	import Deriv, { addExampleProof } from "$lib/state/deriv.svelte";
	import type { Viewport } from "$lib/state/viewport.svelte";
	import { onDestroy } from "svelte";
	import DerivC, { listeners } from "./deriv/derivC.svelte";
	import DerivRenderData from "./deriv/renderData.svelte";
	import Panzoom from "./panzoom/panzoom.svelte";
	import { mouse } from "$lib/utils/interact/mouse.svelte";
	import { bgDependency } from "./deriv/dnd/bg.svelte";

	type Listener<K extends keyof HTMLElementEventMap> 
		= (ev: HTMLElementEventMap[K] & { deriv: Deriv }) => void;
	type LayoutListener <K extends keyof HTMLElementEventMap> 
		= (ev: HTMLElementEventMap[K] & { deriv: Deriv }, listener: Listener<K>) => void;

	/** 
	 * Type for different parts' listeners to be managed by viewport. (See part + uid 
	 * system in deriv render data.) Only listeners in part "layout" can take a 2nd 
	 * argument, I just couldn't enfore it with TS.
	 */
	export type Listeners = {
		[part: string]: {
			[K in keyof HTMLElementEventMap]?: LayoutListener<K>;
		};
	};

	function callListener<K extends keyof HTMLElementEventMap>(type: K, part: string, deriv: Deriv, evt: HTMLElementEventMap[K]) {
		const e = Object.assign(evt, { deriv });
		const layoutListener = listeners["layout"]?.[type] ?? ((e, l) => l(e));
		layoutListener(e, listeners[part]?.[type] ?? (() => {}) as any);
	}
</script>

<script lang="ts">
    interface Props {
        viewport: Viewport;
    }
    
    let { viewport }: Props = $props();

    viewport.detachAll();
    addExampleProof();

    // Lifecycle hooks
    mouse.init();
    onDestroy(() => DerivRenderData.onDestroy());

	// --- Implementations of hovered & Selected ---
    // Update hovered for both viewport and derivs if its changed. These are also used for
	// some drag events below to cover the case of formula text selection being dragged.
	function onmouseover(e: MouseEvent) { 
        const { deriv, bar } = DerivRenderData.lookup(e.target);
        if (viewport.render.dragging) return;
		viewport.render.hover(deriv, bar);
	}
    function onmouseleave(e: MouseEvent) {
		// When this is called in ondragleave, it fires in child elements too even tho
		// this function is for leaving viewport only, hence the 2nd check
		if (!viewport.render.hovered || e.relatedTarget) return;
        viewport.render.hover(null);
    }

	let lastTarget: ReturnType<typeof DerivRenderData.lookup> 
		= { deriv: null, part: null, bar: false };
	function onmousedown(e: MouseEvent) {
		const { deriv, part, bar } = lastTarget = DerivRenderData.lookup(e.target);
		if (deriv && !deriv.render.isSelected(bar)) 
			viewport.render.selectOnly(deriv, bar);
		if (deriv) callListener("mousedown", part, deriv, e);
	}
	function onmouseup(e: MouseEvent) {
		const { deriv, part, bar } = DerivRenderData.lookup(e.target);
		if (
			viewport.render.dragging ||
			// When you start a text selection and move cursor to viewport, it should deselect.
			// Although this doesn't solve the problem of cursor changing.
			lastTarget.deriv !== deriv || 
			lastTarget.part !== part
		) return;
		viewport.render.selectOnly(deriv, bar);
		if (deriv) callListener("mouseup", part, deriv, e);
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
		onStart={() => viewport.render.dragLog(true)}
		onEnd={() => viewport.render.dragLog(false)}
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