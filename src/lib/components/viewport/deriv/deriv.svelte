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

<Formula {data}>
    <GripVertical width="0.75em" class="inset-y-0 right-[100%] flex justify-center items-center" />
    <GripVertical width="0.75em" class="inset-y-0 left-[100%] flex justify-center items-center" />
</Formula>
<Bar {data} {rule} {label} />