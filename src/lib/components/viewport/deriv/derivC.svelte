<script module lang="ts">
	import Bar from './bar.svelte';
	import Deriv from '$lib/state/deriv.svelte';
	import Formula from './formula.svelte';
	import Dropzones from './dnd/dropzones.svelte';
	import viewport from '$lib/state/viewport.svelte';
	import { bgRoot } from './dnd/bg.svelte';
	import { dndListeners } from './dnd/dndListeners';
	import type { Listeners } from '../viewportC.svelte';
	import Grip from './dnd/grip.svelte';
	import { DT } from '../../../../DT';

	// When there are more listeners to be sent to viewport, 
	// they are going to be merged here.
	export const listeners: Listeners = {
		layout: {
			mousedown(e, l) {
				e.deriv.render.goToTop();
				l(e);
			},
		},
		
		...dndListeners,
	};
</script>

<script lang="ts">
	interface Props {
		data: Deriv;
	}

	let { data }: Props = $props();

	const gripX = $derived((data.render.width + DT.UNIT) / 2 + DT.derivBgPaddingN);
</script>

<!-- Background -->
{#if data.root === data || data.render.dragged}
    {@render bgRoot(data)}
{/if}

<!-- See deriv.renderData.lookup for data-part -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="deriv"
	class:dragged={data.render.dragged}
	class:pointer-events-none={data.render.inDragged}
	style:translate="{data.render.x}px {data.render.y}px"
	class:z-1={data.render.inDragged}
	data-uid={data.uid}
	data-part="body"
>
	<Formula {data} />
	<Bar {data} rule={data.logic.ruleText} label={data.logic.labelText} />

	{#if data.render.bodyAwake}
		<Grip x="{ gripX}px" y="{-DT.derivLineHeightN / 2}px" data-part="bg"/>
		<Grip x="{-gripX}px" y="{-DT.derivLineHeightN / 2}px" data-part="bg"/>
	{/if}

	{#if viewport.render.dragging && !data.render.inDragged}
		<Dropzones {data} />
	{/if}
</div>
