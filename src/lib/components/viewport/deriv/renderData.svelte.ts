import Deriv from "$lib/state/deriv.svelte";
import viewport from "$lib/state/viewport.svelte";
import { SvelteSet } from "svelte/reactivity";
import { derivDT } from "./deriv.DT";

/** Serialized DerivRenderData */
export interface SDerivRenderData {
    x?: number;
    y?: number;
}

const displayed = new SvelteSet<Deriv>();
const add = displayed.add.bind(displayed);
const del = displayed.delete.bind(displayed);

export default class DerivRenderData {
    /** SvelteSet of all displayed derivs */
    static get displayed() { return displayed }
    /** Run this in onDestroy */
    static onDestroy() {
        displayed.clear();
        // stuff like cancelanimationframe here...
    }

    deriv: Deriv;

    /** Left of label to right of rule. Maintained in deriv.svelte */
    width: number = $state(0);

    // The deriv has a base location and a transform on top 
    // (+ transforms from predescessors).
    xTransform = $state(0);
    yTransform = $state(0);
    // Final transforms
    // Transform is accumulative (inheriting from parent)
    private readonly xAcc: number = $derived.by(() => {
        const par = this.deriv.parent;
        const parAcc = par instanceof Deriv ? par.render.xAcc : 0;
        return parAcc + this.xTransform;
    });
    // y has an extra row offset in transform accumulator
    private readonly yAcc: number = $derived.by(() => {
        const par = this.deriv.parent; 
        const parAcc = par instanceof Deriv ? par.render.yAcc - derivDT.derivRowOffset : 0;
        return parAcc + this.yTransform;
    });
    xBase = $state(0);
    // This is the final location (natural + offset)
    readonly x: number = $derived(this.xBase + this.xAcc);
    readonly y: number = $derived(this.yAcc);

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

        // Maintain displayed
        $effect(() => { (this.displayed ? add : del)(this.deriv) })
    }
}


// --- TESTS ---
// Can't test $effect right now :(
// Even with environment: 'jsdom', $effect.root and flushSync()
// nothing works 😭😭😭