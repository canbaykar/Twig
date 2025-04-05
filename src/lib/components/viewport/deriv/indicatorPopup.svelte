<script module lang="ts">
	import { Popup } from "../renderData.svelte";
    import Self from "./indicatorPopup.svelte";

    export class IndicatorPopup extends Popup<typeof Self> {
        left = $state(-100);
        top = $state(-100);
        width = $state(-100);
        height = $state(-100);
        opacity = $state(0);

        constructor() {
            super(Self, {});
        }
    }
</script>

<script lang="ts">
    const { popup }: { popup: IndicatorPopup } = $props();
</script>

<div
    class="outline-1 bg-indigo-300/10 pointer-events-none"
    style:left="{popup.left}px"
    style:top="{popup.top}px"
    style:width="{popup.width}px"
    style:height="{popup.height}px"
    style:opacity={popup.opacity}
></div>