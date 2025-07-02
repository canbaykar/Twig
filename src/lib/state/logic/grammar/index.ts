import type { ParserOptions, parser } from "peggy";
// @ts-ignore
import * as _base from './grammar.pegjs';

const empty = [] as const;
export abstract class Formula {
    label: string;
    args: Formula[] | readonly [] = empty;

    constructor(label: string, ...args: Formula[]) {
        this.label = label;
        this.args = args;
    }

    /** Normalised string form as opposed to .text */
    abstract toString(): string;
    /** Normalised string form but for use as subformula */
    // Override if it doesn't need paranthesis as subformula!
    toSubString(): string {
        return '(' + this.toString() + ')';
    }

    // Two nodes can only differ in either constructor or label!
    is(b: Formula) {
        return this.constructor === b.constructor 
            && this.label === b.label 
            && compareArrays(this.args, b.args);
    }
}

function compareArrays(a: readonly Formula[], b: readonly Formula[]) {
	for (let i = 0; i < a.length; i++) if (!a[i].is(b[i])) return false;
	return true;
}

export class BinaryFormula extends Formula {
    declare args: [Formula, Formula];

    constructor(label: string, ...args: [Formula, Formula]) {
        super(label, ...args);
    }

    toString(): string {
        return this.args[0].toSubString() + this.label + this.args[1].toSubString();
    }
}

export class UnaryFormula extends Formula {
    declare args: [Formula];

    constructor(label: string, arg: Formula) {
        super(label, arg);
    }

    toString(): string {
        return this.label + this.args[0].toSubString();
    }
}

export class AtomicFormula extends Formula {
    declare args: readonly [];

    constructor(label: string) {
        super(label);
    }

    toString(): string {
        return this.label;
    }
    toSubString(): string {
        return this.label;
    }
}

/** Class for ***atomic metaformula (AMF)***. A metaformula is a formula with AMFs. */
export class AtomicMetaFormula extends Formula {
    declare args: readonly [];

    constructor(label: string) {
        super(label);
    }

    toString(): string {
        return '[' + this.label + ']';
    }
    toSubString(): string {
        return this.toString();
    }
}


// --- grammar.pegjs ---
// For typing only
const base: Base = _base;

export type GrammarError = InstanceType<parser.SyntaxErrorConstructor>;
export type Parsed = Formula | GrammarError;

// See the definition of Parser in peggy source
interface Base {
	StartRules: string[];
	SyntaxError: parser.SyntaxErrorConstructor;

	/** @throws {Parser.SyntaxError} If input is invalid */
	parse(input: string, options: Omit<ParserOptions, 'peg$library'> & { peg$library: true }): Formula;
	parse(input: string, options?: ParserOptions): Formula;
}

export type { Grammar };
class Grammar {
    readonly StartRules = base.StartRules;
    /** Not instance of SyntaxError for some reason */
    readonly Error = base.SyntaxError;

	parse(input: string, options?: ParserOptions) {
		return base.parse(input, options);
	}
	parseAll(inputs: string[], options?: ParserOptions) {
		return inputs.map((i) => base.parse(i, options));
	}

	safeParse(input: string, options?: ParserOptions): Parsed {
		try {
			return base.parse(input, options);
		} catch (e) {
			if (e instanceof this.Error) return e;
            else throw e;
		}
	}
	safeParseAll(inputs: string[], options?: ParserOptions) {
		return inputs.map((i) => this.safeParse(i, options));
	}
}

const grammar = new Grammar();
export default grammar;