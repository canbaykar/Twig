import DerivRenderData from "$lib/components/viewport/deriv/renderData.svelte";
import { Parent } from "$lib/utils/parent.svelte";

/** Serialized SDeriv */
export declare interface SDeriv {
    conc?: string;
    children?: SDeriv[];
}

export default class Deriv extends Parent {
    declare readonly children: Deriv[];
    /** ($state) */
    conc = $state('');

    render = new DerivRenderData(this);
   
    /**
	 * @param s Serialized Deriv
	 * @param parent Initial parent (better to set here than later)
	 * @param index Index to add to initial parent with
	 */
    constructor(s: SDeriv = {}) {
        super();
        if (s.conc) this.conc = s.conc;
        if (s.children)
            this.attachChildren(s.children.map(ch => new Deriv(ch)));
    }

    // See Child
    onParentChange(newParent: Parent | null) {
        this.render.callOnParentChange(newParent);
    }
}