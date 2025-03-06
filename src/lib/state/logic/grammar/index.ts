import type { ParserOptions, parser } from "peggy";
// @ts-ignore
import * as _grammar from './grammar.pegjs';

const empty = [] as const;
export abstract class Formula {
    label: string;
    text: string;
    args: Formula[] | readonly [] = empty;

    constructor(text: string, label: string) {
        this.label = label;
        this.text = text;
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
    args: [Formula, Formula];

    constructor(text: string, label: string, args: [Formula, Formula]) {
        super(text, label);
        this.args = args;
    }

    toString(): string {
        return this.args[0].toSubString() + this.label + this.args[1].toSubString();
    }
}

export class UnaryFormula extends Formula {
    args: [Formula];

    constructor(text: string, label: string, args: [Formula]) {
        super(text, label);
        this.args = args;
    }

    toString(): string {
        return this.label + this.args[0].toSubString();
    }
}

export class AtomicFormula extends Formula {
    args = empty;

    toString(): string {
        return this.label;
    }
    toSubString(): string {
        return this.label;
    }
}

/** Class for ***atomic metaformula (AMF)***. A metaformula is a formula with AMFs. */
export class AtomicMetaFormula extends Formula {
    args = empty;

    toString(): string {
        return '[' + this.label + ']';
    }
    toSubString(): string {
        return this.toString();
    }
}

// See the definition of Parser in peggy source
export interface Grammar {
	StartRules: string[];
	SyntaxError: parser.SyntaxErrorConstructor;

	/** @throws {Parser.SyntaxError} If input is invalid */
	parse(input: string, options: Omit<ParserOptions, 'peg$library'> & { peg$library: true }): Formula;
	parse(input: string, options?: ParserOptions): Formula;

	parseAll(
		inputs: string[],
		options: Omit<ParserOptions, 'peg$library'> & { peg$library: true }
	): Formula[];
	parseAll(inputs: string[], options?: ParserOptions): Formula[];
}

const grammar = Object.freeze({
    ..._grammar,
    parseAll,
}) as Grammar;
export default grammar;

function parseAll(
	inputs: string[],
	options?: ParserOptions | Omit<ParserOptions, "peg$library"> & { peg$library: true }
): Formula[] {
	return inputs.map(i => (_grammar as Grammar).parse(i, options));
}