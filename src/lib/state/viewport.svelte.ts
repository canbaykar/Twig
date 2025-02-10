import { Parent } from "$lib/utils/parent.svelte";

export type { Viewport };
class Viewport extends Parent {
    x = $state(0);
    y = $state(0);
    scale = $state(1);
}

const viewport = new Viewport();
export default viewport;