import Deriv from "$lib/state/deriv.svelte";
import viewport from "$lib/state/viewport.svelte";
import { SvelteSet } from "svelte/reactivity";

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
    
    x = $state(0);
    y = $state(0);
    
    /** ($derived, readonly) Inherited. Doesn't matter if not displayed */
    readonly zIndex: number = $derived.by(() => {
        const par = this.deriv.parent;
        return par instanceof Deriv 
            ? par.render.zIndex
            : par === viewport
                ? newZID()
                : 0;
    });

    constructor(deriv: Deriv, s: SDerivRenderData = {}) {
        this.deriv = deriv;
        if (s.x) this.x = s.x;
        if (s.y) this.y = s.y;

        $effect(() => {
            (this.zIndex ? add : del)(this.deriv);
        })
    }
}

let lastZID = 1;
function newZID() {
    // TODO: Maybe add a script here to reduce indexes
    // of 2 other items so indexes don't go to infinity...
    return ++lastZID;
}


// --- TESTS ---
// Can't test $effect right now :(
// Even with environment: 'jsdom', $effect.root and flushSync()
// nothing works 😭😭😭