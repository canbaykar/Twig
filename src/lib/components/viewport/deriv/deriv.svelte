<script lang="ts">
    import Bar from './bar.svelte';
	import { browser } from "$app/environment";
	import type Deriv from "$lib/state/deriv.svelte";
	import { FormulaPopup } from "./formulaPopup.svelte";

    interface Props {
        data: Deriv;
    }
    
    let { data }: Props = $props();

    const render = data.render;

    // Temporary
    let label = $state('1');
    let rule = $state('∧E');
    // let rule = $state('2');

    let element: HTMLElement;
    let ruleElement: HTMLElement | null = $state(null);
    let labelElement: HTMLElement | null = $state(null);
    
    // Maintain widths
    const setWidth = () => data.render.width = element.offsetWidth;
    const setRuleWidth = () => render.ruleWidth = ruleElement ? ruleElement.offsetWidth : 0;
    const setLabelWidth = () => render.labelWidth = labelElement ? labelElement.offsetWidth : 0;
    $effect(() => { data.conc; setWidth(); });
    $effect(() => { rule;      setRuleWidth(); });
    $effect(() => { label;     setLabelWidth(); });
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

<div class="**:absolute font-math">
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

    <Bar {data} bind:labelElement bind:ruleElement {rule} {label}></Bar>
</div>