<script module lang="ts">
	import Bg from './bg.svelte';
	import Deriv from '$lib/state/deriv.svelte';
	import { formulaBg } from './formula/formula.svelte';
	import { barBg } from './bar.svelte';
	import { addersBg } from "./adders.svelte";
	import { DT } from '../../../../DT';
	import viewport from '$lib/state/viewport.svelte';

	// Bg System:
	// Implement bg snippets in respective components and place their render blocks
	// in this file. See already implemented ones and BgType.
	// Don't use the Bg component directly! Instead render bgRoot only on root nodes.
	export { bgRoot };

	// --- Enum for different states a Bg can signal (all props are colors)
	export type BgState = 'neutral' | 'danger' | 'warning';

	// --- Props for the 4 types of svg elements making up Bg ---
	// TODO: Optimize this, reduce types
	export interface BgType {
		showBodyBg: (data: Deriv) => boolean;
		showBarBg: (data: Deriv) => boolean;
		bodyFill: (data: Deriv) => string;
		barFill: (data: Deriv) => string;
		adderFill: string;
		bodyStroke: (data: Deriv) => string;
		barStroke: (data: Deriv) => string;
		adderStroke: string;
		// Are the sides extended for the grip handles?
		extended: (data: Deriv) => boolean;
		// Used by adders, activeBg or activeOutline hide adders unless hovered
		active: boolean,
	};

	// Active
	const awake = (data: Deriv) => data.render.anySelected || (!!data.render.hoveredPart && data.render.hoveredSection !== 'adder');
	const showBarBg = (data: Deriv) => data.render.barBg !== 'neutral' || awake(data);
	export const activeBgType: BgType = {
		showBodyBg: (data) => data.render.bodyBg !== 'neutral' || awake(data),
		showBarBg: (data) => showBarBg(data) && !data.render.barHidden,
		bodyFill: (data) => `var(--color-deriv-bg-${data.render.bodyBg}-${1 + +data.render.awake + +data.render.bodySelected})`,
		barFill: (data) => `var(--color-deriv-bg-${data.render.barBg}-${1 + +data.render.awake + +data.render.barSelected})`,
		adderFill: 'var(--color-deriv-bg-neutral-2)',
		bodyStroke: () => ``,
		barStroke: () => ``,
		adderStroke: '',
		extended: (data) => data.render.hoveredSection === 'body',
		active: true,
	};

	// Outline
	export const activeOutlineType: BgType = {
		showBodyBg: activeBgType.showBodyBg,
		showBarBg: activeBgType.showBarBg,
		bodyFill: () => `transparent`,
		barFill: () => `transparent`,
		adderFill: 'transparent',
		bodyStroke: (data) => `var(--color-deriv-bg-${data.render.bodyBg}-${2 + +data.render.awake + +data.render.bodySelected})`,
		barStroke: (data) => `var(--color-deriv-bg-${data.render.barBg}-${2 + +data.render.awake + +data.render.barSelected})`,
		adderStroke: 'var(--color-deriv-bg-neutral-3)',
		extended: (data) => data.render.hoveredSection === 'body',
		active: true,
	};

	// Passive
	export const passiveBgType: BgType = {
		showBodyBg: (data) => !activeBgType.showBodyBg(data),
		showBarBg: (data) => !showBarBg(data) && !data.render.barHidden,
		bodyFill: () => `var(--color-deriv-bg-neutral-1)`,
		barFill: () => `var(--color-deriv-bg-neutral-1)`,
		adderFill: 'transparent',
		bodyStroke: () => ``,
		barStroke: () => ``,
		adderStroke: '',
		extended: () => false,
		active: false,
	};

	// Hitbox
	export const hitboxBgType: BgType = {
		showBodyBg: () => true,
		showBarBg: () => true,
		bodyFill: () => ``,
		barFill: () => ``,
		adderFill: '',
		bodyStroke: () => ``,
		barStroke: () => ``,
		adderStroke: '',
		extended: () => true,
		active: false,
	};

	// For tailwind to load these colors
	'--color-deriv-bg-neutral-1';
	'--color-deriv-bg-neutral-2';
	'--color-deriv-bg-neutral-3';
	'--color-deriv-bg-warning-1';
	'--color-deriv-bg-warning-2';
	'--color-deriv-bg-warning-3';
	'--color-deriv-bg-danger-1';
	'--color-deriv-bg-danger-2';
	'--color-deriv-bg-danger-3';
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

{#snippet bgRoot(deriv: Deriv)}
	<svg
		class="h-px w-px overflow-visible opacity-75 select-none cursor-all-scroll"
		viewBox="0 0 1 1"
		class:z-1={deriv.render.dragged}
	>
		<g class="pointer-events-none">
			<Bg {deriv} type={passiveBgType}/>
			<g stroke-width={3 * DT.UNIT / viewport.render.scale}>
				<Bg {deriv} type={activeOutlineType} />
			</g>
			<Bg {deriv} type={activeBgType} />
		</g>
		<g class="opacity-0">
			<Bg {deriv} type={hitboxBgType}/>
		</g>
	</svg>
{/snippet}

<!-- For formula (for the second part, see comment above Props) -->
{#if type.showBodyBg(deriv) && (!deriv.render.barDragged || deriv.root === deriv || _showOnlyFormula)}
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

	<!-- For adders -->
	{@render addersBg(deriv, type)}

	<!-- For bar -->
	{#if type.showBarBg(deriv)}
		{@render barBg(deriv, type)}
	{/if}
{/if}
