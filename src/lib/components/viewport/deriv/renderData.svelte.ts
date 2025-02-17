import Deriv from "$lib/state/deriv.svelte";
import viewport from "$lib/state/viewport.svelte";
import type { Parent } from "$lib/utils/parent.svelte";
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
    
    /** ($state, readonly) Inherited. Doesn't matter if not displayed */
    readonly zIndex: number = $state(0);

    constructor(deriv: Deriv, s: SDerivRenderData = {}) {
        this.deriv = deriv;
        if (s.x) this.x = s.x;
        if (s.y) this.y = s.y;
    }

    /** Maintains .all and .zIndex. Call in Deriv! */
    callOnParentChange(newPar: Parent | null) {
        const zid0 = newPar instanceof Deriv 
            ? newPar.render.zIndex 
            : newPar === viewport ? newZID() : 0;
        const displayAction = zid0 ? add : del;

        // Apply this function to yourself and to all your children
        this.deriv.recurse((target: Deriv, zid: number) => { // @ts-expect-error
            target.render.zIndex = zid;
            displayAction(target);
            return zid;
        }, zid0);
    }
}

let lastZID = 1;
function newZID() {
    // TO DO: Maybe add a script here to reduce indexes
    // of 2 other items so indexes don't go to infinity...
    return ++lastZID;
}


// --- TESTS ---
// @vitest-environment jsdom
if (import.meta.vitest) {
    const { it, expect } = import.meta.vitest;

    it('DerivRenderData.all', () => {
        const all_ = $derived(DerivRenderData.all);

        const d0 = new Deriv({ conc: '0' });
        const d1 = new Deriv({ conc: '1' });
        const d2 = new Deriv({ conc: '2' });
        const d3 = new Deriv({ conc: '3' });

        expect(all_.size).toBe(0);

        d2.attach(d1);
        d3.attach(d2);
        d1.attach(viewport);

        expect(all_.size).toBe(3);

        d2.detach();
        
        expect(all_.size).toBe(1);
    });
}