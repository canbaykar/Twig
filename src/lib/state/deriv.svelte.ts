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
        this.render = new DerivRenderData(this, s.render ?? {});
        if (s.children)
            this.attachChildren(s.children.map(ch => new Deriv(ch)));
    }

    // See Child
    onParentChange(newParent: Parent | null) {
        this.render.callOnParentChange(newParent);
    }

    /** Recursively runs f on itself and all descendents.
     *  f mustn't use a 2nd argument unless using the 2nd overload of this. */
    recurse<T>(f: (target: Deriv) => T): void;
    recurse<T>(f: (target: Deriv, res: T) => T, res: T): void;
    recurse<T>(f: (target: Deriv, res: T) => T, res?: T) {
        const par = this.parent;
        if (par instanceof Deriv) safeRecurse(this, f, par, res as T);
        else unsafeRecurse(this, f, res as T);
    }
}

// Recurse utils
function safeRecurse<T>(target: Deriv, f: (target: Deriv) => T        , root: Parent): void;
function safeRecurse<T>(target: Deriv, f: (target: Deriv, res: T) => T, root: Parent, res: T): void;
function safeRecurse<T>(target: Deriv, f: (target: Deriv, res: T) => T, root: Parent, res: T = undefined as T) {
    res = f(target, res);
    if (target === root) {
        root.detach();
        console.error("Circularity: Parent is it's own descendant! Detached Parent.");
    }
    target.children.forEach((ch) => safeRecurse(ch, f, root, res));
}
function unsafeRecurse<T>(target: Deriv, f: (target: Deriv) => T): void;
function unsafeRecurse<T>(target: Deriv, f: (target: Deriv, res: T) => T, res: T): void;
function unsafeRecurse<T>(target: Deriv, f: (target: Deriv, res: T) => T, res: T = undefined as T) {
    res = f(target, res);
    target.children.forEach((ch) => unsafeRecurse(ch, f, res));
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