<script lang="ts">
	import type { Viewport } from "$lib/state/viewport.svelte";
	import Panzoom from "./panzoom/panzoom.svelte";
	import { UNIT } from "./unit.svelte"; UNIT;
    
    interface Props {
        viewport: Viewport;
    }
    
    let { viewport }: Props = $props();
</script>

<Panzoom data={viewport.render}>
    <span class="font-math">Lorem ipsum</span>
</Panzoom>