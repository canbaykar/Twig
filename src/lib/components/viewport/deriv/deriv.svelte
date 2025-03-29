<script lang="ts">
    import Bar from './bar.svelte';
	import Deriv from '$lib/state/deriv.svelte';
    import Formula from './formula.svelte';
    import GripVertical from '~icons/lucide/grip-vertical';
	import type { DraggableOptions } from '$lib/utils/interact/draggable.svelte';
	import draggable from '$lib/utils/interact/draggable.svelte';
	import viewport from '$lib/state/viewport.svelte';
	import { DT } from '../../../../DT';

    interface Props {
        data: Deriv;
    }
    
    let { data }: Props = $props();

    // Temporary
    let label = $state('1');
    let rule = $state('∧E');
    // let rule = $state('2');
    
    const opt: DraggableOptions = {
        cursor: "all-scroll",
        start(e) {
            if (data.parent === viewport)
                // Detach & reattach to get to front
                data.attach(viewport); 
            else {
                const x = data.render.x;
                const y = data.render.y;
                data.attach(viewport);
                data.render.xTransform = x;
                data.render.yTransform = y;
            }
                
        },
        move(e) {
            data.render.xTransform += e.dx * viewport.render.screen2viewport;
            data.render.yTransform += e.dy * viewport.render.screen2viewport;
            // Calculate center point
            const x = data.render.x + data.render.width / 2;
            const y = data.render.y + DT.derivLineHeightN / 2;
        },
    };
</script>

<div 
    class="deriv" 
    style:translate="{data.render.x}px {data.render.y}px" 
    style:z-index={data.render.zId}
>
    <Formula {data}>
        {@render handle("right-[100%]")}
        {@render handle("left-[100%]")}
    </Formula>
    <Bar {data} {rule} {label} />
</div>

<!-- TODO: Remove relative! -->
{#snippet handle(tw: string)}
    <div use:draggable={opt} class="{tw} popup inset-y-0 cursor-all-scroll flex items-center">
        <GripVertical width="0.75em" height="0.75em" class="relative!" />
    </div>
{/snippet}

<style>
    /* Preprocessor removes it if I do ".popup" 😑 */
    .deriv :global(.popup) {
        opacity: 0;
    }
    .deriv:hover :global(.popup) {
        opacity: 1;
    }
</style>
