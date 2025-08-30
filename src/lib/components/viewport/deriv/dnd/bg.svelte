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
		extended: (data) => data.render.bodyHovered,
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
		deriv: Deriv;
		type: BgType;
		/** Private! */
		_showOnlyFormula?: boolean;
	}

	let { deriv, type, _showOnlyFormula = false }: Props = $props();
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

{#snippet bgRoot(deriv: Deriv)}
	<svg
		class="h-[1px] w-[1px] overflow-visible opacity-80 select-none cursor-all-scroll"
		viewBox="0 0 1 1"
		class:z-1={deriv.render.dragged}
	>
		<g class="pointer-events-none">
			<Bg {deriv} type={nonOutlinedBgType}/>
			<!-- <g filter="url(#outlineFilter)"> -->
				<Bg {deriv} type={outlinedBgType} />
			<!-- </g> -->
		</g>
		<g class="opacity-0">
			<Bg {deriv} type={hitboxBgType}/>
		</g>
	</svg>
{/snippet}

<!-- For formula (for the second part, see comment above Props) -->
{#if type.showFormulaBg(deriv) && (!deriv.render.barDragged || deriv.root === deriv || _showOnlyFormula)}	
	<rect
		x={deriv.render.x - deriv.render.width / 2 - DT.derivBgPaddingN - (+type.extended(deriv)) * handlePadding}
		y={deriv.render.y + formulaOffY}
		width={deriv.render.width + pad2 + (+type.extended(deriv)) * handlePadding2}
		height={formulaBgHeight}
		rx={formulaRx}
		fill={type.formulaFill(deriv)}
		data-uid={deriv.uid}
		data-part="body_"
	/>
{/if}

<!-- See comment above Props -->
{#if !_showOnlyFormula}
	<!-- Recursion for children -->
	{#each deriv.children as child (child)}
		{#if !child.render.bodyDragged}
			<Bg deriv={child} type={type} _showOnlyFormula={child.render.barDragged}/>
		{/if}
	{/each}

	<!-- For bar -->
	{#if type.showBarBg(deriv)}
		<g fill={type.barFill(deriv)} data-uid={deriv.uid} data-part="bar_">
			<rect
				x={deriv.render.xBar - deriv.render.barWidth / 2 - DT.derivBgPaddingN}
				y={deriv.render.yBar - DT.derivBgPaddingN}
				width={deriv.render.barWidth + pad2}
				height={barBgHeight}
				rx={barRx}
			/>
		
			<!-- For label -->
			{#if deriv.render.hasLabel}
				<rect
					x={deriv.render.xBar - deriv.render.barWidth / 2 - deriv.render.labelWidth + labelOffX}
					y={deriv.render.yBar + labelOffY}
					width={deriv.render.labelWidth + pad2}
					height={labelBgHeight}
					rx={labelRx}
				/>
			{/if}
		
			<!-- For Rule -->
			{#if deriv.render.hasRule}
				{#if deriv.render.discharged}
					<rect
						x={deriv.render.xBar + deriv.render.barWidth / 2 + ruleLabelOffX}
						y={deriv.render.yBar + labelOffY}
						width={deriv.render.ruleWidth + pad2}
						height={labelBgHeight}
						rx={labelRx}
					/>
				{:else}
					<rect
						x={deriv.render.xBar + deriv.render.barWidth / 2 + ruleOffX}
						y={deriv.render.yBar + ruleOffY}
						width={deriv.render.ruleWidth + rulePad}
						height={labelBgHeight}
						rx={labelRx}
					/>
				{/if}
			{/if}
		</g>
	{/if}
{/if}
