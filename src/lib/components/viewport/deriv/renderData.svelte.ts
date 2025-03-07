import Deriv from "$lib/state/deriv.svelte";
import viewport from "$lib/state/viewport.svelte";
import { SvelteSet } from "svelte/reactivity";
import { treeData, type TreeData } from "./treeData";
import { DT } from "../../../../DT";

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

    /** ($state) Width of formula. Maintained in deriv.svelte */
    width = $state(0);
    /** ($state) Maintained in deriv.svelte */
    ruleWidth = $state(0);
    /** ($state) Maintained in deriv.svelte */
    labelWidth = $state(0);

    // Tree rendering logic
    private readonly tree: TreeData = $derived.by(() => 
        treeData(
            this.width, 
            this.deriv.children.map(c => c.render.tree),
            this.labelWidth,
            this.ruleWidth,
        )
    )
    private readonly xBase: number = $derived.by(() => {
        const par = this.deriv.parent;
        return par instanceof Deriv
            ? par.render.xBase 
                + par.render.tree.offsets[this.deriv.childIndex]
            : 0;
    });
    // The deriv has a base location and a transform on top 
    // (+ transforms from predescessors).
    xTransform = $state(0);
    yTransform = $state(0);
    // Final transforms
    // Transform is accumulative (inheriting from parent)
    private readonly acc: { x: number, y: number } = $derived.by(() => {
        const par = this.deriv.parent;
        return par instanceof Deriv 
            ? {
                x: par.render.acc.x + this.xTransform,
                y: par.render.acc.y - DT.derivRowOffsetN + this.yTransform,
            } : {
                x: this.xTransform,
                y: this.yTransform,
            };
    });
    // This is the final location (base + transform)
    readonly x: number = $derived(this.xBase + this.acc.x);
    readonly y: number = $derived(this.acc.y);

    readonly barLeft = $derived(this.x + this.tree.barLeft);
    readonly barWidth = $derived(this.tree.barRight - this.tree.barLeft);

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