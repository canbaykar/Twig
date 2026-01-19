<script lang="ts">
	import Bar from './bar.svelte';
	import Deriv from '$lib/state/deriv.svelte';
	import Formula from './formula/formula.svelte';
	import Dropzones from './dnd/dropzones.svelte';
	import viewport from '$lib/state/viewport.svelte';
	import { bgRoot } from './bg.svelte';
	import Grip from './dnd/grip.svelte';
	import { DT } from '../../../../DT';
	import Adders from './adders.svelte';

	interface Props {
		deriv: Deriv;
	}

	let { deriv }: Props = $props();

	const gripX = $derived((deriv.render.width + DT.UNIT) / 2 + DT.derivBgPaddingN);

	// Auto-deletion feature: When you deselect a deriv with blank conc, it's deleted
	// unless you used one of it's adders to deselect it. Adder rule: If you use an 
	// adder and deselect immediately, the use of adder should leave no trace.
	let sel_ = false;
	$effect(() => {
		const sel = deriv.render.anySelected;
		if (!sel && sel_) ondeselect(deriv);
		sel_ = sel;
	});
	async function ondeselect(d: Deriv) { // Async bc syncronous reads affect $effect logic
		if (d.conc) return;
		const par = d.derivParent;
		if ( // Exception case: Used adder attached to this, which deselected this
			[
				...d.children, par,
				par?.children?.[d.childIndex - 1],
				par?.children?.[d.childIndex + 1]
			].find((d) => d && d.render.anySelected && !d.conc)
		) return;
		// Side adders of roots add 2 derivs so they're both deleted based on the rule.
		if (d.children.length || !par || par.conc || par.derivParent)
			return d.render.shiftDelete();
		viewport.render.shiftDelete([d, par]);
	}
</script>

<!-- Background -->
{#if deriv.root === deriv || deriv.render.dragged}
    {@render bgRoot(deriv)}
{/if}

<!-- See DerivRenderState.lookup for data-part -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="deriv"
	bind:this={deriv.render.element}
	class:pointer-events-none={deriv.render.inDragged}
	style:translate="{deriv.render.x}px {deriv.render.y}px"
	class:z-1={deriv.render.inDragged}
	data-uid={deriv.uid}
	data-part="body_"
>
	<Formula {deriv} />

	{#if deriv.render.hoveredSection === 'body'}
		<Grip x="{ gripX}px" y="{-DT.derivLineHeightN / 2}px"/>
		<Grip x="{-gripX}px" y="{-DT.derivLineHeightN / 2}px"/>
	{/if}

	<!-- TODO: Place dropzones in front of Bar -->
	{#if viewport.render.dragging && !deriv.render.inDragged}
		<Dropzones {deriv} />
	{/if}
</div>

<Adders {deriv} />

<Bar {deriv} rule={deriv.logic.ruleText} label={deriv.logic.labelText} />