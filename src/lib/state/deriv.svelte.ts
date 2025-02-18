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

    readonly render: DerivRenderData;

    readonly root: Deriv = $derived.by(() => {
        return this.parent instanceof Deriv
            ? this.parent.root : this;
    });
   
    /** @param s Serialized Deriv */
    constructor(s: SDeriv = {}) {
        super();
        if (s.conc) this.conc = s.conc;
        this.render = new DerivRenderData(this, s.render ?? {});
        if (s.children)
            this.attachChildren(s.children.map(ch => new Deriv(ch)));
    }
}


// Attach example deriv
export function addExampleProof() {
    viewport.attachChild(
        new Deriv({
            conc: '(A∧B)→C',
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
                            conc: 'B',
                            // rule: '∧E',
                            children: [
                                {
                                    conc: 'A∧B',
                                    // rule: '1',
                                }
                            ]
                        },
                        {
                            conc: 'B→C',
                            // rule: '→E',
                            children: [
                                {
                                    conc: 'A',
                                    // rule: '∧E',
                                    children: [
                                        {
                                            conc: 'A∧B',
                                            // rule: '1'
                                        }
                                    ]
                                },
                                {
                                    conc: 'A→(B→C)'
                                }
                            ]
                        }
                    ]
                }
            ]
        })
    );
}