import Deriv from "$lib/state/deriv.svelte";
import viewport from "$lib/state/viewport.svelte";
import { SvelteSet } from "svelte/reactivity";
import { derivDT } from "./deriv.DT";
import { browser } from "$app/environment";

/** Serialized DerivRenderData */
export interface SDerivRenderData {
    x?: number;
    y?: number;
}

const displayed = new SvelteSet<Deriv>();
const add = displayed.add.bind(displayed);
const del = displayed.delete.bind(displayed);

const simulated = new Set<Deriv>();

export default class DerivRenderData {
    /** SvelteSet of all displayed derivs */
    static get displayed() { return displayed }
    /** Run this in onDestroy */
    static onDestroy() {
        displayed.clear();
        simulated.clear();
        if (browser) cancelAnimationFrame(frameId);
    }

    deriv: Deriv;

    /** Left of label to right of rule. Maintained in deriv.svelte */
    width: number = $state(0);

    // The deriv has a base location and a transform on top 
    // (+ transforms from predescessors).
    xTransform = $state(0);
    yTransform = $state(0);
    // Final transforms
    private readonly xAcc: number = $derived.by(() => {
        const par = this.deriv.parent;
        const parAcc = par instanceof Deriv ? par.render.xAcc : 0;
        return parAcc + this.xTransform;
    });
    // y has an extra row offset in transform accumulator
    private readonly yAcc: number = $derived.by(() => {
        const par = this.deriv.parent; 
        const parAcc = par instanceof Deriv ? par.render.yAcc - derivDT.derivRowOffset : 0;
        return parAcc + this.yTransform;
    });
    // Transform is accumulative (inheriting from parent)
    /** Used for the physics */
    xBase = $state(0);
    xBaseVel = 0;
    // This is the final location (natural + offset)
    readonly x: number = $derived(this.xBase + this.xAcc);
    readonly y: number = $derived(this.yAcc);

    /** ($derived, readonly) Inherited. */
    readonly displayed: boolean = $derived.by(() => {
        const par = this.deriv.parent;
        return par instanceof Deriv
            ? par.render.displayed
            : par === viewport;
    });

    constructor(deriv: Deriv, s: SDerivRenderData = {}) {
        this.deriv = deriv;
        if (s.x) this.xTransform = s.x;
        if (s.y) this.yTransform = s.y;

        // Maintain displayed
        $effect(() => { (this.displayed ? add : del)(this.deriv) })

        // Maintain simulated
        $effect(() => {
            const d = this.deriv;
            d.parent; d.children;
            triggerSim(d.root);
        });
    }
}

// Simulation logic
/** Adds d to simulated and wakes up simulation */
let awake = false;
let frameId = 0;
let lastTime = 0;
function triggerSim(d: Deriv) {
    simulated.add(d);
    if (awake) return;
    frameId = requestAnimationFrame(simStep);
    lastTime = Date.now();
    awake = true;
}

// One simulation step
function simStep() {
    const dt = -(lastTime - (lastTime = Date.now()));
    for (const root of simulated) {
        // for (let _ = 0; _ < 20; _++) updateComplex(root, dt)
        if (updateComplex(root, dt))
            simulated.delete(root);
    }
    if (simulated.size !== 0)
        frameId = requestAnimationFrame(simStep);
    // else awake = false;
    else {
        awake = false;
        console.log('stopped');
    }
}

/** Spring constant */
const k = 0.1;
/** Determines when the sim stops */
const delta = 0.00001;

let debug = 0;
console.clear()

