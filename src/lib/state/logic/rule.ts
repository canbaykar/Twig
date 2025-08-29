import type { Formula } from "./grammar";
import { Match, tryMatchArray, type Mismatch } from "./grammar/match";
import grammar from "./grammar";
import { LogicError, type LogicState } from "./index.svelte";
import { ruleOptions, type RuleOption } from "./options";
import { defaultDownPropogateAttrs } from "./attributes";

export interface RuleMatch {
    rule: Rule,
    match: Match,
}

export type Matcher = Formula[];
export default class Rule {
    readonly name: string;
    readonly text: string;
    /** If true, this rule may discharge some assumptions */
    readonly discharging: boolean;
    /** 
     * MF arrays of form [conclusion, child1, child2, ...]
     * to match against. (Multiple to give alternatives, see →E.)
     */
    readonly matchers: Matcher[];

    readonly downPropogateAttrs: NonNullable<RuleOption['downPropagateAttrs']>;

    private constructor(opt: RuleOption) {
        this.name = opt.name;
        this.text = opt.text ?? this.name;
        this.discharging = !!opt.downPropagateAttrs;

        const conclusion = grammar.parseAll(opt.conclusion);
        const children = opt.children.map(arr => grammar.parseAll(arr));
        this.matchers = product(
            conclusion,
            children,
            (x, arr) => [x, ...arr],
        );

        this.downPropogateAttrs = opt.downPropagateAttrs ?? defaultDownPropogateAttrs;
    }

    /** 
     * Calculate if rule can potatially apply using only local data
     * @returns List of Matches with the rules matchers
     */
    match(formula: Formula, children: Formula[]): Match | Mismatch {
        return tryMatchArray([formula, ...children], this.matchers);
    }

    static readonly all = ruleOptions.map(opt => new Rule(opt));
    static readonly axiomRule = Rule.all[Rule.all.length - 1];

    static find(p: LogicState): RuleMatch[] | LogicError | SyntaxError {
        // Retrieve and validate data
        const conclusion = p.conc;
        if (conclusion instanceof Error) return new SyntaxError('Invalid formula in conclusion');
        const children = p.deriv.children.map(c => c.logic.conc);
        const errId = children.find(c => c instanceof Error);
        if (errId) return new SyntaxError('Invalid formula in child ' + errId);

        const results: RuleMatch[] = [];
        for (const rule of Rule.all) {
            const m = rule.match(conclusion, children as Formula[]);
            if (m instanceof Match) results.push({ rule, match: m });
        }
        if (results.length > 0) return results;
        return new LogicError('No rule found');
    }
}

/** Cartesian product, but op gets applied to the resulting pairs. */
function product<T, U, V>(a: T[], b: U[], op: (x: T, y: U) => V): V[] {
    return a.reduce((acc, x) => [...acc, ...b.map(y => op(x, y))], [] as V[]);
}