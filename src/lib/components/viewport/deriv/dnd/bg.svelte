<script module lang="ts">
	import Bg from './bg.svelte';
	import Deriv from '$lib/state/deriv.svelte';

	// Don't use the Bg component directly!
	// Instead render bgDependency at lteast once on the page and
	// Render bgRoot only on root nodes.
	export { bgDependency, bgRoot };

	// const saturate = 2;
	// const lighten = 0.3;
	// const lighten_ = 1 - lighten;

	// const matrix = `
    // ${(0.213 + 0.787 * saturate) * lighten_} ${(0.715 - 0.715 * saturate) * lighten_} ${(0.072 - 0.072 * saturate) * lighten_} 0 ${lighten}
    // ${(0.213 - 0.213 * saturate) * lighten_} ${(0.715 + 0.285 * saturate) * lighten_} ${(0.072 - 0.072 * saturate) * lighten_} 0 ${lighten}
    // ${(0.213 - 0.213 * saturate) * lighten_} ${(0.715 - 0.715 * saturate) * lighten_} ${(0.072 + 0.928 * saturate) * lighten_} 0 ${lighten}
    // 0 0 0 1 0`;
	
	// Helper constants for bg dimensions are here to prevent being recalculated
	// all the time
	const pad2 = 2 * DT.derivBgPaddingN;
	
    const formulaOffY = -DT.derivLineHeightN - DT.derivBgPaddingN;
	const formulaBgHeight = DT.derivLineHeightN + pad2;
	const formulaRx = $derived(
		Math.min((DT.derivBgPaddingN + 5 * DT.UNIT) / viewport.render.scale, formulaBgHeight / 2)
	);

    const barBgHeight = DT.UNIT + pad2;
    const barRx = barBgHeight / 2;

    const labelOffX = -DT.derivBarGapN - DT.derivBgPaddingN;
    const labelOffY = DT.derivLabelBottomN - DT.derivBgPaddingN;
    const labelBgHeight = DT.derivLabelHeightN + pad2;
    const labelRx = DT.derivLabelHeightN / 2 + DT.derivBgPaddingN;

	const ruleLabelOffX = DT.derivBarGapN - DT.derivBgPaddingN;

    const ruleOffX = DT.derivRuleLeftN + DT.derivRuleParanthesisGapN - DT.derivBgPaddingN;
    const ruleOffY = DT.derivRuleBottomN + (DT.derivRuleHeightN - DT.derivLabelHeightN) / 2 - DT.derivBgPaddingN;
	const rulePad = 2 * (DT.derivBgPaddingN - DT.derivRuleParanthesisGapN);

	// For handles
	// The whole handle section should be as thick as bar bg
	// This padding covers what need to be added on top of the regular padding (bgPadding)
	const handlePadding = DT.UNIT + DT.derivBgPaddingN;
	const handlePadding2 = handlePadding * 2;

	// --- Props for the two types of bg ---
	interface BgType {
		showFormulaBg: (data: Deriv) => boolean;
		showBarBg: (data: Deriv) => boolean;
		formulaFill: (data: Deriv) => string;
		barFill: (data: Deriv) => string;
		// Are the sides extended for the grip handles?
		extended: (data: Deriv) => boolean;
	};
	// Non-outlined
	const nonOutlinedBgType: BgType = {
		showFormulaBg: (data) => !data.render.formulaBg,
		showBarBg: (data) => !data.render.barBg && !data.render.barHidden,
		formulaFill: () => `var(--color-bg)`,
		barFill: () => `var(--color-bg)`,
		extended: () => false,
	};
	// Outlined
	const outlinedBgType: BgType = {
		showFormulaBg: (data) => !!data.render.formulaBg,
		showBarBg: (data) => !!data.render.barBg && !data.render.barHidden,
		formulaFill: (data) => `${data.render.formulaBg}`,
		barFill: (data) => `${data.render.barBg}`,
		extended: (data) => data.render.bodyAwake,
	};
	// Hitbox
	const hitboxBgType: BgType = {
		showFormulaBg: () => true,
		showBarBg: () => true,
		formulaFill: () => ``,
		barFill: () => ``,
		extended: () => true,
	};
