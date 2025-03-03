const UNIT = 32;
const rowOffset = 25 * UNIT;

// New DT system WIP
export const derivDT = {
    prefix: 'deriv',
    noprefix: ['UNIT'],

    css: {
        /** (number) Multiplier for all sizes in viewport because of number rounding issues */
        UNIT,
        /** (number) Height of a row of deriv */
        rowOffsetN: rowOffset,
        /** (number) Font size of formulas */
        SizeN: 16 * UNIT,
    },

    /** (number) Font size of rules */
    ruleSizeN: 12 * UNIT,
    /** (number) Font size of labels */
    labelSizeN: 12 * UNIT,

    /** (length) Line height of formulas */
    LineHeight: '125%',
    /** (number) Font size - line height ratio */
    // Make automatic based on the two props if experimenting!
    Height2Size: 1 / 1.25,
    /** (length) Line height of rules */
    ruleHeight: 'normal',
    /** (length) Line height of labels */
    labelHeight: 13 * UNIT + 'px',

    /** (number) Bottom css prop of bar */
    barBottomN: rowOffset - 3 * UNIT,
    /** (number) Left-right padding of conc */
    xPaddingN: 4,
    
    /** (number) Margin at the sides of the rule-bar 
     * (label and rule are counted as a part of the bar here.) */
    marginN: 10 * UNIT,
} as const;