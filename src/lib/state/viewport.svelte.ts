import ViewportRenderState from "$lib/components/viewport/renderState.svelte";
import { Parent } from "$lib/utils/parent.svelte";
import Deriv from "./deriv.svelte";


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

export type { Viewport };
/** Works as the root element of everything in panzoom, like document in HTML */
class Viewport extends Parent {
    declare readonly children: Deriv[];

    /** Render state */
    render = new ViewportRenderState();

	serialize(): Serial<Viewport> {
		return {
			children: this.children.map(c => c.serialize()),
			render: this.render.serialize(),
		};
	}
	deserialize(s: Serial<Viewport>) {
		this.detachAll();
		if (s.children) this.attachChildren(s.children.map(c => new Deriv(c)));
		if (s.render) this.render.deserialize(s.render);
		else this.render.reset();
	}
	reset() {
		this.deserialize({});
	}
}

const viewport = new Viewport();
export default viewport;