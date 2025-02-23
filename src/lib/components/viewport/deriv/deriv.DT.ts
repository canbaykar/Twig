const UNIT = 32;

/** Design tokens for deriv that are sent to CSS. See src/DT.ts */
export const derivDT = Object.freeze({
    /** Multiplier for all sizes in viewport because of number rounding issues */
    UNIT,
    /** Height of a row of deriv */
    derivRowOffset: 23 * UNIT,
    /** Font size of formulas */
    derivFS: 16 * UNIT,
});

/** All design tokens for deriv. */
export const derivDTjs = Object.freeze({
    ...derivDT,
    /** Font size of rules */
    derivRuleFS: 12 * UNIT,
    /** Font size of labels */
    derivLabelFS: 12 * UNIT,

    /** Line height of formulas */
    derivLH: '125%',
    /** Line height of rules */
    derivRuleLH: 'normal',
    /** Line height of labels */
    derivLabelLH: 13 * UNIT,
});