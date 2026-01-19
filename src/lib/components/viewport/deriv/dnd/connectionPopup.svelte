<script module lang="ts">
	import { Popup } from "../../renderState.svelte";
    import Self from "./connectionPopup.svelte";

    export class ConnectionPopup extends Popup<typeof Self> {
        x1 = $state(0);
        y1 = $state(0);
        x2 = $state(0);
        y2 = $state(0);
		connected = $state(true);

        constructor() {
            super(Self, true, {});
        }
    }
</script>

<script lang="ts">
	import { DT } from "../../../../../DT";

    const { popup }: { popup: ConnectionPopup } = $props();
</script>

<svg
	class="h-px w-px z-2 overflow-visible pointer-events-none text-focus-outline"
	viewBox="0 0 1 1"
	fill="currentColor"
	stroke="currentColor"
>
	{#if popup.connected}
		<line x1={popup.x1} y1={popup.y1} x2={popup.x2} y2={popup.y2} stroke-width={DT.UNIT} />
		<circle cx={popup.x2} cy={popup.y2} r={1.5 * DT.UNIT} />
	{/if}
	<circle cx={popup.x1} cy={popup.y1} r={1.5 * DT.UNIT} />
</svg>