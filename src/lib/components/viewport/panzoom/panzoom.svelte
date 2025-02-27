<script lang="ts">
	import draggable, { type DraggableOptions } from '$lib/utils/interact/draggable.svelte';
	import { onMount, type Snippet } from 'svelte';
	import { derivDT } from '../deriv/deriv.DT';

    const MIN_SCALE = 0.25;
    const MAX_SCALE = 10;

    /** All properties has to be reactive! */
    interface Data {
        x: number;
        y: number;
        scale: number;
    }

    interface Props {
        data: Data,
        children?: Snippet;
    }

	let { data, children }: Props = $props();
    let element: HTMLElement;
    let rect: DOMRect;

    const draggableOptions: DraggableOptions = {
        move(e) {
            data.x += e.dx;
            data.y += e.dy;
            updateCSS();
        },
        checker(target) {
            return target.classList.contains('panzoom-background');
        },
    };

    /** Client coords to world coords */
	function client2worldPx(p: { x: number; y: number }) {
        return {
            x: (p.x - data.x - rect.left - rect.width / 2) / data.scale,
            y: (p.y - data.y - rect.top - rect.height / 2) / data.scale,
        };
	}

    // Helper functions for zoom(...) below
	const clamp = (s: number, min: number, max: number) => Math.min(Math.max(s, min), max);
    // Weird step function to determine how the grid acts
    // Plot on desmos. The -1 is an arbitrary constant.
    const modulo = (x: number) => x - Math.min(0, Math.floor(x - 1));
    const updateGridScale = () => grid_scale = Math.pow(2, modulo(Math.log2(data.scale)));
    
    let grid_scale: number;
    updateGridScale();
	function zoom(factor: number, anchor: { x: number; y: number }) {
		const world_anchor = client2worldPx(anchor);
		const old_scale = data.scale;
		data.scale = clamp(data.scale * factor, MIN_SCALE, MAX_SCALE);
        updateGridScale();
		const diff = old_scale - data.scale;
		data.x += world_anchor.x * diff;
		data.y += world_anchor.y * diff;
	}

    function onwheel(e: WheelEvent) {
		e.preventDefault(); // To block native scroll
        zoom(Math.pow(0.8, e.deltaY / 100), { x: e.clientX, y: e.clientY });
        updateCSS();
	}

    function updateCSS() {
        element.style.setProperty('--panzoom-x', data.x + 'px');
        element.style.setProperty('--panzoom-y', data.y + 'px');
        element.style.setProperty('--panzoom-scale', data.scale / derivDT.UNIT + '');
        element.style.setProperty('--panzoom-gs', grid_scale / derivDT.UNIT + '');
    }
    onMount(updateCSS);
</script>

<div 
    bind:this={element} 
    bind:contentRect={null, (r: DOMRect) => rect = r}
    {onwheel}
    class="panzoom w-full h-full overflow-hidden" 
    use:draggable={draggableOptions}
>
    <div class="panzoom-background w-full h-full cursor-grab"></div>
    <div class="origin w-0 h-0 absolute top-2/4 left-2/4">
        {@render children?.()}
    </div>
</div>

<style>
    .panzoom {
		/* Defaults */
		--panzoom-x: 0;
		--panzoom-y: 0;
		--panzoom-scale: 1;
		--panzoom-gs: 100;
        font-size: calc(var(--DERIV-FS) * 1px);
    }

    .panzoom-background {
        background: radial-gradient(circle, var(--color-border) 1px, var(--color-bg) 1.5px);
        --panzoom-bg-size: calc(var(--DERIV-ROW-OFFSET) * var(--panzoom-gs) * 1px);
		background-size: var(--panzoom-bg-size) var(--panzoom-bg-size);
        background-position: calc(50% + var(--panzoom-x)) calc(50% + var(--panzoom-y));
    }

    .origin {
        transform: translate(var(--panzoom-x), var(--panzoom-y)) scale(var(--panzoom-scale));
        --spacing: calc(var(--UNIT) * 1px);
    }
</style>