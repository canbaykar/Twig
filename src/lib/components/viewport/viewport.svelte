<script lang="ts">
	import type { ViewportState } from "$lib/state/viewport.svelte";
	import Panzoom from "./panzoom/panzoom.svelte";
    
    interface Props {
        viewport: ViewportState;
    }
    
    let { viewport }: Props = $props();
    
</script>

<Panzoom data={viewport}>

</Panzoom>