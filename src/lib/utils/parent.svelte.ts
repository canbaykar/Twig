// The methods of Child and Parent immediately affect one another.
// For example a.append(b) immediately updates a.parent and b.children.

export class Child {
    /** ($state.raw, readonly) */
    readonly parent: Parent | null = $state.raw(null);
    /** ($state, readonly) */
    readonly depth: number = $state(0);

    detach() {
        if (this.parent) this.parent.detachChild(this);
    }

    attach(parent: Parent, index?: number) {
        parent.attachChild(this, index);
    }
}

export class Parent extends Child {
    /** ($state.raw, readonly) */
    readonly children: Child[] = $state.raw([]);

    attachChild(child: Child, index?: number) {
        if (child.parent) child.parent.detachChild(child);
        // @ts-expect-error
        this.children = index === undefined
            ? [...this.children, child]
            : this.children.toSpliced(index, 0, child);
        // @ts-expect-error
        child.parent = this;
        updateDepth(child, this.depth + 1, this);
    }

    attachChildren(children: Child[], index?: number) {
        for (const ch of children)
            if (ch.parent)
                ch.parent.detachChild(ch);
        // @ts-expect-error
        this.children = index === undefined
            ? [...this.children, ...children]
            : this.children.toSpliced(index, 0, ...children);
        
        const childDepth = this.depth + 1;
        for (const ch of children) {
            // @ts-expect-error
            ch.parent = this;
            updateDepth(ch, childDepth, this);
        }
    }

    detachChild(child: Child) {
        const index = this.children.indexOf(child);
        if (index === -1) return false;
        // @ts-expect-error
        this.children = this.children.toSpliced(index, 1);
        // @ts-expect-error
        child.parent = null;
        updateDepth(child);
    }
}

// self is requested for circularity checks.
// depth should be self.depth + 1. Requested to avoid unnecessary recalculation.
// May throw RangeError (for stack overflow) if the tree is too deep :(
function updateDepth(target: Child, depth = 0, self?: Parent) {
    // @ts-expect-error
    target.depth = depth;
    if (!(target instanceof Parent)) return;
    if (target === self) throw new Error("Circularity: Parent is it's own descendant");
    target.children.forEach(ch => updateDepth(ch, depth + 1, self));
}


// --- TESTS ---
if (import.meta.vitest) {
    const { it, expect } = import.meta.vitest;

    it('Attaching-Detaching', () => {
        class Named extends Child { name = ''; }
        const c0 = new Named();
        c0.name = 'c0';
        const c1 = new Named();
        c1.name = 'c1';
        const p0 = new Parent();
        const p1 = new Parent();

        expect(c0.parent).toBe(null);
        expect(p0.children).toEqual([]);

        p0.attachChild(c0);
        c1.attach(p0);

        expect(c0.parent).toBe(p0);
        expect(c1.parent).toBe(p0);
        expect(p0.children).toEqual([c0, c1]);

        c0.attach(p1);
        c1.attach(p1, 0);

        expect(c0.parent).toBe(p1);
        expect(c1.parent).toBe(p1);
        expect(p0.children).toEqual([]);
        expect(p1.children).toEqual([c1, c0]);
    });

    it('Parent Depth', () => {
        const [A, B, C] = [0,0,0].map(n => new Parent());

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