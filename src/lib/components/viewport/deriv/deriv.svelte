<script lang="ts">
	import { browser } from "$app/environment";
	import type Deriv from "$lib/state/deriv.svelte";

    interface Props {
        data: Deriv;
    }
    
    let { data }: Props = $props();

    const render = data.render;

    let element: HTMLElement;

    // Maintain data.render.width
    // Initial set (annoyingly have to account for font load)
    if (browser) 
        document.fonts.load('12px "M PLUS 1p"').then(() => {
            data.render.width = element.offsetWidth;
        });
    // TODO: Test that this only works when conc changes!
    $effect(() => {
        data.conc;
        data.render.width = element.offsetWidth;
    });
</script>

<div
    class="font-math absolute"
    style:translate="{render.x}px {render.y}px"
    bind:this={element}
>
    {data.conc}
</div>