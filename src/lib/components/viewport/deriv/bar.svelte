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

    const labelBase = `
    text-(length:--DERIV-LABEL-SIZE)
    bottom-(--DERIV-LABEL-BOTTOM)
    leading-(--DERIV-LABEL-LH)

    select-none
    border-(length:--UNITPX) border-fg
    rounded-full
    min-w-(--DERIV-LABEL-HEIGHT)
    text-center`;

    const ruleBase = `
    left-(--DERIV-RULE-LEFT)
    text-(length:--DERIV-RULE-SIZE)
    bottom-(--DERIV-RULE-BOTTOM)
    leading-(--DERIV-RULE-LH)

    select-none`;
</script>

<div
    class="bg-fg h-1 origin-left rounded-full"
    class:bg-transparent={!hasBar}
    style:translate="calc({render.barLeft}px) {render.y}px"
    style:width="{render.barWidth}px"
    style:bottom="{DT.derivBarBottomN}px"
>
    <!-- Label -->
    {#if hasLabel}
        <div
            class="right-(--DERIV-LABEL-RIGHT) {labelBase}"
            bind:this={labelElement}
        >
            {label}
        </div>
    {/if}
    <!-- Rule -->
    {#if hasRule}
        <div
            class="{discharged ? 'left-(--DERIV-LABEL-RIGHT)' + labelBase : ruleBase}"
            bind:this={ruleElement}
        >
            {discharged ? rule : '(' + rule + ')'}
        </div>
    {/if}
</div>

