<script lang="ts">
	import { browser } from "$app/environment";
	import type Deriv from "$lib/state/deriv.svelte";
	import { derivDTjs } from "./deriv.DT";

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

<div class="*:absolute *:font-math">
    <div
        class="bg-fg/10 bottom-0"
        style:translate="calc({render.x}px - 50%) {render.y}px"
        style:line-height={derivDTjs.derivLH}
        bind:this={element}
    >
        {data.conc}
    </div>

    <div
        class="bg-fg h-1 origin-left rounded-full"
        style:translate="calc({render.barLeft}px) {render.y}px"
        style:width="{render.barWidth}px"
        style:bottom="{derivDTjs.derivBarBottom}px"
    ></div>
</div>