<script lang="ts">
	import type Deriv from "$lib/state/deriv.svelte";
	import { DT } from "../../../../DT";
	import DerivRenderData from "./renderData.svelte";

    interface Props {
        deriv: Deriv;
        // Temporary
        label: string,
        rule: string,
    }
    
    let {
        deriv,
        label,
        rule,
    }: Props = $props();
    
    const render = deriv.render;
    
    let labelElement: HTMLElement | null = $state(null);
    let ruleElement:  HTMLElement | null = $state(null);
    DerivRenderData.maintainWidth(
        () => label,
        () => render.labelWidth = labelElement ? labelElement.offsetWidth : 0
    );
    DerivRenderData.maintainWidth(
        () => rule,
        () => render.ruleWidth = ruleElement ? ruleElement.offsetWidth : 0
    );
</script>

<div
    class="{render.inferred ? "bg-fg" : "bg-fg/25"} h-1 origin-left translate-x-[-50%] rounded-full select-none cursor-all-scroll"
	style:translate="{deriv.render.xBar - deriv.render.barWidth / 2}px {deriv.render.yBar}px"
    style:width="{render.barWidth}px"
    class:bg-transparent={deriv.render.barHidden}
	class:z-1={deriv.render.inDragged}
	data-uid={deriv.uid}
	data-part="bar_"
>
	<!-- Hitbox -->
	<div class="hitbox"></div>
    <!-- Label -->
    {#if deriv.render.hasLabel}
        <div
            class="right-(--DERIV-LABEL-RIGHT) labelBase"
            bind:this={labelElement}
        >
            {label}
        </div>
    {/if}
    <!-- Rule -->
    {#if deriv.render.hasRule}
        <div
            class="left-(--DERIV-LABEL-RIGHT) {deriv.render.discharged ? 'labelBase' : 'ruleBase'}"
            bind:this={ruleElement}
        >
            {deriv.render.discharged ? rule : '(' + rule + ')'}
        </div>
    {/if}
</div>

<style>
	.hitbox {
		width: 100%;
		top: calc(-1 * var(--DERIV-BG-PADDING));
		height: var(--DERIV-BAR-BG-HEIGHT);
	}

    .labelBase {
        font-size: var(--DERIV-LABEL-SIZE);
        bottom: var(--DERIV-LABEL-BOTTOM);
        line-height: var(--DERIV-LABEL-LH);
        min-width: var(--DERIV-LABEL-HEIGHT);
        border: solid var(--UNITPX);
        padding: 0 calc(2.5 * var(--UNITPX));

        border-color: var(--color-fg);
        border-radius: calc(infinity * 1px);
        text-align: center;
    }

    .ruleBase {
        left: var(--DERIV-RULE-LEFT);
        font-size: var(--DERIV-RULE-SIZE);
        bottom: var(--DERIV-RULE-BOTTOM);
        line-height: var(--DERIV-RULE-LH);
    }
</style>