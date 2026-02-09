<script module lang="ts">
    export type Converter = ReturnType<typeof makeConverter>;
    export function makeConverter(
        x = (x: number) => x,
        y = (y: number) => y,
        scale = (scale: number) => scale,
    ) {
        f.x = x;
        f.y = y;
        f.scale = scale;

        function f<T extends {
            x?: number,
            y?: number,
            scale?: number,
        }>(val: T) {
            const res: Partial<T> = {};
            if ("x"     in val) res.x     = f.x(val.x as number);
            if ("y"     in val) res.y     = f.y(val.y as number);
            if ("scale" in val) res.scale = f.scale(val.scale as number);
            return res as T;
        }

        return f;
    }
    export const fallbackConverter = makeConverter();
</script>

<script lang="ts">
	import draggable, { type DraggableOptions } from '$lib/utils/interact/draggable.svelte';
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import { DT } from '../../../../DT';

    const MIN_SCALE = 0.25;
    const MAX_SCALE = 10;

    /** All properties have to be reactive! */
    interface State {
        x: number;
        y: number;
        scale: number;
		showDotGrid: boolean;
        /** Convert client (px) to panzoom (px) */
        cl2pz: Converter;
        /** Convert panzoom (px) to client (px) */
        pz2cl: Converter;
        /** Convert client (px) to world (UNIT) */
        cl2wrld: Converter;
        /** Convert world (UNIT) to client (px) */
        wrld2cl: Converter;
    }

    interface Props {
        state: State,
        children?: Snippet;
        /** Place elements here to still have the wheel event listeners
         *  for panzoom act on them */
        noPanzoom?: Snippet;
		// Events
		onStart?(e: MouseEvent & { dx: number, dy: number; }): void;
		onEnd?(e: MouseEvent & { dx: number, dy: number; }): void;
		/** ($bindable) */
		element?: HTMLElement | null;
        [key: string]: any;
    }

	let { 
        state: stt, children, noPanzoom, 
		onStart = () => {}, onEnd = () => {},
		element = $bindable(null),
        ...restProps 
    }: Props = $props();
    let rect = $state({
        left: 0, right: 0,
        top: 0, bottom: 0,
        width: 0, height: 0,
    }) as DOMRect;

    const draggableOptions: DraggableOptions = {
		start: onStart,
        move(e) {
            stt.x += e.dx;
            stt.y += e.dy;
        },
		end: onEnd,
        checker(target) {
            return target.classList.contains('panzoom-background');
        },
    };

    stt.cl2pz = makeConverter(
        x => (x - stt.x - rect.left - rect.width / 2) / stt.scale,
        y => (y - stt.y - rect.top - rect.height / 2) / stt.scale,
        scale => scale / stt.scale,
    );
    stt.pz2cl = makeConverter(
        x => (x * stt.scale) + stt.x + rect.left + rect.width / 2,
        y => (y * stt.scale) + stt.y + rect.top + rect.height / 2,
        scale => scale * stt.scale,
    );
    stt.cl2wrld = makeConverter(
        x => stt.cl2pz.x(x) * DT.UNIT,
        y => stt.cl2pz.y(y) * DT.UNIT,
        scale => stt.cl2pz.scale(scale) * DT.UNIT,
    );
    stt.wrld2cl = makeConverter(
        x => stt.pz2cl.x(x / DT.UNIT),
        y => stt.pz2cl.y(y / DT.UNIT),
        scale => stt.pz2cl.scale(scale / DT.UNIT),
    );
    onDestroy(() => stt.cl2pz = stt.pz2cl = stt.cl2wrld = stt.wrld2cl = fallbackConverter);

    // Helper functions
	const clamp = (s: number, min: number, max: number) => Math.min(Math.max(s, min), max);
	stt.scale = clamp(stt.scale, MIN_SCALE, MAX_SCALE); // Clamp initial scale for sanitization
    // Weird step function to determine how the grid acts
    // Plot on desmos. The -1 is an arbitrary constant.
    const modulo = (x: number) => x - Math.min(0, Math.floor(x - 1));
    const updateGridScale = () => grid_scale = Math.pow(2, modulo(Math.log2(stt.scale)));
    
    let grid_scale: number;
    updateGridScale();
	function zoom(factor: number, anchor: { x: number; y: number }) {
		const world_anchor = stt.cl2pz(anchor);
		const old_scale = stt.scale;
		stt.scale = clamp(stt.scale * factor, MIN_SCALE, MAX_SCALE);
        updateGridScale();
		const diff = old_scale - stt.scale;
		stt.x += world_anchor.x * diff;
		stt.y += world_anchor.y * diff;
	}

    function onwheel(e: WheelEvent) {
		e.preventDefault(); // To block native scroll
        zoom(Math.pow(0.8, e.deltaY / 100), { x: e.clientX, y: e.clientY });
	}

    function updateCSS() {
        element!.style.setProperty('--panzoom-x', stt.x + 'px');
        element!.style.setProperty('--panzoom-y', stt.y + 'px');
        element!.style.setProperty('--panzoom-scale', stt.scale / DT.UNIT + '');
        element!.style.setProperty('--panzoom-gs', grid_scale / DT.UNIT + '');
    }
    onMount(updateCSS);
    $effect(() => {
        stt.x;
        stt.y;
        stt.scale;
        updateCSS();
    });
</script>

<div 
    {...restProps}
    bind:this={element} 
    bind:contentRect={null, (r: DOMRect) => rect = r}
    {onwheel}
    class="panzoom **:absolute w-full h-full overflow-hidden {restProps?.class ?? ''}" 
	tabindex="-1"
    use:draggable={draggableOptions}
>
    <!-- Has .dnd to not be disabled on drag and drop, see viewport.svelte -->
    <div class="panzoom-background bg-bg dnd w-full h-full cursor-grab" class:bg-none!={!stt.showDotGrid}></div>
    <div class="origin w-0 h-0 top-2/4 left-2/4">
        {@render children?.()}
    </div>
    {@render noPanzoom?.()}
</div>

<style>
    .panzoom {
		/* Defaults */
		--panzoom-x: 0;
		--panzoom-y: 0;
		--panzoom-scale: 1;
		--panzoom-gs: 100;
        font-size: var(--DERIV-SIZE);
    }

    .panzoom-background {
        background-image: radial-gradient(circle, var(--color-grid) 1px, var(--color-bg) 1.5px);
        --panzoom-bg-size: calc(var(--DERIV-ROW-OFFSET) * var(--panzoom-gs));
		background-size: var(--panzoom-bg-size) var(--panzoom-bg-size);
        background-position: calc(50% + var(--panzoom-x)) calc(50% + var(--panzoom-y));
    }

    .origin {
        transform: translate(var(--panzoom-x), var(--panzoom-y)) scale(var(--panzoom-scale));
        --spacing: calc(var(--UNIT) * 1px);
    }
</style>