<script lang="ts">
	import type Deriv from "$lib/state/deriv.svelte";

    interface Props {
        data: Deriv;
    }
    
    let { data }: Props = $props();

    const render = data.render;

    let element: HTMLElement;

    // Maintain data.render.width
    // TODO: Test that this only works when conc changes!
    $effect(() => {
        data.conc;
        // @ts-expect-error
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