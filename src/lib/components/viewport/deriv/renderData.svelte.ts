import Deriv from "$lib/state/deriv.svelte";
import viewport from "$lib/state/viewport.svelte";
import { SvelteSet } from "svelte/reactivity";
import { derivDT } from "./deriv.DT";

/** Serialized DerivRenderData */
export interface SDerivRenderData {
    x?: number;
    y?: number;
}

const all = new SvelteSet<Deriv>();
const add = all.add.bind(all);
const del = all.delete.bind(all);

export default class DerivRenderData {
    /** SvelteSet of all **displayed** derivs */
    static get all() { return all }

    deriv: Deriv;

    /** Left of label to right of rule. Maintained in deriv.svelte */
    width: number = $state(0);

    // The deriv has a natural location calculated using parent 
    // and a transform on top of it (below).
    xTransform = $state(0);
    yTransform = $state(0);
    // This is the final location (natural + offset)
    readonly x: number = $derived.by(() => {
        const par = this.deriv.parent;
        const nat = par instanceof Deriv ? par.render.x : 0;
        return Math.round(nat + this.xTransform);
    });
    readonly y: number = $derived.by(() => {
        const par = this.deriv.parent;
        const nat = par instanceof Deriv ? par.render.y - derivDT.derivRowOffset : 0;
        return Math.round(nat + this.yTransform);
    });

    /** ($derived, readonly) Inherited. */
    readonly displayed: boolean = $derived.by(() => {
        const par = this.deriv.parent;
        return par instanceof Deriv
            ? par.render.displayed
            : par === viewport;
    });

    constructor(deriv: Deriv, s: SDerivRenderData = {}) {
        this.deriv = deriv;
        if (s.x) this.xTransform = s.x;
        if (s.y) this.yTransform = s.y;

        // Maintain all
        $effect(() => { (this.displayed ? add : del)(this.deriv) })
    }
}


// --- TESTS ---
// Can't test $effect right now :(
// Even with environment: 'jsdom', $effect.root and flushSync()
// nothing works 😭😭😭