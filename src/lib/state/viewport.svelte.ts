import ViewportRenderData from "$lib/components/viewport/renderData.svelte";
import { Parent } from "$lib/utils/parent.svelte";

export type { Viewport };
/** Works as the root element of everything in panzoom, like document in HTML */
class Viewport extends Parent {
    /** Render data */
    render = new ViewportRenderData();
}

const viewport = new Viewport();
export default viewport;