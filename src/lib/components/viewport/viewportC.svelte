<script module lang="ts">
	import Deriv, { addExampleProof } from "$lib/state/deriv.svelte";
	import type { Viewport } from "$lib/state/viewport.svelte";
	import { onDestroy, onMount } from "svelte";
	import DerivC, { keyboardListeners, partListeners } from "./deriv/derivC.svelte";
	import DerivRenderState from "./deriv/renderState.svelte";
	import Panzoom from "./panzoom/panzoom.svelte";
	import { mouse } from "$lib/utils/interact/mouse.svelte";
	import { bgDependency } from "./deriv/bg.svelte";
	import { DraggableType, Hover } from "./renderState.svelte";
	import { DT } from "../../../DT";

	type KeyboardListener<K extends keyof HTMLElementEventMap> 
		= (ev: HTMLElementEventMap[K]) => void;
	type PartListener<K extends keyof HTMLElementEventMap> 
		= (ev: HTMLElementEventMap[K] & { deriv: Deriv, part: string, section: string, updateSelecetion: boolean }) => void;
	type LayoutListener <K extends keyof HTMLElementEventMap> 
		= (ev: HTMLElementEventMap[K] & { deriv: Deriv, part: string, section: string, updateSelecetion: boolean }, listener: PartListener<K>) => void;

	/** 
	 * Type for different parts' listeners to be managed by viewport. (See part + uid 
	 * system in deriv render state.) Only listeners in part "layout" can take a 2nd 
	 * argument, I just couldn't enfore it with TS.
	 * 
	 * Supported events for parts and layout: mousedown, mouseup, dblclick
	 */
	export type PartListeners = {
		[part: string]: {
			[K in keyof HTMLElementEventMap]?: LayoutListener<K>;
		};
	};
	/** Fired when using keyboard with viewport (panzoom element) focused */
	export type KeyboardListeners = {
		[K in keyof HTMLElementEventMap]?: KeyboardListener<K>;
	};

	/** Note: Modifies evt argument! (And returns it.) */
	function callListener<K extends keyof HTMLElementEventMap>(
		type: K, part: string | null, section: string | null, deriv: Deriv | null, evt: HTMLElementEventMap[K]
	) {
		const e = Object.assign(evt, { deriv, part, section, updateSelecetion: true });
		if (!deriv || !part) return e;
		const layoutListener = partListeners["layout"]?.[type] ?? ((e, l) => l(e));
		layoutListener(e as any, partListeners[part]?.[type] ?? (() => {}) as any);
		return e;
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
    onDestroy(() => DerivRenderState.onDestroy());

	// Keyboard listeners
	onMount(() => {
		function handler(e: Event, opt?: any) {
			if (document.activeElement === viewport.render.panzoomElement) // @ts-expect-error
				keyboardListeners[e.type](e, opt);
		}
		for (const type in keyboardListeners)
			viewport.render.element!.addEventListener(type, handler);
		return () => {
			for (const type in keyboardListeners)
				viewport.render.element!.removeEventListener(type, handler);
		};
	});

	// --- Implementations of hovered & Selected ---
    // Update hovered for both viewport and derivs if its changed. These are also used for
	// some drag events below to cover the case of formula text selection being dragged.
	// This is called in onmouseup, that uses the dragend argument to overwite the conditional...
	function onmouseover(e: MouseEvent, dragend = false) { 
        const { deriv, part } = DerivRenderState.lookup(e.target);
        if (viewport.render.dragging && !dragend) return;
		viewport.render.hover(deriv, part);
	}
    function onmouseleave(e: MouseEvent) {
		// When this is called in ondragleave, it fires in child elements too even tho
		// this function is for leaving viewport only, hence the 2nd check
		if (!viewport.render.hovered || e.relatedTarget) return;
        viewport.render.hover();
    }

	let lastTarget = new Hover();
	function onmousedown(e: MouseEvent) {
		const { deriv, part, section } = lastTarget = DerivRenderState.lookup(e.target);
		const bar = section === 'bar';
		const e_ = callListener("mousedown", part, section, deriv, e);
		if (e_.updateSelecetion && deriv && !deriv.render.isSelected(bar))
			viewport.render.updateSelectionOnInteraction(e_, deriv, bar);
	}
	function onmouseup(e: MouseEvent) {
		const { deriv, part, section } = DerivRenderState.lookup(e.target);
		if (
			viewport.render.dragging ||
			// When you start a text selection and move cursor to viewport, it shouldn't deselect.
			// Although this doesn't solve the problem of cursor changing.
			lastTarget.deriv !== deriv || 
			lastTarget.part !== part
			// omouseover doesnt update hover while dragging so we have to do it on dragend here
		) return viewport.render.hover(deriv, part);
		const e_ = callListener("mouseup", part, section, deriv, e);
		if (e_.updateSelecetion)
			viewport.render.updateSelectionOnInteraction(e_, deriv, section === 'bar');
	}
	
	function ondblclick(e: MouseEvent) {
		const { deriv, part, section } = lastTarget = DerivRenderState.lookup(e.target);
		if (!deriv) { // Dblclick on background adds new blank deriv
			const { x, y } = viewport.render.mouse;
			const d = new Deriv({ render: { xTranslate: x, yTranslate: y + DT.derivLineHeightN / 2 } });
			d.attach(viewport);
			d.render.focusEditor();
		}
		callListener("dblclick", part, section, deriv, e);
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
	{ondblclick}
	role="presentation"
	data-part="viewport"
>
    <Panzoom
        state={viewport.render}
		onStart={() => viewport.render.dragType = DraggableType.Panzoom}
		onEnd={() => viewport.render.dragType = DraggableType.None}
		bind:element={viewport.render.panzoomElement}
		class="multiSelection-prevent-blur"
    >
        {#each DerivRenderState.displayed as deriv (deriv)}
            <DerivC {deriv}></DerivC>
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