// Update all derivs, root to leaves
// Returns true if it didn't change anything
function updateComplex(root: Deriv, dt: number) {
    debug++;
    dt /= 100;


    let done = true;
    let row = root.children;
    let sib: boolean[] = new Array(Math.max(0, row.length - 1)).fill(true);

    while (row.length > 0) {
        if (debug === 1) {
            console.log(row.map(c=>c.conc))
            console.log(sib)
        }

        for (let i = 0; i < row.length; i++) {
            const r0 = row[i-1]?.render;
            const c1 = row[i], r1 = c1.render; // The one we're updating
            const r2 = row[i+1]?.render;
            const rp = (c1.parent as Deriv)?.render;
            
            let F = 0;
            if (r0) F += sideF(sib[i-1], r0, r1);
            if (r2) F -= sideF(sib[i+1], r1, r2);
            F += parentF(r1, rp);
            for (const ch of c1.children)
                F -= parentF(ch.render, r1);

            r1.xBaseVel -= F * k * dt;
            r1.xBaseVel *= 0.85;
            done &&= Math.abs(r1.xBaseVel) < delta;
            r1.xBase += r1.xBaseVel * dt;
        }
        
        // Prepare next row
        const arrs = row.map(d => d.children);
        sib = arrs.map(arr => {
            const out = new Array(Math.max(0, arr.length)).fill(true);
            out[out.length - 1] = false;
            return out;
        }).flat();
        row = arrs.flat();
    }

    return done;
}

// Calculate force between siblings/cousins next to each other
function sideF(siblings: boolean, r0: DerivRenderData, r1: DerivRenderData) {
    const d = dist(r0, r1);
    const pos = 0; //siblings ? 1 : 0;
    const neg = 10;
    return (d > 0 ? pos : neg) * d;
}
function parentF(r: DerivRenderData, rp: DerivRenderData) {
    return (r.xBase - rp.xBase) * 0;
}
function dist(r0: DerivRenderData, r1: DerivRenderData) {
    return r1.xBase - r0.xBase - (r1.width + r0.width) / 2;
}

// // Add parent-centering (PC) and sibling-attraction (SA) forces
// function stage1(deriv: Deriv, dt: number): boolean {
//     if (deriv.children.length === 0) return true;
//     let res = true;

//     // Initial child
//     let ch0 = deriv.children[0], ch0r = ch0.render;

//     res &&= stage1(ch0, dt);
//     let PC = ch0r.xRel;
//     let sumPC = PC; // sum PC on parent (deriv)
//     ch0r.xRel -= PC * damping; // sum PC on parent (deriv)

//     for (let i = 1; i < deriv.children.length; i++) {
//         const ch1 = deriv.children[i], ch1r = ch1.render;

//         res &&= stage1(ch1, dt);
//         PC = ch1r.xRel;
//         sumPC += PC;
//         const SA = ch1r.xRel - ch0r.xRel + (ch0r.width - ch1r.width) / 2;
//         res &&= Math.abs(SA) < delta;
//         const F = (SA + PC) * damping;
//         ch0r.xRel += F;
//         ch1r.xRel -= F;

//         ch0 = ch1;
//         ch0r = ch1r;
//     }

//     // deriv.render.xRel += sumPC * damping;
//     return res && (sumPC < delta);
// }

// // Add cousin-attraction (CA) forces
// function stage2(root: Deriv, dt: number) {
//     let res = true;
//     let row = root.children
//         .map(ch => ch.children)
//         .filter(arr => arr.length);

//     while (row.length > 1) {
//         for (let i = 0; i < row.length - 1; i++) {
//             const arr0 = row[i];
//             const arr1 = row[i];
            
//             const ch0r = arr0[arr0.length - 1].render;
//             const ch1r = arr1[0].render;

//             const CA = Math.max(0, ch1r.xRel - ch0r.xRel + (ch0r.width - ch1r.width) / 2);
//             res &&= CA < delta;
//             const CAF = CA * damping;
//             ch0r.xRel -= CAF;
//             ch1r.xRel += CAF;
//         }

//         row = row
//             .flat(1)
//             .map(ch => ch.children)
//             .filter(arr => arr.length);
//     }

//     return res;
// }

// --- TESTS ---
// Can't test $effect right now :(
// Even with environment: 'jsdom', $effect.root and flushSync()
// nothing works 😭😭😭