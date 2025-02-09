<script lang="ts">
	import type { ViewportState } from "$lib/state/viewport.svelte";
	import Panzoom from "./panzoom/panzoom.svelte";
	import { UNIT } from "./unit.svelte"; UNIT;
    
    interface Props {
        viewport: ViewportState;
    }
    
    let { viewport }: Props = $props();
</script>

<Panzoom data={viewport}>
    <span class="font-math">Lorem ipsum</span>
</Panzoom>