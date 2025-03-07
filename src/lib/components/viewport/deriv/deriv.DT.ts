const UNIT = 32;
const rowOffset = 25 * UNIT;
const barGap = 3 * UNIT;
const labelHeight = 15 * UNIT;

// New DT system WIP
export const derivDT = {
    prefix: 'deriv',
    noprefix: ['UNIT', 'UNITPX'],

    css: {
        /** (number) Multiplier for all sizes in viewport because of number rounding issues */
        UNIT,
        UNITPX: UNIT + 'px',
        /** (number) Height of a row of deriv */
        rowOffsetN: rowOffset,
        
        /** (length) Font size of formulas */
        size: 16 * UNIT + 'px',
        /** (length) Font size of rules */
        ruleSize: 12 * UNIT + 'px',
        /** (length) Font size of labels */
        labelSize: 12 * UNIT + 'px',

        /** (length) Left-right padding of conc */
        xPadding: 4 * UNIT + 'px',
        
        /** (line-height) Line height of formulas */
        LineHeight: '125%',
        /** (line-height) Line height of rules */
        ruleLH: 'normal',
        /** (line-height) Line height of labels */
        labelLH: labelHeight - 2 * UNIT + 'px',

        /** (length) (relative to rule-bar) */
        ruleBottom: -8 * UNIT + 'px',
        /** (length) (relative to rule-bar) */
        ruleLeft: `calc(100% + ${-0.8 * UNIT + barGap}px)`,

        /** (length) */
        labelHeight: labelHeight + 'px',
        /** (length) */
        labelBottom: 0.5 * UNIT - labelHeight / 2 + 'px',
        /** (length) (relative to rule-bar) */
        labelRight: `calc(100% + ${barGap}px)`,
    },


    /** (number) Font size - line height ratio */
    // Make automatic based on the two props if experimenting!
    Height2Size: 1 / 1.25,

    /** (number) Bottom css prop of bar */
    barBottomN: rowOffset - 3 * UNIT,
    
    /** (number) Margin at the sides of the rule-bar 
     * (label and rule are counted as a part of the bar here.) */
    marginN: 10 * UNIT,
} as const;