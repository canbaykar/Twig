<script lang="ts">
	import Bar from './bar.svelte';
	import Deriv from '$lib/state/deriv.svelte';
	import Formula from './formula.svelte';
	import Handle from './dnd/handle.svelte';
	import Dropzones from './dnd/dropzones.svelte';
	import viewport from '$lib/state/viewport.svelte';
	import { bgRoot } from './bg.svelte';

	interface Props {
		data: Deriv;
	}

	let { data }: Props = $props();

    function gotoTop() { // If not last child, reattach to be last
        if (viewport.children.length - 1 > data.root.childIndex)
            data.root.attach(viewport);
	}
</script>

<!-- Background -->
{#if data.root === data || data.render.dragged}
    {@render bgRoot(data)}
{/if}

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="deriv"
	class:dragged={data.render.dragged}
	class:pointer-events-none={data.render.inDragged}
	style:translate="{data.render.x}px {data.render.y}px"
	class:z-1={data.render.inDragged}
	data-uid={data.uid}
	onmousedown={gotoTop}
	onfocusin={gotoTop}
>
	<Formula {data}>
		<Handle {data} class="right-[100%]" />
		<Handle {data} class="left-[100%]" />
	</Formula>
	<Bar {data} rule={data.logic.ruleText} label={data.logic.labelText} />

	{#if viewport.render.dragging && !data.render.inDragged}
		<Dropzones {data} />
	{/if}
</div>
