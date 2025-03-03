const UNIT = 32;

/** Design tokens for deriv that are sent to CSS. See src/DT.ts */
export const derivDT = Object.freeze({
    /** (number) Multiplier for all sizes in viewport because of number rounding issues */
    UNIT,
    /** (number) Height of a row of deriv */
    derivRowOffset: 25 * UNIT,
    /** (number) Font size of formulas */
    derivFS: 16 * UNIT,
});

/** All design tokens for deriv. Some are unitless!
 *  Some are unitless! Use them with UNIT*px */
export const derivDTjs = Object.freeze({
    ...derivDT,
    
    /** (number) Font size of rules */
    derivRuleFS: 12 * UNIT,
    /** (number) Font size of labels */
    derivLabelFS: 12 * UNIT,

    /** (length) Line height of formulas */
    derivLH: '125%',
    /** (number) Font size - line height ratio */
    // Make automatic based on the two props if experimenting!
    derivLH2FS: 1 / 1.25,
    /** (length) Line height of rules */
    derivRuleLH: 'normal',
    /** (length) Line height of labels */
    derivLabelLH: 13 * UNIT + 'px',

    /** (number) Bottom css prop of bar */
    derivBarBottom: derivDT.derivRowOffset - 3 * UNIT,
    /** (number) Left-right padding of conc */
    derivXPadding: 4,

    /** (number) Margin at the sides of the rule-bar 
     * (label and rule are counted as a part of the bar here.) */
    derivMargin: 10 * UNIT,
});