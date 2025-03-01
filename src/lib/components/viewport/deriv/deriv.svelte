<script lang="ts">
	import { browser } from "$app/environment";
	import type Deriv from "$lib/state/deriv.svelte";
	import { on } from "svelte/events";
	import { derivDTjs } from "./deriv.DT";
	import { onMount } from "svelte";
	import { FormulaPopup } from "./formulaPopup.svelte";

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
    
    $effect(() => {
        data.conc;
        data.render.width = element.offsetWidth;
    });

    // TODO: Account for focus events for accessibility
    function makePopup(e: Event) {
        new FormulaPopup(data, element);
    }
</script>

<div class="*:absolute *:font-math">
    <div
        class="bottom-0 px-{derivDTjs.derivXPadding} cursor-default select-none"
        style:translate="calc({render.x}px - 50%) {render.y}px"
        style:line-height={derivDTjs.derivLH}
        bind:this={element}
        onmouseenter={makePopup}
        role="textbox"
        tabindex="0"
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