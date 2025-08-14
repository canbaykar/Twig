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
</script>

<!-- Draggable button, grabbed when clicked -->
<button
	class="bottom-0 translate-x-[-50%] cursor-default px-(--DERIV-X-PADDING) leading-(--DERIV-LINE-HEIGHT) h-(--DERIV-LINE-HEIGHT) select-none whitespace-nowrap"
	bind:this={element}
	tabindex="-1"
>
	<!-- For some reason this element's slightly taller than expected so we need pointer-events-none to avoid covering bars -->
	<span class="contents whitespace-pre pointer-events-none">{data.conc}</span>

	<!-- EDITOR -->
	{#if data.render.bodyAwake}
		<textarea
			bind:value={data.conc}
			class="caret-fg absolute top-0 left-0 origin-top-left resize-none overflow-hidden text-center text-transparent"
			style="
            line-height: {DT.derivLineHeightN / DT.UNIT * viewport.render.scale}px;
            width: {data.render.baseWidth / DT.UNIT * viewport.render.scale}px;
            font-size: {DT.derivSizeN / DT.UNIT * viewport.render.scale}px;
            scale: {DT.UNIT / viewport.render.scale};
        "
			rows="1"
			data-part="formula"
		></textarea>
	{/if}

	{@render children?.()}
</button>
