import { Parent } from "$lib/utils/parent.svelte";

export type { ViewportState };
class ViewportState extends Parent {
    x = $state(0);
    y = $state(0);
    scale = $state(1);
}

const viewport = new ViewportState();
export default viewport;