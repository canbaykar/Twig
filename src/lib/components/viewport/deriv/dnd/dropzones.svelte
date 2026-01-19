<script module lang="ts">
	import Deriv from '$lib/state/deriv.svelte';
	import viewport from '$lib/state/viewport.svelte';
	import { getZonesOf, zoneDataObject, type ZoneData, type ZoneState, type ZoneType } from './zoneData';

    /** Takes in world coords, not screen! */
    export function zoneStateFromPoint(x: number, y: number, dragged: Deriv): ZoneState | null {
        const wrld2cl = viewport.render.wrld2cl;
        const el = document.elementFromPoint(wrld2cl.x(x), wrld2cl.y(y));
        if (!(el instanceof HTMLElement) || !el.classList.contains('dropzone')) return null;

        const type = el.dataset.type as ZoneType | undefined;
        const uid = el.dataset.uid;
        if (!type || !uid) return null;

        const deriv = Deriv.lookup(uid);
        if (!deriv) return null;

        return new zoneDataObject[type](deriv, dragged);
    }
</script>

<script lang="ts">    
	interface Props {
        deriv: Deriv;
    }

    let { deriv }: Props = $props();
</script>

{#each getZonesOf(deriv) as data}
	{@render dropzone(data)}
{/each}

<!-- SNIPPETS -->
{#snippet dropzone(data: ZoneData)}
    {@const rect = data.getElementRect(deriv)}
    <div
        class="dropzone dnd h-(--DERIV-ROW-OFFSET)"
        style:left="{rect.left}px"
        style:width="{-2 * rect.left}px"
        style:top="{rect.top}px"
        data-uid={deriv.uid}
        data-type={data.type}
    ></div>
{/snippet}