</script>

<script lang="ts">
	import { DT } from '../../../../../DT';
	import viewport from '$lib/state/viewport.svelte';

	// Note: Each Bg renders their (deriv's) children('s Bg).
	// Except when a deriv's being dragged; dragged deriv renders a separate bgRoot
	// snippet. But in the case of a bar being dragged, The deriv has two Bgs:
	// - One rendered by parent (only shows formula)
	// - One rendered by itself with bgRoot (doesn't show formula)
	// This is because the formula part isn't dragged.
	// Also note the exception when the deriv is root: It renders it own formula 
	// like it would normally.
	// TODO: This doesn't function completely consistent: When deriv is root, bar and
	// formula are in the same Bg. Change that
	interface Props {
		data: Deriv;
		type: BgType;
		/** Private! */
		_showOnlyFormula?: boolean;
	}

	let { data, type, _showOnlyFormula = false }: Props = $props();
</script>

<!-- Not used right now bc outlines are disabled. Called in viewport comp. -->
{#snippet bgDependency()}
	<!-- <svg class=" invisible absolute">
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
	</svg> -->
{/snippet}

{#snippet bgRoot(data: Deriv)}
	<svg
		class="h-[1px] w-[1px] overflow-visible opacity-80 select-none cursor-all-scroll"
		viewBox="0 0 1 1"
		class:z-1={data.render.dragged}
	>
		<g class="pointer-events-none">
			<Bg {data} type={nonOutlinedBgType}/>
			<!-- <g filter="url(#outlineFilter)"> -->
				<Bg {data} type={outlinedBgType} />
			<!-- </g> -->
		</g>
		<g class="opacity-0">
			<Bg {data} type={hitboxBgType}/>
		</g>
	</svg>
{/snippet}

<!-- For formula (for the second part, see comment above Props) -->
{#if type.showFormulaBg(data) && (!data.render.barDragged || data.root === data || _showOnlyFormula)}	
	<rect
		x={data.render.x - data.render.width / 2 - DT.derivBgPaddingN - (+type.extended(data)) * handlePadding}
		y={data.render.y + formulaOffY}
		width={data.render.width + pad2 + (+type.extended(data)) * handlePadding2}
		height={formulaBgHeight}
		rx={formulaRx}
		fill={type.formulaFill(data)}
		data-uid={data.uid}
		data-part="body_"
	/>
{/if}

<!-- See comment above Props -->
{#if !_showOnlyFormula}
	<!-- Recursion for children -->
	{#each data.children as child (child)}
		{#if !child.render.bodyDragged}
			<Bg data={child} type={type} _showOnlyFormula={child.render.barDragged}/>
		{/if}
	{/each}

	<!-- For bar -->
	{#if type.showBarBg(data)}
		<g fill={type.barFill(data)} data-uid={data.uid} data-part="bar_">
			<rect
				x={data.render.xBar - data.render.barWidth / 2 - DT.derivBgPaddingN}
				y={data.render.yBar - DT.derivBgPaddingN}
				width={data.render.barWidth + pad2}
				height={barBgHeight}
				rx={barRx}
			/>
		
			<!-- For label -->
			{#if data.render.hasLabel}
				<rect
					x={data.render.xBar - data.render.barWidth / 2 - data.render.labelWidth + labelOffX}
					y={data.render.yBar + labelOffY}
					width={data.render.labelWidth + pad2}
					height={labelBgHeight}
					rx={labelRx}
				/>
			{/if}
		
			<!-- For Rule -->
			{#if data.render.hasRule}
				{#if data.render.discharged}
					<rect
						x={data.render.xBar + data.render.barWidth / 2 + ruleLabelOffX}
						y={data.render.yBar + labelOffY}
						width={data.render.ruleWidth + pad2}
						height={labelBgHeight}
						rx={labelRx}
					/>
				{:else}
					<rect
						x={data.render.xBar + data.render.barWidth / 2 + ruleOffX}
						y={data.render.yBar + ruleOffY}
						width={data.render.ruleWidth + rulePad}
						height={labelBgHeight}
						rx={labelRx}
					/>
				{/if}
			{/if}
		</g>
	{/if}
{/if}
