import type Deriv from "$lib/state/deriv.svelte";

export default class DerivRenderData {
    deriv: Deriv;
    
    x = $state(0);
    y = $state(0);

    constructor(deriv: Deriv) {
        this.deriv = deriv;
    }
}