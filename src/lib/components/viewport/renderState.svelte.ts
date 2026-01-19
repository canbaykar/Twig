import { Child, Parent } from "$lib/utils/parent.svelte";
import type { Component, ComponentProps } from "svelte";
import { fallbackConverter } from "./panzoom/panzoom.svelte";
import { mouse } from "$lib/utils/interact/mouse.svelte";
import Deriv from "$lib/state/deriv.svelte";
import viewport, { type Serial } from "$lib/state/viewport.svelte";
import { DT } from "../../../DT";

export enum DraggableType {
	None, Panzoom, Deriv, Bar
}

// Utility class for hover
export class Hover {
	readonly deriv: Deriv | null;
	readonly part: string | null;
	readonly section: string | null;

	constructor(deriv: Deriv | null = null, part: string | null = null) {
		this.deriv = deriv;
		this.part = part;
		this.section = part ? part.match(/^(.*)_/)?.[1] ?? 'body' : null;
	}
	
	matches(deriv: Deriv | null = null, part: string | null = null) {
		return this.deriv === deriv && this.part === part;
	}

	get isEmpty() { return this.matches(); }
	get bar() { return this.section === 'bar'; }
}

export default class ViewportRenderState {
    x = $state(0);
    y = $state(0);
    scale = $state(1);

	serialize(): Serial<ViewportRenderState> {
		return {
			x: this.x,
			y: this.y,
			scale: this.scale,
		};
	}
	deserialize(s: Serial<ViewportRenderState>) {
		this.x = s.x ?? 0;
		this.y = s.y ?? 0;
		if (s.scale) this.scale = s.scale;
	}
	reset() {
		this.deserialize({});
	}

	/** ($state) */
	outerElement: HTMLElement | null = $state(null);
	/** ($state) This is the viewport element with tabindex (can recieve focus) */
	element: HTMLElement | null = $state(null);

    popups = popups;
    panzoomPopups = panzoomPopups;

    /** World coords of mouse */
    readonly mouse = $derived.by(() => this.cl2wrld({
        x: mouse.clientX,
        y: mouse.clientY,
    }));

    // /** ($derived) Multiply screen length in px with this to convert to viewport length */
    // screen2viewport = $derived(DT.UNIT / this.scale);

    // Converters (default values, maintain in panzoom!)
    /** ($state) Convert client (px) to viewport (px) (pz: panzoom) */
    cl2pz = $state(fallbackConverter);
    /** ($state) Convert viewport (px) to client (px) (pz: panzoom) */
    pz2cl = $state(fallbackConverter);
    /** ($state) Convert client (px) to world (UNIT) */
    cl2wrld = $state(fallbackConverter);
    /** ($state) Convert world (UNIT) to client (px) */
    wrld2cl = $state(fallbackConverter);

	/** ($derived) World coordinates of center of the screen */
	center: [number, number] = $derived([-this.x / this.scale * DT.UNIT, -this.y / this.scale * DT.UNIT]);

    /** ($state) DraggableType of what's being dragged */
    dragType: DraggableType = $state(DraggableType.None);
	/** ($derived) Is the viewport or a deriv or bar being dragged right now? */
	get dragging() { return this.dragType !== DraggableType.None }

	// This is hover logic additional to native hover logic because Bg component's elements
	// placement make it impractical to style its hover with CSS and .
    /** ($derived) Hovered deriv. Partially implemented in viewportC and deriv.render */
    hovered: Hover = $state(new Hover());
	hover(deriv: Deriv | null = null, part: string | null = null) {
		// If hover state's already what we want, return
		if (this.hovered.matches(deriv, part)) return;
		// Clear the previous hover on deriv.render side
		if (!this.hovered.isEmpty) {                         
			this.hovered.deriv!.render.hoveredPart    = null;
			this.hovered.deriv!.render.hoveredSection = null;
		}
		// Set hovered and update deriv.render side if needed
		if (deriv) {                                           
			this.hovered = new Hover(deriv, part);             
			deriv.render.hoveredPart = part;                   
			deriv.render.hoveredSection = this.hovered.section;
		} else this.hovered = new Hover();
	}

