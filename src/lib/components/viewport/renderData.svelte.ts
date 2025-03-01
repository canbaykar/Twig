import { Child, Parent } from "$lib/utils/parent.svelte";
import type { Component, ComponentProps } from "svelte";

export default class ViewportRenderData {
    x = $state(0);
    y = $state(0);
    scale = $state(1);
    popups = popups;
}

class Popups extends Parent {
    declare readonly children: Popup[];

    detachChild(child: Popup): boolean {
        const res = super.detachChild(child);
        child.cleanup();
        return res;
    }
    
    detachAll(): boolean {
        const old = this.children;
        const res = super.detachAll();
        for (const ch of old) ch.cleanup();
        return res;
    }
}
const popups = new Popups();

export class Popup<TComponent extends Component<any> = Component> extends Child {
    readonly component: TComponent;
    props: Omit<ComponentProps<TComponent>, 'popup'>;
    cleanup = () => {};

    constructor(
        component: TComponent,
        props: Omit<ComponentProps<TComponent>, 'popup'>,
        effect?: () => void | (() => void),
    ) {
        super();
        this.component = component;
        this.props = props;

        if (effect)
            this.cleanup = $effect.root(() => {
                $effect(effect);
            });

        popups.attachChild(this);
    }
}