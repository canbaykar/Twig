import DerivRenderData from "$lib/components/viewport/deriv/renderData.svelte";
import { Parent } from "$lib/utils/parent.svelte";
import { LogicData } from "./logic/index.svelte";
import viewport, { type Serial } from "./viewport.svelte";

export default class Deriv extends Parent {
	declare readonly children: Deriv[];
	/** ($derived) Utility for parent */
	readonly derivParent: Deriv | null = $derived(this.parent instanceof Deriv ? this.parent : null);
    /** ($derived) */
	readonly root: Deriv = $derived.by(() => {
		return this.parent instanceof Deriv ? this.parent.root : this;
	});
    /** ($derived) */
	readonly address: string = $derived.by(() => {
		return this.parent instanceof Deriv ? this.parent.address + this.childIndex : this.childIndex + '';
	});

	/** ($state) */
	conc = $state('');

	readonly render: DerivRenderData;
	readonly logic: LogicData;

	/** @param s Serialized Deriv */
	constructor(s: Serial<Deriv> = {}) {
		super();
		if (s.conc) this.conc = s.conc;
		if (s.children) this.attachChildren(s.children.map((ch) => new Deriv(ch)));

		this.logic = new LogicData(this);
		this.render = new DerivRenderData(this, s.render ?? {});
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
                xTransform: -130,
                yTransform: 70,
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
                                },
                                // {
                                //     conc: 'a',
                                // },
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
                                        },
                                    ]
                                },
                                {
                                    conc: 'A→(B→C)'
                                }
                            ]
                        }
                    ]
                },
                // {
                //     conc: 'a',
                // },
            ]
        })
    );
}