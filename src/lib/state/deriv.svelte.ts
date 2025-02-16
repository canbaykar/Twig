import DerivRenderData, { type SDerivRenderData } from "$lib/components/viewport/deriv/renderData.svelte";
import { Parent } from "$lib/utils/parent.svelte";
import viewport from "./viewport.svelte";

/** Serialized Deriv */
export declare interface SDeriv {
    conc?: string;
    children?: SDeriv[];
    render?: SDerivRenderData;
}

export default class Deriv extends Parent {
    declare readonly children: Deriv[];
    /** ($state) */
    conc = $state('');

    render: DerivRenderData;
   
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
        this.render = new DerivRenderData(this);
    }

    // See Child
    onParentChange(newParent: Parent | null) {
        this.render.callOnParentChange(newParent);
    }
}

// Attach example deriv
viewport.attachChild(
    new Deriv({
        conc: '(A∧{Φ})→C',
        // rule: '→I',
        // label: '1',
        render: {
            x: -130,
            y: 70,
        },
        children: [
            {
                conc: 'C',
                // rule: '→E',
                children: [
                    {
                        conc: '{Φ}',
                        // rule: '∧E',
                        children: [
                            {
                                conc: 'A∧{Φ}',
                                // rule: '1',
                            }
                        ]
                    },
                    {
                        conc: '{Φ}→C',
                        // rule: '→E',
                        children: [
                            {
                                conc: 'A',
                                // rule: '∧E',
                                children: [
                                    {
                                        conc: 'A∧{Φ}',
                                        // rule: '1'
                                    }
                                ]
                            },
                            {
                                conc: 'A→({Φ}→C)'
                            }
                        ]
                    }
                ]
            }
        ]
    })
);