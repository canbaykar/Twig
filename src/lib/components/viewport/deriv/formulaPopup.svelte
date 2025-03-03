<script module lang="ts">
	import type Deriv from "$lib/state/deriv.svelte";
	import viewport from "$lib/state/viewport.svelte";
	import { onMount } from "svelte";
	import { Popup } from "../renderData.svelte";
    import Self from './formulaPopup.svelte';
	import { DT } from "../../../../DT";

    export class FormulaPopup extends Popup<typeof Self> {
        deriv: Deriv;
        element: HTMLElement;
        /**
         * The conc formula element can't be used as an input field bc the caret
         * may be too thin on some browser due to how pazoom transforms the element :(
         * @param deriv The Deriv instance
         * @param element The element containing formula
         */
        constructor(deriv: Deriv, element: HTMLElement) {
            super(Self, {});
            this.deriv = deriv;
            this.element = element;
        }
    }
</script>

<script lang="ts">
    const { popup }: { popup: FormulaPopup } = $props();

    let placement = $state({
        x: 0,
        y: 0,
        height: 0,
        width: 0,
    });
    $effect(() => {
        viewport.render.x;
        viewport.render.y;
        viewport.render.scale;
        popup.deriv.render.width;
        
        const rect = popup.element.getBoundingClientRect();
        placement = {
            x: rect.x,
            y: rect.y,
            height: rect.height,
            width: rect.width,
        };
    });

    let element: HTMLElement;
    onMount(() => {
        popup.element.addEventListener('mouseleave', onmouseleaveOwner);
        popup.element.addEventListener('dragleave', onmouseleaveOwner);
        return () => {
            popup.element.removeEventListener('mouseleave', onmouseleaveOwner);
            popup.element.removeEventListener('dragleave', onmouseleaveOwner);
        }
    });
    
    let draggedOver = false;
    function ondragenter() { draggedOver = true; }
    function ondragleave() { draggedOver = false; }

    function onmouseleaveOwner(e: MouseEvent) {
        if (
            draggedOver ||
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
            top: {placement.y}px;
            left: {placement.x}px;
            line-height: {placement.height}px;
            width: {placement.width}px;
            font-size: {placement.height * DT.derivLH2FS}px;
        "
    rows=1
    bind:this={element}
    {ondragenter}
    {ondragleave}
    {onmouseleave}
    {onblur}
></textarea>