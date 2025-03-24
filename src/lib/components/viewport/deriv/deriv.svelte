<script lang="ts">
    import Bar from './bar.svelte';
	import { browser } from "$app/environment";
	import type Deriv from "$lib/state/deriv.svelte";
    import Formula from './formula.svelte';

    interface Props {
        data: Deriv;
    }
    
    let { data }: Props = $props();

    const render = data.render;

    // Temporary
    let label = $state('1');
    let rule = $state('∧E');
    // let rule = $state('2');

    let formulaElement: HTMLElement | null = $state(null);
    let ruleElement: HTMLElement | null = $state(null);
    let labelElement: HTMLElement | null = $state(null);
    
    // Maintain widths
    const setFormulaWidth = () => render.width = formulaElement ? formulaElement.offsetWidth : 0;
    const setRuleWidth = () => render.ruleWidth = ruleElement ? ruleElement.offsetWidth : 0;
    const setLabelWidth = () => render.labelWidth = labelElement ? labelElement.offsetWidth : 0;
    $effect(() => { data.conc; setFormulaWidth(); });
    $effect(() => { rule;      setRuleWidth(); });
    $effect(() => { label;     setLabelWidth(); });
    // (Annoyingly have to re-set after font load)
    if (browser) 
        document.fonts.load('12px "M PLUS 1p"').then(() => {
            setFormulaWidth();
            setRuleWidth();
            setLabelWidth();
        });
</script>

<div class="**:absolute font-math">
    <Formula {data} bind:element={formulaElement}></Formula>
    <Bar {data} bind:labelElement bind:ruleElement {rule} {label}></Bar>
</div>