<script lang="ts">
	import Deriv from '$lib/state/deriv.svelte';
	import { zoneTypes, type DropzoneType } from './zoneData';

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
    {@const op = zoneTypes[type].getElementRect(data)}
    <div
        class="dropzone h-(--DERIV-ROW-OFFSET)"
        style:left="{op.left}px"
        style:width="{-2 * op.left}px"
        style:top="{op.top}px"
        data-address={data.address}
        data-type={type}
    ></div>
{/snippet}

