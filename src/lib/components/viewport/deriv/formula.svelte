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
</script>

<!-- Draggable button, grabbed when clicked -->
<div
	class="wrapper bottom-0 translate-x-[-50%] h-(--DERIV-LINE-HEIGHT) leading-(--DERIV-LINE-HEIGHT) whitespace-nowrap cursor-auto"
	bind:this={element}
	tabindex="-1"
>
	<div 
		contenteditable
		bind:innerText={deriv.conc}
		class="relative! inline-block whitespace-pre px-(--DERIV-X-PADDING) overflow-hidden outline-hidden"
		class:opacity-25={deriv.render.bodyMuted}
		data-part="body_formula"
	></div>
	{#if deriv.render.bodyAwake}
		<div
			class="outline_ opacity-0 top-0 left-0 origin-top-left pointer-events-none outline-1 outline-fg -outline-offset-1 outline-dashed rounded-[calc(var(--DERIV-BG-PADDING)/16)]"
			style="
				height: {DT.derivLineHeightN / DT.UNIT * viewport.render.scale}px;
				width: {deriv.render.baseWidth / DT.UNIT * viewport.render.scale}px;
				font-size: {DT.derivSizeN / DT.UNIT * viewport.render.scale}px;
				scale: {DT.UNIT / viewport.render.scale};
        	"
		></div>
	{/if}
</div>

<style>
	.wrapper:focus-within .outline_ {
		opacity: 1;
	}
</style>

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