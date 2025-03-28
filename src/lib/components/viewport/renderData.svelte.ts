import { Child, Parent } from "$lib/utils/parent.svelte";
import type { Component, ComponentProps } from "svelte";
import { DT } from "../../../DT";

export default class ViewportRenderData {
    x = $state(0);
    y = $state(0);
    scale = $state(1);
    popups = popups;

    /** ($derived) Multiply screen length in px with this to convert to viewport length */
    screen2viewport = $derived(DT.UNIT / this.scale);
}

interface Popups extends Parent {
    readonly children: Popup[];
}
const popups = new Parent() as Popups;

export class Popup<TComponent extends Component<any> = Component> extends Child {
    readonly component: TComponent;
    props: Omit<ComponentProps<TComponent>, 'popup'>;

    constructor(
        component: TComponent,
        props: Omit<ComponentProps<TComponent>, 'popup'>,
    ) {
        super();
        this.component = component;
        this.props = props;
        popups.attachChild(this);
    }
}