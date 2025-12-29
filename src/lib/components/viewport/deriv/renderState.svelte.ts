import Deriv from "$lib/state/deriv.svelte";
import viewport, { type Serial } from "$lib/state/viewport.svelte";
import { treeState, type TreeState } from "./treeState";
import { DT } from "../../../../DT";
import { browser } from "$app/environment";
import { onDestroy } from "svelte";
import Rule from "$lib/state/logic/rule";
import { Hover } from "../renderState.svelte";
import type { EditorView } from "prosemirror-view";
import { focusEditor } from "./formula/formula.svelte";

// Exported below as DerivRenderData.displayed
const displayed = $derived(flatten(viewport.children));
function flatten(ds: Deriv[]): Deriv[] {
    return ds.map(d => [d, ...flatten(d.children)]).flat();
}

export default class DerivRenderState {
    /** ($derived) Array of all displayed derivs */
    static get displayed() { return displayed }

    /** Run this in onDestroy */
    static onDestroy() {
        // stuff like cancelanimationframe here...
    }

    deriv: Deriv;
    element: HTMLElement | null = $state(null);

    /** ($state) Width of formula element. Maintained in formula.svelte. Use width instead. */
    baseWidth = $state(0);
    /** ($state) Maintained in bar.svelte */
    ruleWidth = $state(0);
    /** ($state) Maintained in bar.svelte */
    labelWidth = $state(0);

    // Tree rendering logic
    readonly tree: TreeState = $derived.by(() => 
        this.treeOverwrite ?? treeState(
            this.baseWidth, 
            this.deriv.children.map(c => c.render.tree),
            this.labelWidth,
            this.ruleWidth,
        )
    )
    /** ($state) Used for DND */
    treeOverwrite: TreeState | null = $state(null);

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

	// - Anchors -
    /** ($state) Function that determines the base coords of a deriv */
    anchor: Anchor = $state(defaultAnchor);
    /** ($state) Function that determines the base coords of the bar */
    barAnchor: Anchor = $state(defaultBarAnchor);

	// - Base Locations -
    /** ($derived) */
    readonly xyBase = $derived.by(() => this.anchor(this));
    /** ($derived) */
    readonly xyBaseBar = $derived.by(() => this.barAnchor(this));

	// - Translation -
    /** ($state) */
    xTranslate = $state(0);
    /** ($state) */
    yTranslate = $state(0);
    /** ($state) */
    xTranslateBar = $state(0);
    /** ($state) */
    yTranslateBar = $state(0);

	// - Final Coords -
    /** ($derived) */
    readonly xy: [number, number] = $derived.by(() => [
        this.xyBase[0] + this.xTranslate, 
        this.xyBase[1] + this.yTranslate
    ]);
    /** ($derived) */
    readonly xyBar: [number, number] = $derived.by(() => [
        this.xyBaseBar[0] + this.xTranslateBar, 
        this.xyBaseBar[1] + this.yTranslateBar
    ]);
    /** ($derived) */
    get x() { return this.xy[0] }
    /** ($derived) */
    get y() { return this.xy[1] }
    /** ($derived) */
    get xBar() { return this.xyBar[0] }
    /** ($derived) */
    get yBar() { return this.xyBar[1] }

