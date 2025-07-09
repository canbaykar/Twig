import type Deriv from "../deriv.svelte";
import { defaultDownPropogateAttrs, defaultUpPropogateAttrs } from "./attributes";
import grammar, { Formula } from "./grammar";
import type { AttributeRecord } from "./options";
import Rule, { type RuleMatch } from "./rule";

export class LogicError extends Error {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "LogicError";
    }
}

/** Has inference related computed data of Deriv */
export class LogicData {
    readonly deriv: Deriv;
    readonly conc = $derived.by(() => grammar.safeParse(this.deriv.conc));

    readonly matches = $derived.by(() => Rule.find(this));

    /** ($derived) Data belonging to this derivation, excluding context of its parent nodes.
     *  Here, attr is downAttribute! upAttributes aren't local. */
    private readonly local: { rule: Rule | LogicError, attr: AttributeRecord } = $derived.by(() => {
        const match = this.matches instanceof Error ? this.matches : choose(this.matches);
        const childAttrs: AttributeRecord[] = this.deriv.children.map(c => c.logic.local.attr);
        return match instanceof Error
            ? {
                rule: match,
                attr: defaultDownPropogateAttrs(childAttrs),
            }
            : {
                rule: match.rule,
                attr: match.rule.downPropogateAttrs(
                    childAttrs,
                    match.match,
                    this.conc as Formula,
                ),
            };
    });

    /** ($derived) */
    get rule() { return this.local.rule }
    /** ($derived) */
    get downAttributes() { return this.local.attr; }

    /** ($derived) */
    readonly upAttributes: AttributeRecord = $derived.by(() => {
        return this.deriv.derivParent
            ? defaultUpPropogateAttrs(
                {
                    down: this.deriv.derivParent.logic.downAttributes,
                    up: this.deriv.derivParent.logic.upAttributes,
                },
                this.deriv.childIndex,
                this.deriv.derivParent.logic,
            )
            : defaultDownPropogateAttrs([]);
    });

    /** ($derived) */
    readonly ruleText = $derived.by(() => getRuleText(this.rule, 0));

    /** ($derived) */
    readonly dischargedBy: LogicData | null = $derived.by(() => 
        this.rule === Rule.axiomRule
            ? this.upAttributes.discharged.get(this.conc) ?? null
            : null
    );


    // readonly attributes: AttributeData = { down: {}, up: {} };
    // readonly label = $state(0); // 0 means no label
    // readonly dischargedBy: LogicData | null = $state(null);
    // readonly matches: Gettable<RuleMatch[] | LogicError | SyntaxError>
    //     = gettable(new LogicError('Loading...'));
    // readonly rule: Gettable<Rule | LogicError | SyntaxError>
    //     = gettable(new LogicError('Loading...'));
    // // - Derived -
    // // Listening to .logic instead of ProofData doesn't work in initialisation
    // readonly parentData: GettableNonWritable<Deriv | null>;
    // /** Index of data as a child of proof-parent */
    // readonly index: GettableNonWritable<number | null>;
    // readonly children: GettableNonWritable<(Formula | Error)[]>;
    // readonly normalizedConclusionText: GettableNonWritable<string | null>;
    // readonly ruleText: GettableNonWritable<string>;
    // readonly discharged: GettableNonWritable<boolean>
    //     = gettableDerived(this.dischargedBy, $db => $db !== null);

    constructor(deriv: Deriv) {
        this.deriv = deriv;
        // Derived
        // this.parentData = data.parent;
        // this.conclusion = gettableDerived(
        //     data.conc,
        //     $conc => {
        //         try { return grammar.parse($conc); }
        //         catch (error: any) {
        //             if (error?.name !== 'SyntaxError') throw error;
        //             return error as Error;
        //         }
        //     }
        // );
        // this.normalizedConclusionText = gettableDerived(
        //     this.conclusion,
        //     $conc => isError($conc) ? null : grammar.normalizedString($conc)
        // );
    }

    // downPropogate() {
    //     // Get matches
    //     const matches = Rule.find(this);
    //     this.matches.set(matches);
    //     // Down-propogate
    //     const childAttrs = this.data.children.get().map(c => c.logicData.attributes.down);
    //     if (isError(matches)) {
    //         this.rule.set(matches);
    //         this.attributes.down = defaultDownPropogateAttrs(childAttrs);
    //     } else {
    //         const { rule, match } = choose(matches);
    //         this.rule.set(rule);
    //         this.attributes.down = rule.downPropogateAttrs(
    //             childAttrs,
    //             match,
    //             this.conclusion.get() as Formula,
    //         );
    //     }
    // }

    // upPropogate() {
    //     const parent = this.parentData.get()?.logicData;
    //     this.attributes.up = parent
    //         ? defaultUpPropogateAttrs(
    //             parent.attributes,
    //             this.index.get() as number,
    //             parent,
    //         )
    //         : defaultRootUpPropogateAttrs();

    //     // If not infered, rule text is determined by dischargedBy:
    //     if (this.rule.get() === Rule.axiomRule) {
    //         const dischargingStep
    //             = (this.attributes.up.discharged as Map<string, LogicData>)
    //                 .get(this.normalizedConclusionText.get() as string) ?? null;
    //         (this.dischargedBy as Gettable<LogicData | null>).set(dischargingStep);
    //     }
    // }
}

// Will consider preferences when choosing in the future
function choose(matches: RuleMatch[]): RuleMatch {
    return matches[0];
}

function getRuleText(
    rule: Rule | LogicError | SyntaxError,
    /** 0 means not discharged */
    dischargingStepLabel: number,
) {
    // Error case
    if (rule instanceof Error)
        return rule.message === 'Loading...' ? '...' : '-';
    // Regular case
    if (rule !== Rule.axiomRule)
        return rule.text;
    // Axiom rule case (possibly discharged)
    return dischargingStepLabel
        ? String(dischargingStepLabel)
        : '';
}