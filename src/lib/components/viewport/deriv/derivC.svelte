<script module lang="ts">
	import Bar from './bar.svelte';
	import Deriv from '$lib/state/deriv.svelte';
	import Formula from './formula.svelte';
	import Dropzones from './dnd/dropzones.svelte';
	import viewport from '$lib/state/viewport.svelte';
	import { bgRoot } from './dnd/bg.svelte';
	import { dndOptions } from './dnd/dndOptions';
	import type { Listeners } from '../viewportC.svelte';
	import Grip from './dnd/grip.svelte';
	import { DT } from '../../../../DT';
	import draggable from '$lib/utils/interact/draggable.svelte';

	// When there are more listeners to be sent to viewport,
	// they are going to be merged here.
	export const listeners: Listeners = {
		layout: {
			mousedown(e, l) {
				e.deriv.render.goToTop();
				l(e);
			},
		},
		body_: {
			mousedown(e) {
				e.deriv.render.bodyMuted = false;
				draggable.once(dndOptions(e.deriv, false));
			},
		},
		bar_: {
			mousedown(e) {
				draggable.once(dndOptions(e.deriv, true));
			},
		},
		body_formula: {
			mousedown(e) {
				e.deriv.render.bodyMuted = false;
			},
		},
	};
</script>

<script lang="ts">
	interface Props {
		deriv: Deriv;
	}

	let { deriv }: Props = $props();

	const gripX = $derived((deriv.render.width + DT.UNIT) / 2 + DT.derivBgPaddingN);
</script>

<!-- Background -->
{#if deriv.root === deriv || deriv.render.dragged}
    {@render bgRoot(deriv)}
{/if}

<!-- See DerivRenderState.lookup for data-part -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="deriv"
	class:pointer-events-none={deriv.render.inDragged}
	style:translate="{deriv.render.x}px {deriv.render.y}px"
	class:z-1={deriv.render.inDragged}
	data-uid={deriv.uid}
	data-part="body_"
>
	<Formula {deriv} />

	{#if deriv.render.bodyAwake}
		<Grip x="{ gripX}px" y="{-DT.derivLineHeightN / 2}px"/>
		<Grip x="{-gripX}px" y="{-DT.derivLineHeightN / 2}px"/>
	{/if}

	<!-- TODO: Place dropzones in front of Bar -->
	{#if viewport.render.dragging && !deriv.render.inDragged}
		<Dropzones {deriv} />
	{/if}
</div>

<Bar {deriv} rule={deriv.logic.ruleText} label={deriv.logic.labelText} />
