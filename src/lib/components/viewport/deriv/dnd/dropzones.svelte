<script module lang="ts">
	import Deriv from '$lib/state/deriv.svelte';
	import { DT } from '../../../../../DT';

    export type DropzoneType = keyof typeof dropzonePositioner;

    const row2height = (row: number) => row * DT.derivRowOffsetN - DT.derivBarBottomN;
    /** Functions by zone type, returning (numbers) { left: number, top: number }
     *  (relative to the deriv that renders the zone). */
    export const dropzonePositioner = {
        root(deriv: Deriv): { left: number; top: number } {
            return { 
                left: -deriv.render.width / 2 - DT.derivDropZonePaddingN, 
                top: row2height(0),
            };
        },
        bottom(deriv: Deriv): { left: number; top: number } {
            return { 
                left: -Math.min(deriv.render.width / 2 + DT.derivDropZonePaddingN, deriv.render.barWidth / 2), 
                top: row2height(1),
            };
        },
        top(deriv: Deriv): { left: number; top: number } {
            return { 
                left: -deriv.render.barWidth / 2, 
                top: row2height(-1),
            };
        },
        child(deriv: Deriv): { left: number; top: number } {
            const c0r = deriv.children[0].render;
            return {
                left: Math.min(-deriv.render.barWidth / 2, c0r.x - deriv.render.x - c0r.width / 2 - DT.derivDropZonePaddingN), 
                top: row2height(-1),
            };
        }
    };
</script>

<script lang="ts">
    interface Props {
        data: Deriv;
    }

    let { data }: Props = $props();
</script>

{#if data.root === data}
    <!-- Root -->
    {@render dropzone('root')}
    <!-- Bottom -->
    {@render dropzone('bottom')}
{/if}

{#if data.children.length === 0}
    <!-- Top -->
    {@render dropzone('top')}
{:else}
    <!-- Leaf -->
    {@render dropzone('child')}
{/if}

<!-- SNIPPETS -->
{#snippet dropzone(type: DropzoneType)}
    {@const op = dropzonePositioner[type](data)}
    <div
        class="dropzone h-(--DERIV-ROW-OFFSET)"
        style:left="{op.left}px"
        style:width="{-2 * op.left}px"
        style:top="{op.top}px"
        data-address={data.address}
        data-type={type}
    ></div>
{/snippet}

