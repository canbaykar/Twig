// The methods of Child and Parent immediately affect one another.
// For example a.append(b) immediately updates a.parent and b.children.

export class Child {
    /** ($state, readonly) */
    readonly parent: Parent | null = $state(null);

    detach() {
        if (this.parent) this.parent.detachChild(this);
    }

    attach(parent: Parent, index?: number) {
        parent.attachChild(this, index);
    }
}

export class Parent extends Child {
    /** ($state, readonly) */
    readonly children: Child[] = $state([]);

    attachChild(child: Child, index?: number) {
        if (child.parent) child.parent.detachChild(child);
        // @ts-expect-error
        this.children = index === undefined
            ? [...this.children, child]
            : this.children.toSpliced(index, 0, child);
        // @ts-expect-error
        child.parent = this;
    }

    attachChildren(children: Child[], index?: number) {
        for (const ch of children)
            if (ch.parent)
                ch.parent.detachChild(ch);
        // @ts-expect-error
        this.children = index === undefined
            ? [...this.children, ...children]
            : this.children.toSpliced(index, 0, ...children);
        
        // @ts-expect-error
        for (const ch of children) ch.parent = this;
    }

    detachChild(child: Child) {
        const index = this.children.indexOf(child);
        if (index === -1) return false;
        // @ts-expect-error
        this.children = this.children.toSpliced(index, 1);
        // @ts-expect-error
        child.parent = null;
        return true;
    }

    detachAll() {
        const old = this.children;
        if (old.length === 0) return false;
        // @ts-expect-error
        this.children = [];
        // @ts-expect-error
        for (const ch of old) ch.parent = null;
        return true;
    }
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
}