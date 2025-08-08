<script module lang="ts">
	import Bar from './bar.svelte';
	import Deriv from '$lib/state/deriv.svelte';
	import Formula from './formula.svelte';
	import Dropzones from './dnd/dropzones.svelte';
	import viewport from '$lib/state/viewport.svelte';
	import { bgRoot } from './bg.svelte';
	import { dndListeners } from './dnd/dndListeners';
	import type { Listeners } from '../viewportC.svelte';

	// When there are more listeners to be sent to viewport, 
	// they are going to be merged here.
	// TODO: Add focus listener and remove the listener for it below
	export const listeners: Listeners = {
		layout: {
			mousedown(e, l) {
				gotoTop(e.deriv);
				l(e);
			},
		},
		
		...dndListeners,
	};

    function gotoTop(data: Deriv) { 
		// If not last child, reattach to be last
        if (viewport.children.length - 1 > data.root.childIndex)
            data.root.attach(viewport);
	}
</script>

<script lang="ts">
	interface Props {
		data: Deriv;
	}

	let { data }: Props = $props();
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
	onfocusin={() => gotoTop(data)}
>
	<Formula {data}>
		<!-- <Handle {data} class="right-[100%]" />
		<Handle {data} class="left-[100%]" /> -->
	</Formula>
	<Bar {data} rule={data.logic.ruleText} label={data.logic.labelText} />

	{#if viewport.render.dragging && !data.render.inDragged}
		<Dropzones {data} />
	{/if}
</div>
