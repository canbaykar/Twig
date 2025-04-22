import Deriv from "$lib/state/deriv.svelte";
import viewport, { type Serial } from "$lib/state/viewport.svelte";
import { SvelteSet } from "svelte/reactivity";
import { treeData, type TreeData } from "./treeData";
import { DT } from "../../../../DT";
import { browser } from "$app/environment";
import { onDestroy } from "svelte";

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

    /** ($state) Width of formula element. Maintained in formula.svelte. Use width instead. */
    baseWidth = $state(0);
    /** ($state) Maintained in bar.svelte */
    ruleWidth = $state(0);
    /** ($state) Maintained in bar.svelte */
    labelWidth = $state(0);

    // Tree rendering logic
    private readonly tree: TreeData = $derived.by(() => 
        this.treeOverwrite ?? treeData(
            this.baseWidth, 
            this.deriv.children.map(c => c.render.tree),
            this.labelWidth,
            this.ruleWidth,
        )
    )
    /** ($state) Used for DND */
    treeOverwrite: TreeData | null = null;

    // Stuff derived from tree:
    /** ($derived) Width of formula element but can be overwritten with treeOverwrite */
    width = $derived.by(() => this.tree.width);
    get barWidth() { return this.tree.barWidth };
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
    get y() { return this.acc.y };

    /** Takes world coordinates */
    moveTo(x: number, y: number) {
        this.xTransform += x - this.x;
        this.yTransform += y - this.y;
    }

    /** Getter (so not reactive!) */
    get xy() {
        return [this.x, this.y];
    }

    /** ($derived, readonly) Inherited. */
    readonly displayed: boolean = $derived.by(() => {
        const par = this.deriv.parent;
        return par instanceof Deriv
            ? par.render.displayed
            : par === viewport;
    });

    /** ($derived) z-index, set to index of root in viewport */
    zId = $derived.by(() => { return this.deriv.root.childIndex });

    constructor(deriv: Deriv, s: Serial<DerivRenderData> = {}) {
        this.deriv = deriv;
        if (s.xTransform) this.xTransform = s.xTransform;
        if (s.yTransform) this.yTransform = s.yTransform;

        // Maintain displayed
        $effect(() => { (this.displayed ? add : del)(this.deriv) })
    }

    // For maintaining width, ruleWidth and labelWidth:
    /**
     * Utility to maintain a width variable for an inline text element that only
     * changes when text changes. (text variable has to be reactive e.g. $state)
     * Accounts for width change with font load (M PLUS 1p).
     * @param textGetter Function that gets text value for reactivity in $effect
     * @param widthUpdater Function that updates the width variable
     */
    static maintainWidth(textGetter: () => any, widthUpdater: () => void) {
        $effect(() => { textGetter(); widthUpdater(); });
        onFontLoad(widthUpdater);
    }
}

// Annoyingly have to account for font loading on page load for maintainWidth
// Used only on component initiation. For updating inline element width variables after font load.
let onFontLoad = (f: () => void) => {};
if (browser) {
    let instructions: (() => void)[] = [];
    onFontLoad = f => {
        const i = instructions.push(f) - 1;
        onDestroy(() => {
            if (instructions.length) instructions[i] = () => {};
        });
    }
    document.fonts.load('12px "M PLUS 1p"').then(() => {
        onFontLoad = () => {};
        for (const f of instructions) f();
        instructions = [];
    });
}


// --- TESTS ---
// Can't test $effect right now :(
// Even with environment: 'jsdom', $effect.root and flushSync()
// nothing works 😭😭😭