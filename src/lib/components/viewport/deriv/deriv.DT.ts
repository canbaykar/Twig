const UNIT = 32;

/** Design tokens for deriv that are sent to CSS. See src/DT.ts */
export const derivDT = Object.freeze({
    /** (number) Multiplier for all sizes in viewport because of number rounding issues */
    UNIT,
    /** (number) Height of a row of deriv */
    derivRowOffset: 23 * UNIT,
    /** (number) Font size of formulas */
    derivFS: 16 * UNIT,

    /** (length) Line height of formulas */
    derivLH: '125%',
    /** (length) Line height of rules */
    derivRuleLH: 'normal',
    /** (length) Line height of labels */
    derivLabelLH: 13 * UNIT + 'px',
});

/** All design tokens for deriv. */
export const derivDTjs = Object.freeze({
    ...derivDT,
    /** (number) Font size of rules */
    derivRuleFS: 12 * UNIT,
    /** (number) Font size of labels */
    derivLabelFS: 12 * UNIT,
});