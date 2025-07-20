<script module lang="ts">
	import Bg from './bg.svelte';
	import Deriv from '$lib/state/deriv.svelte';

	// Don't use the Bg component directly!
	// Instead render bgDependency at lteast once on the page and
	// Render bgRoot only on root nodes.
	export { bgDependency, bgRoot };

	const saturate = 1.5;
	const lighten = 0.05;
	const lighten_ = 1 - lighten;

	const matrix = `
    ${(0.213 + 0.787 * saturate) * lighten_} ${(0.715 - 0.715 * saturate) * lighten_} ${(0.072 - 0.072 * saturate) * lighten_} 0 ${lighten}
    ${(0.213 - 0.213 * saturate) * lighten_} ${(0.715 + 0.285 * saturate) * lighten_} ${(0.072 - 0.072 * saturate) * lighten_} 0 ${lighten}
    ${(0.213 - 0.213 * saturate) * lighten_} ${(0.715 - 0.715 * saturate) * lighten_} ${(0.072 + 0.928 * saturate) * lighten_} 0 ${lighten}
    0 0 0 1 0`;
	
	// Helper constants for bg dimensions are here to prevent being recalculated
	// all the time
	const pad2 = 2 * DT.derivBgPaddingN;
	
    const formulaOffY = -DT.derivLineHeightN - DT.derivBgPaddingN;
	const formulaBgHeight = DT.derivLineHeightN + pad2;
	const formulaRx = $derived(
		Math.min((DT.derivBgPaddingN + 5 * DT.UNIT) / viewport.render.scale, formulaBgHeight / 2)
	);

    const barOffY = -DT.derivBarBottomN - DT.derivBgPaddingN - DT.UNIT;
    const barBgHeight = DT.UNIT + pad2;
    const barRx = barBgHeight / 2;

    const labelOffX = -DT.derivBarGapN - DT.derivBgPaddingN;
    const labelOffY = -DT.derivBarBottomN + DT.derivLabelBottomN - DT.UNIT - DT.derivBgPaddingN;
    const labelBgHeight = DT.derivLabelHeightN + pad2;
    const labelRx = DT.derivLabelHeightN / 2 + DT.derivBgPaddingN;

	const ruleLabelOffX = DT.derivBarGapN - DT.derivBgPaddingN;

    const ruleOffX = DT.derivRuleLeftN + DT.derivRuleParanthesisGapN - DT.derivBgPaddingN;
    const ruleOffY = -DT.derivBarBottomN + DT.derivRuleBottomN + (DT.derivRuleHeightN - DT.derivLabelHeightN) / 2 - DT.UNIT - DT.derivBgPaddingN;
	const rulePad = 2 * (DT.derivBgPaddingN - DT.derivRuleParanthesisGapN);

	// --- Props for the two types of bg ---
	interface BgType {
		showFormulaBg: (data: Deriv) => boolean;
		showBarBg: (data: Deriv) => boolean;
		formulaFill: (data: Deriv) => string;
		barFill: (data: Deriv) => string;
	};
	// Non-outlined
	const nonOutlinedBgType: BgType = {
		showFormulaBg: (data: Deriv) => !data.render.formulaBg,
		showBarBg: (data: Deriv) => !data.render.barBg && data.render.hasBar,
		formulaFill: (data: Deriv) => `var(--color-bg)`,
		barFill: (data: Deriv) => `var(--color-bg)`
	};
	// Outlined
	const outlinedBgType: BgType = {
		showFormulaBg: (data: Deriv) => !!data.render.formulaBg,
		showBarBg: (data: Deriv) => !!data.render.barBg && data.render.hasBar,
		formulaFill: (data: Deriv) => `var(--color-${data.render.formulaBg})`,
		barFill: (data: Deriv) => `var(--color-${data.render.barBg})`
	};
</script>

<script lang="ts">
	import { DT } from '../../../../DT';
	import viewport from '$lib/state/viewport.svelte';

	interface Props {
		data: Deriv;
		type: BgType;
	}

	let { data, type }: Props = $props();
</script>

{#snippet bgDependency()}
	<svg class=" invisible absolute">
		<filter id="outlineFilter" color-interpolation-filters="sRGB">
			<feColorMatrix in="SourceGraphic" result="lightened" type="matrix" values={matrix} />
			<feMorphology
				operator="dilate"
				in="lightened"
				result="morphed"
				radius={(1.1 * DT.UNIT) / viewport.render.scale}
			/>
			<feComposite in="SourceGraphic" />
		</filter>
	</svg>
{/snippet}

{#snippet bgRoot(data: Deriv)}
	<svg
		class="pointer-events-none h-[1px] w-[1px] overflow-visible opacity-100"
		viewBox="0 0 1 1"
		class:z-1={data.render.dragged}
	>
		<Bg {data} type={nonOutlinedBgType} />
		<g id="g" filter="url(#outlineFilter)">
			<Bg {data} type={outlinedBgType} />
		</g>
	</svg>
{/snippet}

<!-- For formula -->
{#if type.showFormulaBg(data)}	
	<rect
		x={data.render.x - data.render.width / 2 - DT.derivBgPaddingN}
		y={data.render.y + formulaOffY}
		width={data.render.width + pad2}
		height={formulaBgHeight}
		rx={formulaRx}
		fill={type.formulaFill(data)}
	/>
{/if}

<!-- Recursion for children -->
{#each data.children as child (child)}
	{#if !child.render.dragged}
		<Bg data={child} type={type} />
	{/if}
{/each}

<!-- For bar -->
{#if type.showBarBg(data)}
	<g fill={type.barFill(data)}>
		<rect
			x={data.render.x - data.render.barWidth / 2 - DT.derivBgPaddingN}
			y={data.render.y + barOffY}
			width={data.render.barWidth + pad2}
			height={barBgHeight}
			rx={barRx}
		/>
	
		<!-- For label -->
		{#if data.render.hasLabel}
			<rect
				x={data.render.x - data.render.barWidth / 2 - data.render.labelWidth + labelOffX}
				y={data.render.y + labelOffY}
				width={data.render.labelWidth + pad2}
				height={labelBgHeight}
				rx={labelRx}
			/>
		{/if}
	
		<!-- For Rule -->
		{#if data.render.hasRule}
			{#if data.render.discharged}
				<rect
					x={data.render.x + data.render.barWidth / 2 + ruleLabelOffX}
					y={data.render.y + labelOffY}
					width={data.render.ruleWidth + pad2}
					height={labelBgHeight}
					rx={labelRx}
				/>
			{:else}
				<rect
					x={data.render.x + data.render.barWidth / 2 + ruleOffX}
					y={data.render.y + ruleOffY}
					width={data.render.ruleWidth + rulePad}
					height={labelBgHeight}
					rx={labelRx}
				/>
			{/if}
		{/if}
	</g>
{/if}