	// - Movement Utils -
    /** Takes world coordinates (alters translate) */
    moveTo(x: number, y: number, bar = false) {
        if (!bar) {
			this.xTranslate += x - this.x;
        	this.yTranslate += y - this.y;
		} else {
			this.xTranslateBar += x - this.xBar;
        	this.yTranslateBar += y - this.yBar;
		}
    }
    /** Takes world coordinates (alters translate) */
    moveBy(x: number, y: number, bar = false) {
        if (!bar) {
			this.xTranslate += x;
        	this.yTranslate += y;
		} else {
			this.xTranslateBar += x;
        	this.yTranslateBar += y;
		}
    }
    /** Util for changing anchor without moving element */
    swapAnchor(a: Anchor, bar = false) {
		let x: number, y: number;
        if (!bar) {
			x = this.x;
			y = this.y;
			this.anchor = a;
		} else {
			x = this.xBar;
			y = this.yBar;
			this.barAnchor = a;
		}
		this.moveTo(x, y, bar);
    }
    /** Util to set traslation coords to 0 */
    resetTranslate(formula = true, bar = true) {
        if (formula) {
            this.xTranslate = 0;
            this.yTranslate = 0;
        }
        if (bar) {
            this.xTranslateBar = 0;
            this.yTranslateBar = 0;
        }
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
    
	// --- DND System ---
    /** ($state) Am I being dragged (formula or bar)? */
    bodyDragged = $state(false);
    /** ($state) Am I being dragged (formula or bar)? */
    barDragged = $state(false);
    /** ($state) Am I being dragged (formula or bar)? */
    dragged = $derived(this.bodyDragged || this.barDragged);
    /** ($derived) Am I OR any of my ascenstors being dragged? */
    readonly inDragged = $derived.by((): boolean => { // @ts-expect-error
        return this.dragged || !!this.deriv.parent?.render?.inDragged;
    });

	/** ($state) Currently primarily used for DND. When this is true, deriv acts like bar 
	 *  is its main part: When you drag a bar, the duplicated formula is muted. 
	 *  Think like formula is an auto-inferred part that isn't yet user confirmed.
	 *  When user interacts with body, it's counted as confirmed so it's unmuted. */
	bodyMuted = $state(false);

    // --- Background colors ---
    /** ($derived) Background color for the formula element */
    readonly formulaBg: string | null = $derived.by(() => 
		this.bgColor(this.deriv.logic.conc, this.barSelected || this.bodySelected || (!!this.hoveredSection && this.hoveredSection !== 'adder'))
	);
    /** ($derived) Background color for the bar */
    readonly barBg: string | null = $derived.by(() => 
		this.bgColor(this.deriv.logic.rule, this.barSelected || this.bodySelected || (!!this.hoveredSection && this.hoveredSection !== 'adder'))
	);
    // The logic
    private bgColor(val: any, awake: boolean): string | null {
        return val instanceof Error 
            ? awake
                ? 'var(--color-bg-danger-muted)'
                : 'var(--color-bg-danger-emphasis)'
            : awake
                ? 'var(--color-bg-muted)'
                : null;
    }

    constructor(deriv: Deriv, s: Serial<DerivRenderState> = {}) {
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
	// - Parts are further divided into sections -> formula_bg -> section is formula. 
	//   (default section is body: _bg -> section is body)
	// - This system supports the hover, listener and selection systems which is necessary bc the
	//	 element structure is unconventional for HTML for accomodating Bg requirements (being behind
	//   all foreground) and future animation requirements (interactable and visual elements are to
	//   be mostly separate).
    /** Looks up associated deriv of closest ancestor from e.target
     *  DerivRenderData version of Deriv.lookup */
    static lookup(target: EventTarget | null): Hover {
        if (!(target instanceof Element)) 
			return new Hover();

		// Find part
        const partTarget = target.closest('[data-part]') as HTMLElement | null;
        if (!partTarget) 
			return new Hover();
        const part = partTarget.dataset.part as string;
		if (part === 'viewport') 
			return new Hover(null, part);
		
		// Find uid
		let uid = partTarget.dataset.uid;
		if (!uid) {
			const uidTarget = partTarget.closest('[data-uid]') as HTMLElement | null;
			if (!uidTarget) 
				return new Hover(null, part);
			uid = uidTarget.dataset.uid as string;
		}

		// Find deriv
        const deriv = Deriv.lookup(uid);
		return new Hover(deriv, part);
	}
    
	// --- Hovered ---
	// This hover system is for syncing with Bg elements and to group elements into hover and listener behaviour.
	/** ($derived) Partially implemented in viewportC and viewport.render */
    hoveredPart: string | null = $state(null);
    /** ($derived) Partially implemented in viewportC and viewport.render */
    hoveredSection: string | null = $state(null);

	// --- Selected ---
    /** ($derived) Partially implemented in viewportC and viewport.render */
	bodySelected = $state(false);
    /** ($derived) Partially implemented in viewportC and viewport.render */
	barSelected = $state(false);
	/** Util for checking bodySelected & barSelected */
	isSelected(bar = false) { return bar ? this.barSelected : this.bodySelected; }

	// --- Awake ---
	// Would be called active but that's already used for focus in HTML
	/** ($derived) Is body selected or hovered? */
    readonly bodyAwake = $derived.by(() => this.bodySelected || this.hoveredSection === 'body');
	/** ($derived) Is bar selected or hovered? */
    readonly barAwake = $derived.by(() => this.bodySelected || this.hoveredSection === 'bar');
	/** ($derived) Deriv selected or hovered? */
    readonly awake = $derived.by(() => this.bodySelected || this.barSelected || !!this.hoveredPart);
	
    // --- Other utils ---
    readonly hasLabel = $derived.by(() => !!this.deriv.logic.labelText);
    readonly hasChild = $derived.by(() => this.deriv.children.length !== 0);
    readonly discharged = $derived.by(() => !!this.deriv.logic.dischargedBy);
    readonly ruleHidden = $derived.by(() => this.deriv.logic.rule === Rule.axiomRule && !this.discharged);
    readonly inferred = $derived.by(() => !this.ruleHidden || this.hasLabel || this.hasChild);
	readonly barHidden = $derived.by(() => !(this.inferred || this.barAwake || this.bodyAwake));

	/** Util that brings the root of this deriv to the front */
	goToTop() {
		// If not last child, reattach to be last
        if (viewport.children.length - 1 > this.deriv.root.childIndex)
            this.deriv.root.attach(viewport);
	}

	/** Use this (or viewport.render.delete) instead of detach, detaches and deselects! */
	delete() {
		viewport.render.delete([this.deriv]);
	}

    // --- ProseMirror ---
    editorView: EditorView | null = null;
    // Multiple editors can be focused simultaneously (not native focus)
    editorFocused: boolean = $state(false);
	/** rafBefore: Await requestAnimationFrame before anything (default: true) */
    async focusEditor(rafBefore = true) {
        return focusEditor(this.deriv, rafBefore);
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
type Anchor = (rs: DerivRenderState) => [number, number];

export function defaultAnchor(rs: DerivRenderState): [number, number] {
    return rs.deriv.derivParent instanceof Deriv ? [
            rs.deriv.derivParent.render.xBar + rs.xOffset,
            rs.deriv.derivParent.render.yBar - DT.derivBgPaddingN,
        ] : [0, 0];
};

export function defaultBarAnchor(rs: DerivRenderState): [number, number] {
    const [x, y] = rs.xy;
	return [x, y - DT.derivBarYN];
};

export function mouseAnchor(rs: DerivRenderState): [number, number] {
    return [viewport.render.mouse.x, viewport.render.mouse.y];
};

/** When bar is being moved (e.g. with mouseAnchor), set this to anchor to make formula follow bar. */
export function followBarAnchor(rs: DerivRenderState): [number, number] {
    const [x, y] = rs.xyBar;
	return [x, y + DT.derivBarYN];
};


// --- TESTS ---
// Can't test $effect right now :(
// Even with environment: 'jsdom', $effect.root and flushSync()
// nothing works 😭😭😭