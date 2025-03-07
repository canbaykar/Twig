<script lang="ts">
	import type Deriv from "$lib/state/deriv.svelte";
	import { DT } from "../../../../DT";

    interface Props {
        data: Deriv;
        labelElement: HTMLElement | null;
        ruleElement: HTMLElement | null;
        // Temporary
        label: string,
        rule: string,
    }
    
    let {
        data,
        labelElement = $bindable(),
        ruleElement = $bindable(),
        label,
        rule,
    }: Props = $props();

    const render = data.render;

    const hasLabel = $derived(label !== '');
    const hasRule = $derived(rule !== '');
    const hasChild = $derived(data.children.length !== 0);
    const hasBar = $derived(hasRule || hasLabel || hasChild);
    const discharged = $derived(/^\d+$/.test(rule));
</script>

<div
    class="bg-fg h-1 origin-left rounded-full select-none"
    class:bg-transparent={!hasBar}
    style:translate="calc({render.barLeft}px) {render.y}px"
    style:width="{render.barWidth}px"
    style:bottom="{DT.derivBarBottomN}px"
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