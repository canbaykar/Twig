import type { LogicState } from "./index.svelte";
import { UnaryFormula, type Formula } from "./grammar";
import type { Match } from "./grammar/match";
// ==== TYPES ====
// -- Attributes --
export enum AttributeType { Down, Up }
export type AttributeRecord = Record<string, any>;
/** How attributes will be stored in proofs */
export interface AttributeData {
    down: AttributeRecord,
    up:   AttributeRecord,
}
export type AttributeOption = DownAttributeOption | UpAttributeOption;
export type AttributeOptions = Record<string, AttributeOption>;

export interface DownAttributeOption {
    type: AttributeType.Down;
    /** Specify default propogation behaviour */
    default(childDownAttrs: AttributeRecord[]): any;
}

export interface UpAttributeOption {
    type: AttributeType.Up;
    /** Specify default value at root */
    defaultRoot(): any;
    /** Specify default propogation behaviour */
    default(
        parentAttrData: AttributeData,
        index: number,
        parent: LogicState,
    ): any;
}

// -- Rules --
export type RuleOptions = RuleOption[];
export interface RuleOption {
    /** Unique name of the rule */
    name: string;
    /** The rule name that's displayed beside the rule bar */
    text?: string;
    /**
     * Array of array of metaformulas (MFs) to match children.
     * @example [['[1]', '[1]→[2]'], ['[1]', '[2]←[1]']] // For →E
     */
    children: string[][];
    /**
     * MF string array to match conclusion. To allow
     * multiple deductions from the children. All 
     * combinations apply (all conclusions are deducable
     * from all children sets).
     */
    conclusion: string[];
    downPropagateAttrs?(
        childDownAttrs: AttributeRecord[],
        metavariables: Match,
        conclusion: Formula,
    ): AttributeRecord;
};

// ==== DATA ====
export const attributeOptions: AttributeOptions = {
    // --- Down ---
    assumptions: {
        type: AttributeType.Down,
        default(attrs: AttributeRecord[]): Set<string> {
            let u: Set<string> = new Set();
            for (const attr of attrs) u = u.union(attr.assumptions);
            return u;
        },
    },
    discharges: {
        type: AttributeType.Down,
        default(attrs: AttributeRecord[]): Set<string>[] {
            return new Array(attrs.length).fill(new Set());
        }
    },
    // --- Up ---
    discharged: {
        type: AttributeType.Up,
        defaultRoot(): Map<string, LogicState> {
            return new Map();
        },
        default(pAD: AttributeData, i: number, p: LogicState): Map<string, LogicState> {
            const map = new Map(pAD.up.discharged as Map<string, LogicState>);
            for (const str of pAD.down.discharges[i] as Set<string>) {
                map.set(str, p);
            }
            return map;
        }
    }
};

export const ruleOptions: RuleOptions = [
    // --- Discharging rules ---
    // Order matters!
    {
        name: '→I',
        children: [['[2]']],
        conclusion: ['[1]→[2]', '[2]←[1]'],
        downPropagateAttrs(childAttrs, meta) {
            const m1 = meta[1].toString();
            const assumptions = new Set(childAttrs[0].assumptions);
            assumptions.delete(m1);
            return {
                assumptions,
                discharges: [new Set([m1])],
            };  
        },
    },
    {
        name: '¬I',
        children: [['[1]', '¬[1]']],
        conclusion: ['¬[2]'],
        downPropagateAttrs(childAttrs, meta) {
            const m2 = meta[2].args[0].toString();
            const assumptions 
                = new Set(childAttrs[0].assumptions)
                .union(childAttrs[1].assumptions);
            assumptions.delete(m2);
            const m2Set = new Set([m2]);
            return {
                assumptions,
                discharges: [m2Set, m2Set],
            };  
        },
    },
    {
        name: '¬E',
        children: [['[1]', '¬[1]']],
        conclusion: ['[2]'],
        downPropagateAttrs(childAttrs, meta) {
            const m2_ = new UnaryFormula('¬', meta[2]);
            const assumptions 
                = new Set(childAttrs[0].assumptions)
                .union(new Set(childAttrs[1].assumptions));
            assumptions.delete(m2_);
            const m2_Set = new Set([m2_]);
            return {
                assumptions,
                discharges: [m2_Set, m2_Set],
            };  
        },
    },
    {
        name: '∨E',
        children: [['[1]∨[2]', '[3]', '[3]']],
        conclusion: ['[3]'],
        downPropagateAttrs(childAttrs, meta) {
            // Metavariables
            const m1 = meta[1].toString();
            const m2 = meta[2].toString();
            // Assumptions
            const ass0 = new Set(childAttrs[0].assumptions);
            const ass1 = new Set(childAttrs[1].assumptions);
            const ass2 = new Set(childAttrs[2].assumptions);
            ass1.delete(m1);
            ass2.delete(m2);
            const assumptions = ass0.union(ass1).union(ass2);
            return {
                assumptions,
                discharges: [new Set(), new Set([m1]), new Set([m2])],
            };  
        },
    },
    // --- Non-discharging rules ---
    // Order doesn't matter
    {
        name: '∧I',
        children: [['[1]', '[2]']],
        conclusion: ['[1]∧[2]'],
    },
    {
        name: '∧E',
        children: [['[1]∧[2]']],
        conclusion: ['[1]', '[2]'],
    },
    {
        name: '→E',
        children: [
            ['[1]', '[1]→[2]'],
            ['[1]', '[2]←[1]'],
        ],
        conclusion: ['[2]'],
    },
    {
        name: '∨I',
        children: [['[1]']],
        conclusion: ['[1]∨[2]', '[2]∨[1]'],
    },
    {
        name: '↔E',
        children: [['[1]↔[2]']],
        conclusion: ['[1]→[2]', '[2]→[1]', '[1]←[2]', '[2]←[1]'],
    },
    {
        name: '↔I',
        children: [
            ['[1]→[2]', '[2]→[1]'],
            ['[1]→[2]', '[1]←[2]'],
            ['[2]←[1]', '[2]→[1]'],
            ['[2]←[1]', '[1]←[2]'],
        ],
        conclusion: ['[1]↔[2]', '[2]↔[1]'],
    },
    // --- Axiom rule ---
    {
        name: 'axiom rule',
        text: '',
        children: [[]],
        conclusion: ['[1]'],
        downPropagateAttrs(_, __, conclusion) {
            return {
                assumptions: new Set([conclusion.toString]),
                discharges: [],
            };
        },
    },
];