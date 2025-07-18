const UNIT = 32;
const fontSize = 16 * UNIT;
const lineHeight = 20 * UNIT;
const rowOffset = 25 * UNIT;
const barBottom = rowOffset - 3 * UNIT;
const barGap = 3 * UNIT;
const labelHeight = 15 * UNIT;
const ruleSize = 12 * UNIT;
const ruleHeight = 1.5 * ruleSize;
const ruleBottom = -8 * UNIT;
const dropZonePadding = 0.1 * rowOffset;

// New DT system WIP
export const derivDT = {
    prefix: 'deriv',
    noprefix: ['UNIT', 'UNITPX'],

    css: {
        /** (number) Multiplier for all sizes in viewport because of number rounding issues */
        UNIT,
        UNITPX: UNIT + 'px',
        /** (length) Height of a row of deriv */
        rowOffset: rowOffset + 'px',
        
        /** (length) Font size of formulas */
        size: fontSize + 'px',
        /** (length) Font size of rules */
        ruleSize: ruleSize + 'px',
        /** (length) Font size of labels */
        labelSize: 12 * UNIT + 'px',

        /** (length) Left-right padding of conc */
        xPadding: 4 * UNIT + 'px',
        
        /** (line-height) Line height of formulas */
        lineHeight: lineHeight + 'px',
        /** (line-height) Line height of rules */
        ruleLH: ruleHeight + 'px',
        /** (line-height) Line height of labels */
        labelLH: labelHeight - 2 * UNIT + 'px',

        /** (length) Bottom css prop of bar */
        barBottom: barBottom + 'px',

        /** (length) (relative to rule-bar) */
        ruleBottom: ruleBottom + 'px',
        /** (length) (relative to rule-bar) */
        ruleLeft: `calc(100% + ${-0.8 * UNIT + barGap}px)`,

        /** (length) */
        labelHeight: labelHeight + 'px',
        /** (length) */
        labelBottom: 0.5 * UNIT - labelHeight / 2 + 'px',
        /** (length) (relative to rule-bar) */
        labelRight: `calc(100% + ${barGap}px)`,
    },

    /** (number) Height of a row of deriv */
    rowOffsetN: rowOffset,
    
    /** (number) Bottom css prop of bar */
    barBottomN: barBottom,
    /** (number) rowOffsetN - barBottomN */
    barTopN: rowOffset - barBottom,

    /** (number) Formula line height / 1px */
    lineHeightN: lineHeight,
    /** (number) Formula font size / 1px */
    sizeN: fontSize,

    /** (number) Padding at either side of sidemost dropzones (except top and bottom type zones) */
    dropZonePaddingN: dropZonePadding,
    
    /** (number) Margin at the sides of the rule-bar 
     * (label and rule are counted as a part of the bar here.) */
    marginN: 10 * UNIT,

    /** (number) Padding around background rectangles */
    bgPaddingN: 3 * UNIT,

    /** (number) Gap between label and bar */
    barGapN: barGap,
    /** (number) Height of the label */
    labelHeightN: labelHeight,
    /** (number) Bottom css prop of label without px. Relative to barBottom... */
    labelBottomN: 0.5 * UNIT - labelHeight / 2,
    /** (number) Gap between rule and bar */
    ruleLeftN: -0.8 * UNIT + barGap,
    /** (number) Height of the rule */
    ruleHeightN: ruleHeight,
    /** (number) Bottom css prop of rule without px. Relative to barBottom... */
    ruleBottomN: ruleBottom,

    /** (number) The gap between the left side of the rule element and first paranthesis */
    ruleParanthesisGapN: 1 * UNIT,
} as const;