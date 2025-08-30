<script module lang="ts">
	import { type BgType } from './bg.svelte';
	export { formulaBg };
</script>

<script lang="ts">
	import type Deriv from '$lib/state/deriv.svelte';
	import { DT } from '../../../../DT';
	import viewport from '$lib/state/viewport.svelte';
	import DerivRenderState from './renderState.svelte';

	interface Props {
		deriv: Deriv;
	}

	let { deriv: deriv }: Props = $props();

	let element: HTMLElement;
	DerivRenderState.maintainWidth(
		() => deriv.conc,
		() => deriv.render.baseWidth = element.offsetWidth
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
	<span 
		class="relative! whitespace-pre pointer-events-none"
		class:opacity-25={deriv.render.bodyMuted}
	>{deriv.conc}</span>

	<!-- EDITOR -->
	<!-- TODO: Outline & border radius styling code too unorganised -->
	{#if deriv.render.bodyAwake}
		<textarea
			bind:value={deriv.conc}
			class="
				caret-fg absolute top-0 left-0 origin-top-left resize-none overflow-hidden text-center text-transparent
				outline-0 outline-fg outline-dashed focus:outline-1 -outline-offset-1 rounded-[calc(var(--DERIV-BG-PADDING)/16)]
			"
			style="
            line-height: {DT.derivLineHeightN / DT.UNIT * viewport.render.scale}px;
            width: {deriv.render.baseWidth / DT.UNIT * viewport.render.scale}px;
            font-size: {DT.derivSizeN / DT.UNIT * viewport.render.scale}px;
            scale: {DT.UNIT / viewport.render.scale};
        "
			rows="1"
			data-part="body_formula"
		></textarea>
	{/if}
</button>

<!-- BG -->
{#snippet formulaBg(deriv: Deriv, type: BgType)}
	{@const pad2 = 2 * DT.derivBgPaddingN}
	{@const offY = -DT.derivLineHeightN - DT.derivBgPaddingN}
	{@const minRx = (DT.derivLineHeightN + pad2) / 2}
	<!-- The whole handle section should be as thick as bar bg -->
	<!-- This padding covers what need to be added on top of the regular padding (bgPadding) -->
	{@const handlePad = DT.UNIT + DT.derivBgPaddingN}
	{@const handlePad2 = handlePad * 2}

	<rect
		x={deriv.render.x - deriv.render.width / 2 - DT.derivBgPaddingN - (+type.extended(deriv)) * handlePad}
		y={deriv.render.y + offY}
		width={deriv.render.width + pad2 + (+type.extended(deriv)) * handlePad2}
		height={DT.derivLineHeightN + pad2}
		rx={Math.min((DT.derivBgPaddingN * 4) / viewport.render.scale, minRx)}
		fill={type.formulaFill(deriv)}
		data-uid={deriv.uid}
		data-part="body_"
	/>
{/snippet}