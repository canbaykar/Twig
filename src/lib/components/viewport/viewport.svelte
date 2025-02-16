<script lang="ts">
	import { addExampleProof } from "$lib/state/deriv.svelte";
	import type { Viewport } from "$lib/state/viewport.svelte";
	import DerivRenderData from "./deriv/renderData.svelte";
	import Panzoom from "./panzoom/panzoom.svelte";
	import { UNIT } from "./unit.svelte"; UNIT;
    
    interface Props {
        viewport: Viewport;
    }
    
    let { viewport }: Props = $props();

    viewport.detachAll();
    addExampleProof();
</script>

<Panzoom data={viewport.render}>
    {#each DerivRenderData.all as deriv}
        <span class="font-math">Lorem</span>
        <br/>
    {/each}
</Panzoom>