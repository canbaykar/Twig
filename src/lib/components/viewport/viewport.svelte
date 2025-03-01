<script lang="ts">
	import { addExampleProof } from "$lib/state/deriv.svelte";
	import type { Viewport } from "$lib/state/viewport.svelte";
	import { onDestroy } from "svelte";
	import Deriv from "./deriv/deriv.svelte";
	import DerivRenderData from "./deriv/renderData.svelte";
	import Panzoom from "./panzoom/panzoom.svelte";
    
    interface Props {
        viewport: Viewport;
    }
    
    let { viewport }: Props = $props();

    viewport.detachAll();
    addExampleProof();

    onDestroy(() => DerivRenderData.onDestroy());
</script>

<Panzoom data={viewport.render}>
    {#each DerivRenderData.displayed as data (data)}
        <Deriv {data}></Deriv>
    {/each}
    
    {#snippet noPanzoom()}
        {#each viewport.render.popups.children as popup (popup)}
            <popup.component {popup} {...popup.props} />
        {/each}
    {/snippet}
</Panzoom>