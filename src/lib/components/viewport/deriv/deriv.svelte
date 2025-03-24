<script module lang="ts">
	import { browser } from "$app/environment";
	import { onDestroy } from "svelte";

    /** Use only on component initiation. For updating inline element width variables after font load. */
    let onFontLoad = (f: () => void) => {};

    if (browser) {
        let instructions: (() => void)[] = [];
        onFontLoad = f => {
            const i = instructions.push(f) - 1;
            onDestroy(() => {
                if (instructions.length) instructions[i] = () => {};
            });
        }
        document.fonts.load('12px "M PLUS 1p"').then(() => {
            onFontLoad = () => {};
            for (const f of instructions) f();
            instructions = [];
        });
    }

    /**
     * Utility to maintain a width variable for an inline text element that only
     * changes when text changes. (text variable has to be reactive e.g. $state)
     * Accounts for width change with font load (M PLUS 1p).
     * @param textGetter Function that gets text value for reactivity in $effect
     * @param widthUpdater Function that updates the width variable
     */
    export function maintainWidth(textGetter: () => any, widthUpdater: () => void) {
        $effect(() => { textGetter(); widthUpdater(); });
        onFontLoad(widthUpdater);
    }
</script>

<script lang="ts">
    import Bar from './bar.svelte';
	import type Deriv from "$lib/state/deriv.svelte";
    import Formula from './formula.svelte';

    interface Props {
        data: Deriv;
    }
    
    let { data }: Props = $props();

    // Temporary
    let label = $state('1');
    let rule = $state('∧E');
    // let rule = $state('2');
</script>

<div class="**:absolute font-math">
    <Formula {data}></Formula>
    <Bar {data} {rule} {label}></Bar>
</div>