	// --- Selection ---
	/** ($raw) DO NOT modify directly! Use related methods instead.
	 *  Partially implemented in viewportC and deriv.render */
	selection: { deriv: Deriv, bar: boolean }[] = $state.raw([]);
	selectOnly(deriv?: Deriv | null, bar = false) {
		for (const { deriv } of viewport.render.selection) {
			deriv.render.bodySelected = false;              
			deriv.render.barSelected  = false;
		}                                         
		this.selection = deriv ? [{ deriv, bar }] : [];
		if (deriv)                                
			bar ? deriv.render.barSelected  = true
				: deriv.render.bodySelected = true;
	}
	// Used in DerivRenderState constructor so sometimes deriv.render is undefined
	addToSelection(deriv: Deriv, bar = false, _render = deriv.render) {
		if (this.selection.find(s => s.deriv === deriv && s.bar === bar)) return;
		this.selection = [...this.selection, { deriv, bar }];
		bar ? _render.barSelected  = true
			: _render.bodySelected = true;
	}
	updateSelectionOnInteraction(e: MouseEvent, deriv?: Deriv | null, bar = false) {
		if (e.shiftKey || e.altKey)
			deriv && this.addToSelection(deriv, bar);
		else this.selectOnly(deriv, bar);
	}
	deselect(entries: { deriv: Deriv, bar?: boolean }[]) {
		const sel = this.selection;
		for (const { deriv, bar } of entries) {
			const i = sel.findIndex(({ deriv: d, bar: b }) => deriv === d || bar === b);
			if (i > -1) sel.splice(i, 1); 
			bar ? deriv.render.barSelected  = false
				: deriv.render.bodySelected = false;
		}
		this.selection = sel;
	}
	/** Deselect both bar and self of each deriv */
	deselectPairs(derivs: Deriv[]) {
		this.deselect(derivs.flatMap(deriv => [{ deriv, bar: true }, { deriv, bar: false }]));
	}
	deselectAll() {
		this.deselect(this.selection);
	}
	setSelection(sel: { deriv: Deriv, bar: boolean }[]) {
		this.deselectAll();
		for (const s of sel) this.addToSelection(s.deriv, s.bar);
	}
	/** Use this or (or deriv.render.delete) instead of detach, detaches and deselects! */
	delete(derivs: Deriv[]) {
		this.deselectPairs(derivs);
		derivs.forEach(d => d.detach());
	}
	/** Re-adds not-in-array children of derivs in array */
	shiftDelete(derivs: Deriv[]) {
		const set = new Set(derivs);
		const orphans = new Set<Deriv>();
		function addOrphan(deleted: Deriv) {
			for (const child of deleted.children)
				if (!set.has(child)) orphans.add(child);
				else addOrphan(child);
		}
		for (const deriv of set) addOrphan(deriv);

		// Record positions to place orphans to when re-adding
		const pos: [Deriv, [number, number]][] = [];
		orphans.forEach(orp => pos.push([orp, orp.render.xy]));

		// Remove the selected
		this.delete(derivs);

		// Re-add
		for (const [orp, [x, y]] of pos) {
			orp.attach(viewport);
			orp.render.moveTo(x, y);
		}
	}
	/** Delete selection with all their children */
	deleteSelection() {
		this.delete(this.selection.map(({ deriv }) => deriv));
	}
	/** Deletes selection but re-adds non-selected children of selected */
	shiftDeleteSelection() {
		this.shiftDelete(this.selection.map(({ deriv }) => deriv));
	}
	/** Don't forget to reattach the output to viewport if manually deserializing to prevent selected-but-detached derivs. */
	serializeSelection(): Serial<Deriv>[] {
		// If both a parent and one of its children are selected, we should only
		// add the parent to output, bc serializing loses equality info, which
		// may duplicate the child...
		const sel = this.selection.map(({ deriv }) => {
			// Find the lowest parent with selection ('selection root')
			let sRoot = deriv;
			let curr = deriv;
			while (curr = curr.derivParent as Deriv)
				if (curr.render.anySelected) sRoot = curr;
			return sRoot;
		}); 
		// Then remove duplicates and serialize (including selection state)
		return [...new Set(sel)].map(d => {
			const s = d.serialize(true);
			// Will be considered detached from parent, so its pos. must be as if attached to viewport
			if (d.derivParent) {
				s.render!.xTranslate = d.render.x;
				s.render!.yTranslate = d.render.y;
			}
			return s;
		});
	}
	/** Reattaches derivs (with restored selection) to prevent selected-but-detached derivs! 
	 *  Displacement feature offsets attached derivs if there's a deriv in it's paste location. */
	deserializeSelection(s: Serial<Deriv>[], displacement = true) {
		// For displacement feature to only consider derivs existing at this stage as occupiers.
		const oldLen = viewport.children.length;
		return s.map(sd => {
			const d = new Deriv(sd);
			const [x, y] = d.render.xy;
			if (displacement) { // If offset location is also occupied, offset more, repeat
				let offset = 0, limit = 10;
				while (occupied(x + offset, y - offset, viewport.children, oldLen) || limit === 0) {
					offset += 100; limit--;
				}
				if (offset) d.render.moveTo(x + offset, y - offset);
			}
			d.attach(viewport);
			// In case s was hand written and thus wasn't originally a selection
			viewport.render.addToSelection(d);
			return d;
		});
	}
}

/** Utility to check if there's a deriv at x, y. Only consider upto length... */
function occupied(x: number, y: number, arr: Deriv[], length = arr.length) {
	for (let i = 0; i < length; i++) {
		const d = arr[i];
		const [x_, y_] = d.render.xy;
		if ((x === x_ && y === y_) || occupied(x, y, d.children)) return true;
	}
	return false;
}

// ---- Popups ----
interface Popups extends Parent {
    readonly children: Popup[];
}
const popups = new Parent() as Popups;
const panzoomPopups = new Parent() as Popups;

export class Popup<TComponent extends Component<any> = Component> extends Child {
    readonly component: TComponent;
    /** Is the popup displayed inside panzoom / among panzoom elements */
    panzoom: boolean;
    props: Omit<ComponentProps<TComponent>, 'popup'>;

    constructor(
        component: TComponent,
        panzoom: boolean,
        props: Omit<ComponentProps<TComponent>, 'popup'>,
    ) {
        super();
        this.component = component;
        this.panzoom = panzoom;
        this.props = props;
        (this.panzoom ? panzoomPopups : popups).attachChild(this);
    }
}