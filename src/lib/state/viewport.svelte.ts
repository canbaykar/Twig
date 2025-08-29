import ViewportRenderState from "$lib/components/viewport/renderState.svelte";
import { Parent } from "$lib/utils/parent.svelte";
import type Deriv from "./deriv.svelte";

export type { Viewport };
/** Works as the root element of everything in panzoom, like document in HTML */
class Viewport extends Parent {
    declare readonly children: Deriv[];

    /** Render state */
    render = new ViewportRenderState();
}

const viewport = new Viewport();
export default viewport;

// (RecursivePartial) Thanks to stackoverflow.com/a/51365037/13217729
/** 
 * Util type for complex clonable objects. A class T's constructor
 * can take Serial<T> as its only argument for a simple cloning
 * interface. Use for viewport's children.
 */
export type Serial<T> = {
    [P in keyof T]?:
      T[P] extends (infer U)[] ? Serial<U>[] :
      T[P] extends object | undefined ? Serial<T[P]> :
      T[P];
  };