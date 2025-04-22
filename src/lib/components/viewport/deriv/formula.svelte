<script lang="ts">
	import type Deriv from '$lib/state/deriv.svelte';
	import { tick, type Snippet } from 'svelte';
	import { DT } from '../../../../DT';
	import viewport from '$lib/state/viewport.svelte';
	import DerivRenderData from './renderData.svelte';

	interface Props {
		data: Deriv;
		/** For putting any extra elements such as DND handles in the display element */
        children?: Snippet;
	}

	let { data, children }: Props = $props();

	let element: HTMLElement;
	DerivRenderData.maintainWidth(
		() => data.conc,
		() => data.render.baseWidth = element.offsetWidth
	);

	// The "element" can't be used as an input field bc the caret may be too thin on
	// some browser due to how pazoom transforms the element. :(
	// So we have an "editor" element with transparent text that only exists on hover
	// or when it's in focus. It's is slightly mispositioned due to rounding, so it's
	// not the main element that displays the text but just an overlay for caret.
	// (But it also displays selection text.)
	let editorElement: HTMLElement | null = $state(null);

	let editorEnabled = $state(false);
	const enableEditor = () => (editorEnabled = true);
	const disableEditor = () => (editorEnabled = false);

	let draggedOver = false;
	function ondragenter() {
		enableEditor();
		draggedOver = true;
	}
	function ondragleave() {
		draggedOver = false;
	}

	function onmouseleave(e: MouseEvent) {
		if (
			draggedOver ||
			element?.contains?.(e.relatedTarget as Node | null) ||
			element?.contains?.(document.activeElement)
		)
			return;
		disableEditor();
	}
	async function onfocus() {
		enableEditor();
		// await tick();
		// // Do nothing if focus changed while awaiting
		// if (document.activeElement !== element) return;
		// editorElement?.focus?.();
	}
	function onblur() {
		if (!element?.matches?.(':hover')) disableEditor();
	}

	// For debugging
	function ondblclick() { // @ts-ignore
		console.log(data.render.tree);
	}
</script>

<!-- Draggable button, grabbed when clicked -->
<button
	class="bottom-0 translate-x-[-50%] cursor-default px-(--DERIV-X-PADDING) leading-(--DERIV-LINE-HEIGHT) select-none"
	class:bg-bg-danger-emphasis={data.logic.conc instanceof Error}
	bind:this={element}
	onmouseenter={enableEditor}
	{ondragenter}
	{ondragleave}
	{onmouseleave}
	{onfocus}
	{ondblclick}
	tabindex="-1"
>
	{data.conc}

	<!-- EDITOR -->
	{#if editorEnabled}
		<textarea
			bind:value={data.conc}
			class="caret-fg absolute top-0 left-0 origin-top-left resize-none overflow-hidden text-center text-transparent"
			style="
            line-height: {(DT.derivLineHeightN / DT.UNIT) * viewport.render.scale}px;
            width: {(data.render.baseWidth / DT.UNIT) * viewport.render.scale}px;
            font-size: {(DT.derivSizeN / DT.UNIT) * viewport.render.scale}px;
            scale: {DT.UNIT / viewport.render.scale};
        "
			bind:this={editorElement}
			{onblur}
			rows="1"
		></textarea>
	{/if}

	{@render children?.()}
</button>
