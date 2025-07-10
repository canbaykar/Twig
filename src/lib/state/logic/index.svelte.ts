import type Deriv from "../deriv.svelte";
import { defaultDownPropogateAttrs, defaultRootUpPropogateAttrs, defaultUpPropogateAttrs } from "./attributes";
import grammar, { Formula } from "./grammar";
import type { AttributeRecord } from "./options";
import Rule, { type RuleMatch } from "./rule";

export class LogicError extends Error {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "LogicError";
    }
}

// See dischargers
const emptySet: Set<LogicData> = new Set();

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
            : defaultRootUpPropogateAttrs();
    });

    /** ($derived) */
    readonly dischargedBy: LogicData | null = $derived.by(() => 
        this.rule === Rule.axiomRule
            ? this.upAttributes.discharged.get(this.conc.toString()) ?? null
            : null
    );

    /** ($derived) All derivs that discharge an EXISTING assumption in order.
     *  Sets have insertion order. */
    private readonly dischargers: Set<LogicData> = $derived.by(() =>
        this.rule === Rule.axiomRule
            ? this.dischargedBy ? new Set([this.dischargedBy]) : emptySet
            : this.deriv.children
                .map(c => c.logic.dischargers)
                .reduce((set, next) => set.union(next), new Set())
    );
    /** ($derived) Usually only used in root **/
    private readonly dischargersSorted: LogicData[] = $derived([...this.dischargers]);


    /** ($derived) */
    readonly labelText = $derived.by(() => {
        if (this.rule instanceof Error || !this.rule.discharging) return '';
        const index = this.deriv.root.logic.dischargersSorted.indexOf(this);
        return index === -1 ? '' : (index + 1).toString();
    });

    
    /** ($derived) */
    readonly ruleText: string = $derived.by(() => {
        // Error case
        if (this.rule instanceof Error) return '-';
        // Regular case
        if (this.rule !== Rule.axiomRule) return this.rule.text;
        // Axiom rule case (possibly discharged)
        return this.dischargedBy?.labelText ?? '';
    });

    constructor(deriv: Deriv) {
        this.deriv = deriv;
    }
}

// Will consider preferences when choosing in the future
function choose(matches: RuleMatch[]): RuleMatch {
    return matches[0];
}