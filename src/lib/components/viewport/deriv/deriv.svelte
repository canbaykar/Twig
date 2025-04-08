<script module lang="ts">
    /** Number of active Deriv DND interactions that are dragged. */
    let dragging: number = $state(0);
    /** Log start and stop (don't forget!) of dragging a Deriv to maintain dropzones.
     *  @param dragging_ Is this the start of the DND interaction? */
    export function dragLog(dragging_: boolean) {
        return dragging = Math.max(0, dragging + (dragging_ ? 1 : -1));
    }
</script>

<script lang="ts">
    import Bar from './bar.svelte';
	import Deriv from '$lib/state/deriv.svelte';
    import Formula from './formula.svelte';
	import Handle from './dnd/handle.svelte';
	import Dropzones from './dnd/dropzones.svelte';
	import viewport from '$lib/state/viewport.svelte';

    interface Props {
        data: Deriv;
    }
    
    let { data }: Props = $props();

    // Temporary
    let label = $state('1');
    let rule = $state('∧E');
    // let rule = $state('2');
    
    let dragged = $state(false);

    function gotoTop() { // If not last child, reattach to be last
        if (viewport.children.length - 1 > data.root.childIndex)
            data.root.attach(viewport);
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
    class="deriv"
    class:dragged
    style:translate="{data.render.x}px {data.render.y}px" 
    style:z-index={data.render.zId}
    data-address={data.address}
    onmousedown={gotoTop}
    onfocusin={gotoTop}
>
    <Formula {data}>
        <Handle {data} bind:dragged class="right-[100%]" />
        <Handle {data} bind:dragged class="left-[100%]" />
    </Formula>
    <Bar {data} {rule} {label} />

    {#if dragging}
        <Dropzones {data} />
    {/if}
</div>

<style>
    .dragged {
        pointer-events: none;
    }
</style>
