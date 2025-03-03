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
        rowOffset: rowOffset,
        /** (number) Font size of formulas */
        FS: 16 * UNIT,
    },

    /** (number) Font size of rules */
    ruleFS: 12 * UNIT,
    /** (number) Font size of labels */
    labelFS: 12 * UNIT,

    /** (length) Line height of formulas */
    LH: '125%',
    /** (number) Font size - line height ratio */
    // Make automatic based on the two props if experimenting!
    LH2FS: 1 / 1.25,
    /** (length) Line height of rules */
    ruleLH: 'normal',
    /** (length) Line height of labels */
    labelLH: 13 * UNIT + 'px',

    /** (number) Bottom css prop of bar */
    barBottom: rowOffset - 3 * UNIT,
    /** (number) Left-right padding of conc */
    xPadding: 4,
    
    /** (number) Margin at the sides of the rule-bar 
     * (label and rule are counted as a part of the bar here.) */
    margin: 10 * UNIT,
} as const;