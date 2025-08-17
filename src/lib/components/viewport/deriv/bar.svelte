<script lang="ts">
	import type Deriv from "$lib/state/deriv.svelte";
	import { DT } from "../../../../DT";
	import DerivRenderData from "./renderData.svelte";

    interface Props {
        data: Deriv;
        // Temporary
        label: string,
        rule: string,
    }
    
    let {
        data,
        label,
        rule,
    }: Props = $props();
    
    const render = data.render;
    
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
    class="bg-fg h-1 origin-left translate-x-[-50%] rounded-full select-none"
	style:translate="{data.render.xBar}px {data.render.yBar}px"
    style:width="{render.barWidth}px"
    class:bg-transparent={!data.render.hasBar}
	class:z-1={data.render.inDragged}
	data-uid={data.uid}
	data-part="bar"
>
	<!-- Hitbox -->
	<div class="hitbox"></div>
    <!-- Label -->
    {#if data.render.hasLabel}
        <div
            class="right-(--DERIV-LABEL-RIGHT) labelBase"
            bind:this={labelElement}
        >
            {label}
        </div>
    {/if}
    <!-- Rule -->
    {#if data.render.hasRule}
        <div
            class="left-(--DERIV-LABEL-RIGHT) {data.render.discharged ? 'labelBase' : 'ruleBase'}"
            bind:this={ruleElement}
        >
            {data.render.discharged ? rule : '(' + rule + ')'}
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