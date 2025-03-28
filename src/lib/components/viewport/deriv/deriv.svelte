<script lang="ts">
    import Bar from './bar.svelte';
	import type Deriv from "$lib/state/deriv.svelte";
    import Formula from './formula.svelte';
    import GripVertical from '~icons/lucide/grip-vertical';

    interface Props {
        data: Deriv;
    }
    
    let { data }: Props = $props();

    // Temporary
    let label = $state('1');
    let rule = $state('∧E');
    // let rule = $state('2');
</script>

<div class="deriv" style:translate="{data.render.x}px {data.render.y}px">
    <Formula {data}>
        <GripVertical width="0.75em" height="100%" class="right-[100%] popup inset-y-0" />
        <GripVertical width="0.75em" height="100%" class="left-[100%]  popup inset-y-0" />
    </Formula>
    <Bar {data} {rule} {label} />
</div>

<style>
    /* Preprocessor removes it if I do ".popup" 😑 */
    .deriv :global(.popup) {
        opacity: 0;
    }
    .deriv:hover :global(.popup) {
        opacity: 1;
    }
</style>
