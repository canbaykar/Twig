import { Child, Parent } from "$lib/utils/parent.svelte";
import type { Component, ComponentProps } from "svelte";
import { fallbackConverter } from "./panzoom/panzoom.svelte";
import { mouse } from "$lib/utils/interact/mouse.svelte";
import type Deriv from "$lib/state/deriv.svelte";
import viewport from "$lib/state/viewport.svelte";

export default class ViewportRenderData {
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

    /** ($state) Number of dragged derivs (0 or 1 under expected conditions). Set with dragLog */
    readonly dragging: number = $state(0);
    /** Log start and stop (don't forget!) of dragging a Deriv to maintain dropzones.
     *  @param dragging Is this the start of the DND interaction? */
    dragLog(dragging: boolean) { // @ts-expect-error
        return this.dragging = Math.max(0, this.dragging + (dragging ? 1 : -1));
    }

    /** ($derived) Hovered deriv. Partially implemented in viewportC and deriv.render */
    readonly hovered: { deriv: Deriv, bar: boolean } | null = $state(null);
	hover(deriv: Deriv | null, bar = false) {
		// If hover state's already what we want, return
		if (this.isHovered(deriv, bar)) return;
		// Clear the previous hover on deriv.render side
		if (this.hovered) {                               // @ts-expect-error
			this.hovered.deriv.render.barHovered = false; // @ts-expect-error
			this.hovered.deriv.render.bodyHovered = false;
		}
		// Set hovered and update deriv.render side if needed
		if (deriv) {                               // @ts-expect-error
			this.hovered = { deriv, bar };         // @ts-expect-error
			bar ? deriv.render.barHovered =  true  // @ts-expect-error
				: deriv.render.bodyHovered = true; // @ts-expect-error
		} else this.hovered = null;
	}
	/** Util for if a value mathces hovered (since === can't be used for this) */
	isHovered(deriv: Deriv | null, bar = false) {
		return deriv === null ? this.hovered === null
			: deriv === this.hovered?.deriv && bar === this.hovered.bar;
	}

	/** ($raw) DO NOT modify directly! Use related methods instead.
	 *  Partially implemented in viewportC and deriv.render */
	readonly selection: { deriv: Deriv, bar: boolean }[] = $state.raw([]);
	selectOnly(deriv?: Deriv | null, bar = false) {
		for (const { deriv } of viewport.render.selection) { // @ts-expect-error
			deriv.render.bodySelected = false;               // @ts-expect-error
			deriv.render.barSelected  = false;
		}                                          // @ts-expect-error
		this.selection = deriv ? [{ deriv, bar }] : [];
		if (deriv)                                 // @ts-expect-error
			bar ? deriv.render.barSelected  = true // @ts-expect-error
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