import { Child, Parent } from "$lib/utils/parent.svelte";
import type { Component, ComponentProps } from "svelte";
import { fallbackConverter } from "./panzoom/panzoom.svelte";

export default class ViewportRenderData {
    x = $state(0);
    y = $state(0);
    scale = $state(1);
    popups = popups;
    panzoomPopups = panzoomPopups;

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