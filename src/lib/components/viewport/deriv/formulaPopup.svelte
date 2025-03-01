<script module lang="ts">
	import type Deriv from "$lib/state/deriv.svelte";
	import viewport from "$lib/state/viewport.svelte";
	import { onMount } from "svelte";
	import { Popup } from "../renderData.svelte";
    import Self from './formulaPopup.svelte';
	import { derivDTjs } from "./deriv.DT";

    export class FormulaPopup extends Popup<typeof Self> {
        deriv: Deriv;
        element: HTMLElement;
        /** ($state) */
        placement = $state({
            x: 0,
            y: 0,
            height: 0,
            width: 0,
        });

        /**
         * The conc formula element can't be used as an input field bc the caret
         * may be too thin on some browser due to how pazoom transforms the element :(
         * @param deriv The Deriv instance
         * @param element The element containing formula
         */
        constructor(deriv: Deriv, element: HTMLElement) {
            super(Self, {}, () => {
                viewport.render.x;
                viewport.render.y;
                viewport.render.scale;
                deriv.render.width;
                
                const rect = element.getBoundingClientRect();
                this.placement = {
                    x: rect.x,
                    y: rect.y,
                    height: rect.height,
                    width: rect.width,
                };
            });

            this.deriv = deriv;
            this.element = element;
        }
    }
</script>

<script lang="ts">
    const { popup }: { popup: FormulaPopup } = $props();

    const H2FS = 1 / 1.25; ////////////////////////////////

    let element: HTMLElement;
    onMount(() => {
        popup.element.addEventListener('mouseleave', onmouseleaveOwner);
        return () => 
            popup.element.removeEventListener('mouseleave', onmouseleaveOwner);
    });

    function onmouseleaveOwner(e: MouseEvent) {
        if (
            e.relatedTarget === element ||
            document.activeElement === element
        ) return;
        popup.detach();
    }
    function onmouseleave() {
        if (document.activeElement === element) return;
        popup.detach();
    }
    function onblur() {
        if (
            element.matches(':hover') ||
            popup.element.matches(':hover')
        ) return;
        popup.detach();
    }
</script>

<textarea
    bind:value={popup.deriv.conc}
    class="absolute text-transparent text-center font-math caret-fg overflow-hidden resize-none"
    style="
            top: {popup.placement.y}px;
            left: {popup.placement.x}px;
            line-height: {popup.placement.height}px;
            width: {popup.placement.width}px;
            font-size: {popup.placement.height * H2FS}px;
        "
    rows=1
    bind:this={element}
    {onmouseleave}
    {onblur}
></textarea>