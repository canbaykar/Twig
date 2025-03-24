<script lang="ts">
    import Bar from './bar.svelte';
	import type Deriv from "$lib/state/deriv.svelte";
    import Formula from './formula.svelte';

    interface Props {
        data: Deriv;
    }
    
    let { data }: Props = $props();

    // Temporary
    let label = $state('1');
    let rule = $state('∧E');
    // let rule = $state('2');
</script>

<Formula {data}></Formula>
<Bar {data} {rule} {label}></Bar>