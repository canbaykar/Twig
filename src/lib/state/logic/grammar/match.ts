import { AtomicMetaFormula, type Formula } from './';

export class Match {
	// Metavariable map
	[name: number]: Formula;

    private constructor() {}

    static empty() {
        return new Match();
    }
    static match(f: Formula, mf: Formula): Match | Mismatch {
	    return new Match().match(f, mf);
    }
    static matchArray(fs: Formula[], mfs: Formula[]): Match | Mismatch {
        return new Match().matchArray(fs, mfs);
    }
    static tryMatchArray(fs: Formula[], mfss: Formula[][]): Match | Mismatch {
        return new Match().tryMatchArray(fs, mfss);
    }

	/** Returns new Match instance with [mf.label]: f, or Mismatch on conflict */
	addRecord(f: Formula, mf: Formula): Match | Mismatch {
		if (mf.label in this && !compare(this[mf.label as any], f))
			return new Mismatch(MismatchType.MetaConflict, f, mf);
		return Object.assign(new Match(), this, { [mf.label]: f });
	}

	match(f: Formula, mf: Formula): Match | Mismatch {
        if (mf instanceof AtomicMetaFormula)
			return this.addRecord(f, mf);
        if (f.constructor !== mf.constructor)
			return new Mismatch(MismatchType.Constructor, f, mf);
        if (f.label !== mf.label)
			return new Mismatch(MismatchType.Label, f, mf);
        return this.matchArray(f.args ?? [], mf.args ?? []);
	}
	matchArray(fs: Formula[], mfs: Formula[]): Match | Mismatch {
        let m: Match | Mismatch = this;
        for (let i = 0; i < fs.length; i++) {
            m = m.match(fs[i], mfs[i]);
            if (m instanceof Mismatch) return m;
        }
        return m;
	}

	/** Try to find the mf array that matches */
	tryMatchArray(fs: Formula[], mfss: Formula[][]) {
		for (const mfs of mfss) {
			const m = matchArray(fs, mfs);
			if (m instanceof Match) return m;
		}
		return new Mismatch(MismatchType.RanOut, fs, mfss);
	}
}

export const enum MismatchType {
	/** A metaformula records two different formulas */
	MetaConflict,
	/** Different types (e.g. atomic and binary) */
	Constructor,
	/** Different labels (but same types, e.g. ∧ and ↔) */
	Label,
	/** All matches failed in tryMatchArray */
	RanOut,
}
export class Mismatch {
	type: MismatchType;
	x?: Formula | Formula[];
	mx?: Formula | Formula[] | Formula[][];

	constructor(type: MismatchType.MetaConflict
					| MismatchType.Label
					| MismatchType.Constructor, formula: Formula, metaformula: Formula);
	constructor(type: MismatchType.RanOut, formula: Formula, metaformulas: Formula[]);
	constructor(type: MismatchType.RanOut, formulas: Formula[], metaformulaArrays: Formula[][]);
	constructor(type: MismatchType, x: Formula | Formula[], mx: Formula | Formula[] | Formula[] | Formula[][]) {
		this.type = type;
		this.x = x;
		this.mx = mx;
		return this;
	}

    // To support chaining like match(...).match(...)
	match() { return this; }
	matchArray() { return this; }
	addRecord() { return this; }
}

/**
 * Like regex. Atomic metaformulas (AMFs) match any formula. But any given AMF must
 * always match the same thing. (If [2] matched with B→C, it can't match with A→C...)
 * Different flavours: matchArray, tryMatch, tryMatchArray, new Match() (for empty match).
 * @example match(f1, mf1).tryMatch(f2, mfs1).matchArray(fs, mfs2) // Chaining
 * @param f A formula without AMFs (isn't checked)
 * @param mf A formula with AMFs to match
 * @returns Object that maps AMFs to their values, or Mismatch
 */
export const match = Match.match;
export const matchArray = Match.matchArray;
export const tryMatchArray = Match.tryMatchArray;

// -- Helpers --
/** Returns false if a and b are different */
function compare(a: Formula, b: Formula) {
	return a.constructor === b.constructor
		&& a.label === b.label
		&& compareArrays(a.args ?? [], b.args ?? []);
}
function compareArrays(a: Formula[], b: Formula[]) {
	for (let i = 0; i < a.length; i++) if (!compare(a[i], b[i])) return false;
	return true;
}
