import { Child, Parent } from "$lib/utils/parent.svelte";
import type { Component, ComponentProps } from "svelte";
import { fallbackConverter } from "./panzoom/panzoom.svelte";
import { mouse } from "$lib/utils/interact/mouse.svelte";
import type Deriv from "$lib/state/deriv.svelte";
import viewport from "$lib/state/viewport.svelte";

export enum DraggableType {
	None, Panzoom, Deriv, Bar
}

export default class ViewportRenderState {
    x = $state(0);
    y = $state(0);
    scale = $state(1);

	/** ($state) */
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
    /** Convert client (px) to viewport (px) (pz: panzoom) */
    cl2pz = fallbackConverter;
    /** Convert viewport (px) to client (px) (pz: panzoom) */
    pz2cl = fallbackConverter;
    /** Convert client (px) to world (UNIT) */
    cl2wrld = fallbackConverter;
    /** Convert world (UNIT) to client (px) */
    wrld2cl = fallbackConverter;

    /** ($state) DraggableType of what's being dragged */
    dragType: DraggableType = $state(DraggableType.None);
	/** ($derived) Is the viewport or a deriv or bar being dragged right now? */
	get dragging() { return this.dragType !== DraggableType.None }

	// This is hover logic additional to native hover logic because Bg component's elements
	// placement make it impractical to style its hover with CSS.
    /** ($derived) Hovered deriv. Partially implemented in viewportC and deriv.render */
    hovered: { deriv: Deriv, body: boolean, bar: boolean } | null = $state(null);
	hover(deriv: Deriv | null = null, section: null | 'body' | 'bar' = null) {
		// If hover state's already what we want, return
		if (this.matchHover(deriv, section)) return;
		// Clear the previous hover on deriv.render side
		if (this.hovered) {
			this.hovered.deriv.render.barHovered = false;
			this.hovered.deriv.render.bodyHovered = false;
			this.hovered.deriv.render.hovered = false;
		}
		// Set hovered and update deriv.render side if needed
		if (deriv) {
			this.hovered = { deriv, body: false, bar: false };
			if (section) {
				this.hovered[section] = true;
				section === 'body'
					? deriv.render.bodyHovered = true
					: deriv.render.barHovered  = true;
			}
			deriv.render.hovered = true;
		} else this.hovered = null;
	}
	/** Util for if a value mathces hovered (since === can't be used for this) */
	matchHover(deriv: Deriv | null, section: null | 'body' | 'bar') {
		if (!this.hovered) return deriv === null;
		else if (this.hovered.deriv !== deriv) return false;
		switch (section) {
			case 'body':
				return this.hovered.body && !this.hovered.bar;
			case 'bar':
				return !this.hovered.body && this.hovered.bar;
			default:
				return !this.hovered.body && !this.hovered.bar;
		}
	}

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