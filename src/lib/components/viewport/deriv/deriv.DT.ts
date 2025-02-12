/** Design tokens for deriv that are sent to CSS. See src/DT.ts */
export const derivDT = Object.freeze({
    /** Height of a row of deriv */
    derivRowOffset: 23,
    /** Font size of formulas */
    derivFS: 16,
});

/** All design tokens for deriv. */
export const derivDTjs = Object.freeze({
    ...derivDT,
    /** Font size of rules */
    derivRuleFS: 12,
    /** Font size of labels */
    derivLabelFS: 12,

    /** Line height of formulas */
    derivLH: '125%',
    /** Line height of rules */
    derivRuleLH: 'normal',
    /** Line height of labels */
    derivLabelLH: 13,
});