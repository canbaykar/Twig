<script lang="ts">
	import type Deriv from "$lib/state/deriv.svelte";

    interface Props {
        data: Deriv;
    }
    
    let { data }: Props = $props();
</script>

<span class="font-math">{data.conc}</span>
<br/>