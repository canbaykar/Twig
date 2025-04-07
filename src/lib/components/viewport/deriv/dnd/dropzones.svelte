<script lang="ts">
	import Deriv from '$lib/state/deriv.svelte';
	import { DT } from '../../../../../DT';

    interface Props {
        data: Deriv;
    }
    
    let { data }: Props = $props();
    
    const render = data.render;
    const padding = 0.75 * DT.derivRowOffsetN;
    const barWidth2 = render.barWidth / 2;
    const N = data.children.length - 1;
</script>

{#if data.root === data}
    {@const right = render.width / 2 + padding}
    <!-- Root -->
    {@render dropzone(-right, right, 0)}
    <!-- Bottom -->
    {@render dropzone(Math.max(-barWidth2, -right), Math.min(barWidth2, right), 1)}
{/if}

{#if N === -1}
    <!-- Top -->
    {@render dropzone(-barWidth2, barWidth2)}
{:else}
    {@const x = render.x}
    {@const c0r = data.children[0].render}
    {@const cNr = data.children[N].render}
    <!-- Leaf -->
    {@render dropzone(Math.min(-barWidth2, c0r.x - x - c0r.width / 2 - padding), Math.max(cNr.x - x + cNr.width / 2 + padding, barWidth2))}
{/if}

<!-- SNIPPETS -->
{#snippet dropzone(left: number, right: number, y = -1)}
    <div
        class="dropzone outline-10 h-(--DERIV-ROW-OFFSET) bg-amber-500/10 [.active-dropzone]:bg-sky-500/10"
        style:left="{left}px"
        style:width="{right - left}px"
        style:top="{y * DT.derivRowOffsetN - DT.derivBarBottomN}px"
        data-address={data.address}
    ></div>
{/snippet}

