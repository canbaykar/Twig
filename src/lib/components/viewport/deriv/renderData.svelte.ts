import Deriv from "$lib/state/deriv.svelte";
import viewport, { type Serial } from "$lib/state/viewport.svelte";
import { treeData, type TreeData } from "./treeData";
import { DT } from "../../../../DT";
import { browser } from "$app/environment";
import { onDestroy } from "svelte";

// Exported below as DerivRenderData.displayed
const displayed = $derived(flatten(viewport.children));
function flatten(ds: Deriv[]): Deriv[] {
    return ds.map(d => [d, ...flatten(d.children)]).flat();
}

export default class DerivRenderData {
    /** ($derived) Array of all displayed derivs */
    static get displayed() { return displayed }

    /** Run this in onDestroy */
    static onDestroy() {
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
    readonly tree: TreeData = $derived.by(() => 
        this.treeOverwrite ?? treeData(
            this.baseWidth, 
            this.deriv.children.map(c => c.render.tree),
            this.labelWidth,
            this.ruleWidth,
        )
    )
    /** ($state) Used for DND */
    treeOverwrite: TreeData | null = $state(null);

    // Stuff derived from tree:
    /** ($derived) Width of formula element but can be overwritten with treeOverwrite */
    width = $derived.by(() => this.tree.width);
    /** ($derived) Derived from tree */
    get barWidth() { return this.tree.barWidth };
    /** ($derived) Relative position of deriv assuming no translation and default anchor */
    readonly xOffset: number = $derived.by(() => {
        const par = this.deriv.derivParent;
        return par ? par.render.tree.offsets[this.deriv.childIndex] : 0;
    });

    /** ($state) */
    xTranslate = $state(0);
    /** ($state) */
    yTranslate = $state(0);

    /** ($state) Function that determines the final coords of a deriv */
    anchor: Anchor = $state(defaultAnchor);
    /** ($derived) */
    readonly xyBase = $derived.by(() => this.anchor(this));
    /** ($derived) */
    readonly xy = $derived.by(() => [
        this.xyBase[0] + this.xTranslate, 
        this.xyBase[1] + this.yTranslate
    ]);
    /** ($derived) */
    get x() { return this.xy[0] }
    /** ($derived) */
    get y() { return this.xy[1] }

    /** Takes world coordinates */
    moveTo(x: number, y: number) {
        this.xTranslate += x - this.x;
        this.yTranslate += y - this.y;
    }
    /** Util for changing anchor without moving element */
    swapAnchor(a: Anchor) {
        const x = this.x;
        const y = this.y;
        this.anchor = a;
        this.moveTo(x, y);
    }
    /** Util to set traslation coords to 0 */
    resetTranslate() {
        this.xTranslate = 0;
        this.yTranslate = 0;
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
    
    /** ($state) Am I being dragged? */
    dragged = $state(false);
    /** ($derived) Am I OR any of my ascenstors being dragged? */
    readonly inDragged = $derived.by((): boolean => { // @ts-expect-error
        return this.dragged || !!this.deriv.parent?.render?.inDragged;
    });

    // --- Background colors ---
    /** ($derived) Background color for the formula element */
    readonly formulaBg: string | null = $derived.by(() => 
		this.bgColor(this.deriv.logic.conc, this.bodyHovered, this.bodySelected)
	);
    /** ($derived) Background color for the bar */
    readonly barBg: string | null = $derived.by(() => 
		this.bgColor(this.deriv.logic.rule, this.barHovered, this.barSelected)
	);
    // The logic
    private bgColor(val: any, hovered: boolean, selected: boolean): string | null {
        return val instanceof Error 
            ? hovered || selected
                ? 'var(--color-bg-danger-muted)'
                : 'var(--color-bg-danger-emphasis)'
            : hovered || selected
                ? 'var(--color-bg-muted)'
                : null;
    }

    constructor(deriv: Deriv, s: Serial<DerivRenderData> = {}) {
        this.deriv = deriv;
        if (s.xTranslate) this.xTranslate = s.xTranslate;
        if (s.yTranslate) this.yTranslate = s.yTranslate;
    }

	// --- Part + UID System ---
	// Viewport element has data-part='viewport' and for derivs:
	// - Every element of a deriv is or is in some element with poth data-part and data-uid
	// - UID is defined in Deriv for this system. This is used in viewport to define interactions
	//   using its hover & selected system to avoid defining listeners in too many places.
	//   (Because they interfere with each other and complicate things)
    /** Looks up associated deriv of closest ancestor from e.target
     *  DerivRenderData version of Deriv.lookup */
    static lookup(target: EventTarget | null) {
        if (!(target instanceof Element)) 
			return { part: null, deriv: null, bar: false };

		// Find part
        const partTarget = target.closest('[data-part]') as HTMLElement | null;
        if (!partTarget) 
			return { part: null, deriv: null, bar: false };
        const part = partTarget.dataset.part as string;
		if (part === 'viewport') 
			return { part, deriv: null, bar: false };
		
		// Find uid
		let uid = partTarget.dataset.uid;
		if (!uid) {
			const uidTarget = partTarget.closest('[data-uid]') as HTMLElement | null;
			if (!uidTarget) 
				return { part, deriv: null, bar: false };
			uid = uidTarget.dataset.uid as string;
		}

		// Find deriv
        const deriv = Deriv.lookup(uid);
		return { part, deriv, bar: !!part.match(/^bar/) };
	}
    
	// --- Hovered ---
    /** ($state) (Hovered is divided into body & bar)
     *  Partially implemented in viewportC and viewport.render */
    readonly bodyHovered: boolean = $state(false);
    /** ($state) (Hovered is divided into body & bar)
     *  Partially implemented in viewportC and viewport.render */
    readonly barHovered: boolean = $state(false);
	/** Util for checking bodyHovered & barHovered */
	isHovered(bar = false) { return bar ? this.barHovered : this.bodyHovered; }

	// --- Selected ---
    /** ($state) Implemented in viewport.svelte
     *  Also synced in viewport.svelte with selected in ViewportRenderData */
	readonly bodySelected = $state(false);
    /** ($state) Implemented in viewport.svelte
     *  Also synced in viewport.svelte with selected in ViewportRenderData */
	readonly barSelected = $state(false);
	clearSelection() {             // @ts-expect-error
		this.bodySelected = false; // @ts-expect-error
		this.barSelected = false;
	}
	select(bar = false, value = true) { // @ts-expect-error
		bar ? this.barSelected  = value // @ts-expect-error
			: this.bodySelected = value;
	}
	isSelected(bar = false) {
		return bar ? this.barSelected : this.bodySelected;
	}

    // --- Other utils ---
    readonly hasLabel = $derived.by(() => !!this.deriv.logic.labelText);
    readonly hasRule = $derived.by(() => !!this.deriv.logic.ruleText);
    readonly hasChild = $derived.by(() => this.deriv.children.length !== 0);
    readonly hasBar = $derived.by(() => this.hasRule || this.hasLabel || this.hasChild);
    readonly discharged = $derived.by(() => !!this.deriv.logic.dischargedBy);

	/** Util that brings the root of this deriv to the front */
	goToTop() {
		// If not last child, reattach to be last
        if (viewport.children.length - 1 > this.deriv.root.childIndex)
            this.deriv.root.attach(viewport);
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
    document.fonts.load('12px "M PLUS 1p"');
    // For some reason, doing .then(() => {...}) above fires before the font is loaded
    // but it does return 'loaded' when the font is checked but it returns 'loading'
    // later in svelte effect wtf?! Does the font load then unload and load again or 
    // something? Basically it doen't work :(
    document.fonts.onloadingdone = () => {
        onFontLoad = () => {};
        for (const f of instructions) f();
        instructions = [];
    };
}


// --- ANCHOR API ---
/** Function that determines the final coords of a deriv */
type Anchor = (rd: DerivRenderData) => [number, number];

export function defaultAnchor(rd: DerivRenderData): [number, number] {
    return rd.deriv.derivParent instanceof Deriv ? [
            rd.deriv.derivParent.render.x + rd.xOffset,
            rd.deriv.derivParent.render.y - DT.derivRowOffsetN,
        ] : [0, 0];
};

export function mouseAnchor(rd: DerivRenderData): [number, number] {
    return [viewport.render.mouse.x, viewport.render.mouse.y];
};


// --- TESTS ---
// Can't test $effect right now :(
// Even with environment: 'jsdom', $effect.root and flushSync()
// nothing works 😭😭😭