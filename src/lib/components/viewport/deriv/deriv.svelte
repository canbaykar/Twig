<script lang="ts">
	import { browser } from "$app/environment";
	import type Deriv from "$lib/state/deriv.svelte";
	import { FormulaPopup } from "./formulaPopup.svelte";
	import { DT } from "../../../../DT";

    interface Props {
        data: Deriv;
    }
    
    let { data }: Props = $props();

    const render = data.render;

    let label = $state('1');
    let rule = $state('(∧E)');
    const hasLabel = $derived(label !== '');
    const hasRule = $derived(rule !== '');
    const hasChild = $derived(data.children.length !== 0);
    const hasBar = $derived(hasRule || hasLabel || hasChild);

    let element: HTMLElement;
    let ruleElement: HTMLElement | null = $state(null);
    let labelElement: HTMLElement | null = $state(null);
    
    // Maintain widths
    const setWidth = () => data.render.width = element.offsetWidth;
    const setRuleWidth = () => render.ruleWidth = ruleElement ? ruleElement.offsetWidth : 0;
    const setLabelWidth = () => render.labelWidth = labelElement ? labelElement.offsetWidth : 0;
    $effect(() => { data.conc; setWidth(); });
    $effect(() => { rule;      setRuleWidth(); })
    $effect(() => { label;     setLabelWidth(); })
    // (Annoyingly have to re-set after font load)
    if (browser) 
        document.fonts.load('12px "M PLUS 1p"').then(() => {
            setWidth();
            setRuleWidth();
            setLabelWidth();
        });

    // TODO: Account for focus events for accessibility
    function makePopup(e: Event) {
        new FormulaPopup(data, element);
    }
</script>

<div class="**:absolute **:font-math">
    <!-- Conclusion -->
    <div
        class="px-(--DERIV-X-PADDING) leading-(--DERIV-LINE-HEIGHT) bottom-0 cursor-default select-none"
        class:bg-bg-danger-emphasis={data.logic.conc instanceof Error}
        style:translate="calc({render.x}px - 50%) {render.y}px"
        bind:this={element}
        onmouseenter={makePopup}
        ondragenter={makePopup}
        role="textbox"
        tabindex="-1"
    >
        {data.conc}
    </div>

    <!-- Rule bar -->
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
                class="text-(length:--DERIV-LABEL-SIZE)
                    bottom-(--DERIV-LABEL-BOTTOM)
                    leading-(--DERIV-LABEL-LH)
                    right-(--DERIV-LABEL-RIGHT)

                    select-none
                    border-(length:--UNITPX) border-fg
                    rounded-full
                    min-w-(--DERIV-LABEL-HEIGHT)
                    text-center"
                bind:this={labelElement}
            >
                {label}
            </div>
        {/if}
        <!-- Rule -->
        {#if hasRule}
            <div
                class="text-(length:--DERIV-RULE-SIZE)
                    bottom-(--DERIV-RULE-BOTTOM)
                    leading-(--DERIV-RULE-LH)
                    left-(--DERIV-RULE-LEFT)

                    select-none"
                bind:this={ruleElement}
            >
                {rule}
            </div>
        {/if}
    </div>
</div>