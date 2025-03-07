<script lang="ts">
	import { browser } from "$app/environment";
	import type Deriv from "$lib/state/deriv.svelte";
	import { on } from "svelte/events";
	import { onMount } from "svelte";
	import { FormulaPopup } from "./formulaPopup.svelte";
	import { DT } from "../../../../DT";

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
        class="px-{DT.derivXPaddingN} bottom-0 cursor-default select-none"
        class:bg-bg-danger-emphasis={data.logic.conc instanceof Error}
        style:translate="calc({render.x}px - 50%) {render.y}px"
        style:line-height={DT.derivLineHeight}
        bind:this={element}
        onmouseenter={makePopup}
        ondragenter={makePopup}
        role="textbox"
        tabindex="-1"
    >
        {data.conc}
    </div>

    <div
        class="bg-fg h-1 origin-left rounded-full"
        style:translate="calc({render.barLeft}px) {render.y}px"
        style:width="{render.barWidth}px"
        style:bottom="{DT.derivBarBottomN}px"
    ></div>
</div>