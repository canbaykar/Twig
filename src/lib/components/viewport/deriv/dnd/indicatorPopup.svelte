<script module lang="ts">
	import { Popup } from "../../renderState.svelte";
    import Self from "./indicatorPopup.svelte";

    export class IndicatorPopup extends Popup<typeof Self> {
        left = $state(0);
        top = $state(0);
        width = $state(0);
        height = $state(0);
        opacity = $state(0);

        constructor() {
            super(Self, true, {});
        }
    }
</script>

<script lang="ts">
	import { DT } from "../../../../../DT";
	import viewport from "$lib/state/viewport.svelte";

    const { popup }: { popup: IndicatorPopup } = $props();
</script>

<div
    class="outline-1 bg-indigo-300/10 pointer-events-none origin-top-left rounded-md"
    style:left="{popup.left}px"
    style:top="{popup.top}px"
    style:width="{popup.width / DT.UNIT * viewport.render.scale}px"
    style:height="{popup.height / DT.UNIT * viewport.render.scale}px"
    style:opacity={popup.opacity}
    style:scale={DT.UNIT / viewport.render.scale}
></div>