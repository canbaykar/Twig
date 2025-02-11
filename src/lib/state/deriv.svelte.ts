import DerivRenderData from "$lib/components/viewport/deriv/renderData.svelte";
import { Parent } from "$lib/utils/parent.svelte";

/** Serialized SDeriv */
export declare interface SDeriv {
    conc?: string;
    children?: SDeriv[];
}

export default class Deriv extends Parent {
    declare readonly children: Deriv[];
    /** ($state) */
    conc = $state('');
    /** ($state, readonly) */
    readonly depth: number = $state(0);
   
    render = new DerivRenderData(this);

    /**
	 * @param s Serialized Deriv
	 * @param parent Initial parent (better to set here than later)
	 * @param index Index to add to initial parent with
	 */
    constructor(s: SDeriv = {}) {
        super();
        if (s.conc) this.conc = s.conc;
        if (s.children)
            this.attachChildren(s.children.map(ch => new Deriv(ch)));
    }

    // See Child
    onParentChange(newParent: Parent | null): void {
        if (newParent instanceof Deriv) 
            updateDepth(this, newParent, newParent.depth + 1) 
        else updateDepth(this, newParent);
    }
}

// May throw RangeError (for stack overflow) if the tree is too deep :(
// root should be first target's parent, only for circularity checks
function updateDepth(target: Deriv, root: Parent | null, depth = 0) {
    // @ts-expect-error
    target.depth = depth;
    if (!(target instanceof Parent)) return;
    if (target === root) throw new Error("Circularity: Parent is it's own descendant");
    target.children.forEach((ch) => updateDepth(ch, root, depth + 1));
}


// --- TESTS ---
if (import.meta.vitest) {
    const { it, expect } = import.meta.vitest;
    
    it('Deriv Depth', () => {
        const [A, B, C] = [0,0,0].map(n => new Deriv());

        expect(B.parent).toBe(null);
        expect(A.depth).toBe(0);
        expect(B.depth).toBe(0);
        expect(C.depth).toBe(0);

        A.attachChild(B);
        C.attach(B);

        expect(B.parent).toBe(A);
        expect(A.depth).toBe(0);
        expect(B.depth).toBe(1);
        expect(C.depth).toBe(2);

        B.detach();

        expect(A.depth).toBe(0);
        expect(B.depth).toBe(0);
        expect(C.depth).toBe(1);
    });
}