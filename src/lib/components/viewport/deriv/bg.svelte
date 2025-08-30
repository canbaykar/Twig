<script module lang="ts">
	import Bg from './bg.svelte';
	import Deriv from '$lib/state/deriv.svelte';
	import { formulaBg } from './formula.svelte';
	import { barBg } from './bar.svelte';

	// Bg System:
	// Implement bg snippets in respective components and place their render blocks
	// in this file. See already implemented ones and BgType.
	// Don't use the Bg component directly! Instead render bgDependency at least 
	// once on the page and render bgRoot only on root nodes.
	export { bgDependency, bgRoot };

	// const saturate = 2;
	// const lighten = 0.3;
	// const lighten_ = 1 - lighten;

	// const matrix = `
    // ${(0.213 + 0.787 * saturate) * lighten_} ${(0.715 - 0.715 * saturate) * lighten_} ${(0.072 - 0.072 * saturate) * lighten_} 0 ${lighten}
    // ${(0.213 - 0.213 * saturate) * lighten_} ${(0.715 + 0.285 * saturate) * lighten_} ${(0.072 - 0.072 * saturate) * lighten_} 0 ${lighten}
    // ${(0.213 - 0.213 * saturate) * lighten_} ${(0.715 - 0.715 * saturate) * lighten_} ${(0.072 + 0.928 * saturate) * lighten_} 0 ${lighten}
    // 0 0 0 1 0`;

	// --- Props for the three types of bg ---
	export interface BgType {
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
		extended: (data) => data.render.hoveredSection === 'body',
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
	{@render formulaBg(deriv, type)}
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
		{@render barBg(deriv, type)}
	{/if}
{/if}
