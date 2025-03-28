import { DT } from "../../../../DT";

export interface TreeData {
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
                collider: { l: [-w, left], r: [w, right] },
                offsets: [],
                barWidth: width,
                left, right,
            };
    }
    
    // Half-widths of first and last children
    const w0 = children[0].collider.r[0];
    const wN = children[len-1].collider.r[0];

    // - Left to right stack -
    let off = 0;
    let colL = clone(children[0].collider);
    const offsetsL = new Array(len).fill(0);
    
    for (let i = 1; i < len; i++) {
        const { collider, offset } = collide(colL, children[i].collider);
        colL = collider;
        offsetsL[i] = off += offset;
    }

    // - Shift everything to center -
    // Offset of the first child
    const off0 = (w0 - off - wN) / 2;
    off += off0;
    shift(colL.l, off0);
    shift(colL.r, off0);
    shift(offsetsL, off0);

    // - Right to left stack -
    // We are restacking the whole thing again but actually
    // we just need to restack the 'loose' ones but this is faster
    // to write right now. TODO: Optimize
    let colR = children[len-1].collider;
    const offsetsR = new Array(len).fill(0);
    offsetsR[0] = offsetsL[0];
    offsetsR[len-1] = offsetsL[len-1];

    for (let i = len - 2; i > 0; i--) {
        const { collider, offset } = collide(colR, children[i].collider);
        colR = collider;
        offsetsR[i] = off -= offset;
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
        collider: colL,
        offsets: average(offsetsL, offsetsR),
        barWidth: barRight - barLeft,
        left: Math.min(...colL.l),
        right: Math.max(...colL.r),
    };
}

function collide(c0: Collider, c1: Collider)
    : { collider: Collider, offset: number } {
    const short = Math.min(c0.l.length, c1.l.length);
    const long = Math.max(c0.l.length, c1.l.length);

    // Calculate offset
    let offset = -Infinity;
    for (let i = 0; i < short; i++) {
        offset = Math.max(offset, c0.r[i] - c1.l[i]);
    }
    offset += DT.derivMarginN;

    // Calculate collider
    const l = new Array(long);
    const r = new Array(long);
    for (let i = 0; i < short; i++) {
        l[i] = c0.l[i];
        r[i] = c1.r[i] + offset;
    }
    if (c0.l.length > c1.l.length) {
        for (let i = short; i < long; i++) {
            l[i] = c0.l[i];
            r[i] = c0.r[i];
        }
    } else {
        for (let i = short; i < long; i++) {
            l[i] = c1.l[i] + offset;
            r[i] = c1.r[i] + offset;
        }
    }

    return {
        collider: { l, r },
        offset,
    };
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