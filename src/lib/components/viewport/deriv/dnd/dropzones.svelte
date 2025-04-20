<script module lang="ts">
	import Deriv from '$lib/state/deriv.svelte';
	import viewport from '$lib/state/viewport.svelte';
	import { zoneTypes, type ZoneData, type ZoneType } from './zoneData';

    /** Takes in world coords, not screen! */
    export function zoneDataFromPoint(x: number, y: number): ZoneData | null {
        const wrld2cl = viewport.render.wrld2cl;
        const el = document.elementFromPoint(wrld2cl.x(x), wrld2cl.y(y));
        if (!(el instanceof HTMLElement) || !el.classList.contains('dropzone')) return null;

        const type = el.dataset.type as ZoneType | undefined;
        const adr = el.dataset.address;
        if (!type || !adr) return null;

        const deriv = Deriv.lookup(adr);
        if (!deriv) return null;

        return new zoneTypes[type](deriv, x);
    }
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
    <!-- {@render dropzone('bottom')} -->
{/if}

{#if data.children.length === 0}
    <!-- Top -->
    {@render dropzone('top')}
{:else}
    <!-- Leaf -->
    {@render dropzone('child')}
{/if}

<!-- SNIPPETS -->
{#snippet dropzone(type: ZoneType)}
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

