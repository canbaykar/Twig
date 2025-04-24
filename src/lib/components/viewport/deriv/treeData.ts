import { DT } from "../../../../DT";

export interface TreeData {
    /** The width given to tree in treeData(). This is here to make formula width overwritable. */
    width: number;
    /** Rel. offsets of left and rigth sides of hitboxes by row
     *  not accounting for child transforms */
    collider: Collider;
    /** Relative positions of children
     *  not accounting for child transforms */
    offsets: number[];
    barWidth: number;
    /** Relative offset of global left */
    left: number;
    /** Relative offset of global right */
    right: number;
}

interface Collider {
    l: number[]; // left
    r: number[]; // right
}

export function treeData(
    width: number, 
    children: TreeData[],
    labelWidth: number,
    ruleWidth: number,
): TreeData {
    const w = width / 2;
    const len = children.length;

    // - Base case -
    if (len === 0) {
        const left = -w - labelWidth;
        const right = w + ruleWidth;
        return {
                width, 
                collider: { l: [-w, left], r: [w, right] },
                offsets: [],
                barWidth: width,
                left, right,
            };
    }

    const N = len - 1;
    // Half-widths of first and last children
    const w0 = children[0].collider.r[0];
    const wN = children[N].collider.r[0];

    // - Left to right stack -
    let colL = clone(children[0].collider);
    const offsetsL = new Array(len).fill(0);
    
    for (let i = 1; i < len; i++) {
        const childCol = children[i].collider;
        const off = offset(colL, childCol);
        colL = merge(colL, childCol, 0, off);
        offsetsL[i] = off;
    }

    // - Shift everything to center -
    // Offset of the first child
    const off0 = (w0 - offsetsL[N] - wN) / 2;
    shift(colL.l, off0);
    shift(colL.r, off0);
    shift(offsetsL, off0);
    const offN = offsetsL[N];

    // - Right to left stack -
    // We are restacking the whole thing again but actually
    // we just need to restack the 'loose' ones but this is faster
    // to write right now. TODO: Optimize
    let colR = children[N].collider;
    const offsetsR = new Array(len).fill(0);
    offsetsR[0] = offsetsL[0];
    offsetsR[N] = offsetsL[N];

    for (let i = len - 2; i > 0; i--) {
        const childCol = children[i].collider;
        const off = offset(childCol, colR);
        colR = merge(childCol, colR, -off, 0);
        offsetsR[i] = offN - off;
    }

    // - Add parent's collider row -
    // Row under parent
    colL.l.unshift(-w);
    colL.r.unshift(w);
    // Calculate bar
    const barLeft = Math.min(colL.l[1], -w);
    const barRight = Math.max(colL.r[1], w);
    // Adjust the row over to not be smaller than parent
    colL.l[1] = barLeft - labelWidth;
    colL.r[1] = barRight + ruleWidth;

    return {
        width,
        collider: colL,
        offsets: average(offsetsL, offsetsR),
        barWidth: barRight - barLeft,
        left:  Math.min(colL.l[1], ...children.map(c => c.left)),
        right: Math.max(colL.r[1], ...children.map(c => c.right)),
    };
}

/** How much do you need to offset c1 to left to not clip c0? + margin */
function offset(c0: Collider, c1: Collider) {
    const short = Math.min(c0.l.length, c1.l.length);
    let dist = -Infinity;
    for (let i = 0; i < short; i++)
        dist = Math.max(dist, c0.r[i] - c1.l[i]);
    return dist + DT.derivMarginN;
}

/** Assumes they don't clip and c0 is at the left of c1 (with offsets) */
function merge(c0: Collider, c1: Collider, c0off = 0, c1off: number = 0): Collider {
    const short = Math.min(c0.l.length, c1.l.length);
    const long = Math.max(c0.l.length, c1.l.length);

    const l = new Array(long);
    const r = new Array(long);

    for (let i = 0; i < short; i++) {
        l[i] = c0.l[i] + c0off;
        r[i] = c1.r[i] + c1off;
    }
    if (c0.l.length > c1.l.length) {
        for (let i = short; i < long; i++) {
            l[i] = c0.l[i] + c0off;
            r[i] = c0.r[i] + c0off;
        }
    } else {
        for (let i = short; i < long; i++) {
            l[i] = c1.l[i] + c1off;
            r[i] = c1.r[i] + c1off;
        }
    }

    return { l, r };
}

function clone(c: Collider) {
    return {
        l: c.l.slice(),
        r: c.r.slice(),
    };
}

// - Array utils -
// Modifying!
function shift(arr: number[], offset: number) {
    for (let i = 0; i < arr.length; i++)
        arr[i] += offset;
    return arr;
}
// Modifying a!
function average(a: number[], b: number[]) {
    for (let i = 0; i < a.length; i++)
        a[i] = (a[i] + b[i]) / 2;
    return a;
}