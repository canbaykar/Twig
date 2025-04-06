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

    interface Props {
        data: Deriv;
    }
    
    let { data }: Props = $props();

    // Temporary
    let label = $state('1');
    let rule = $state('∧E');
    // let rule = $state('2');
    
    let dragged = $state(false);
</script>

<div 
    class="deriv"
    class:dragged
    style:translate="{data.render.x}px {data.render.y}px" 
    style:z-index={data.render.zId}
    data-address={data.address}
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
    /* Preprocessor removes it if I do ".popup" 😑 */
    .deriv :global(.handle) {
        opacity: 0;
    }
    .dragged :global(.handle),
    .deriv:hover :global(.handle) {
        opacity: 1;
    }
    .dragged {
        pointer-events: none;
    }
</style>
