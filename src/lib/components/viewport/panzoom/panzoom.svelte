<script lang="ts">
	import { onMount, type Snippet } from 'svelte';

    /** All properties has to be reactive! */
    interface Data {
        x: number;
        y: number;
        scale: number;
    }

    interface Props {
        data: Data,
        children?: Snippet<[]>;
    }

	let { data, children }: Props = $props();
</script>

<div class="panzoom w-full h-full overflow-hidden">
    <div class="background w-full h-full cursor-grab"></div>
    <div class="origin w-[0] h-[0] absolute top-2/4 left-2/4">
        {@render children?.()}
    </div>
</div>

<style>
    .background {
        /* Temporary constants */
        --LINE-HEIGHT: 34.5;
        --UNIT: 2px;
        
		/* Defaults */
		--panzoom-x: 0;
		--panzoom-y: 0;
		--panzoom-scale: 1;
		--panzoom-gs: 1;

        background: radial-gradient(circle, hsl(var(--border)) 1px, hsl(var(--background)) 1.5px);
        --panzoom-bg-size: calc(var(--LINE-HEIGHT) * var(--panzoom-gs) * var(--UNIT));
		background-size: var(--panzoom-bg-size) var(--panzoom-bg-size);
        background-position: calc(50% + var(--panzoom-x)) calc(50% + var(--panzoom-y));
    }
</style>