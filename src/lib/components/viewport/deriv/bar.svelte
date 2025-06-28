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

    const hasLabel = $derived(label !== '');
    const hasRule = $derived(rule !== '');
    const hasChild = $derived(data.children.length !== 0);
    const hasBar = $derived(hasRule || hasLabel || hasChild);
    const discharged = $derived(/^\d+$/.test(rule));
</script>

<div
    class="bg-fg h-1 bottom-(--DERIV-BAR-BOTTOM) origin-left translate-x-[-50%] rounded-full select-none"
    class:bg-transparent={!hasBar}
    style:width="{render.barWidth}px"
>
    <!-- Label -->
    {#if hasLabel}
        <div
            class="right-(--DERIV-LABEL-RIGHT) labelBase"
            bind:this={labelElement}
        >
            {label}
        </div>
    {/if}
    <!-- Rule -->
    {#if hasRule}
        <div
            class="left-(--DERIV-LABEL-RIGHT) {discharged ? 'labelBase' : 'ruleBase'}"
            bind:this={ruleElement}
        >
            {discharged ? rule : '(' + rule + ')'}
        </div>
    {/if}
</div>

<style>
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