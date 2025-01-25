import plugin from "tailwindcss/plugin";

/**
 * Constants related to the tree rendering that both JS and CSS can reach.
 * The keys are converted into UPPER-KEBAB-CASE for CSS (with -- prefix)!
 */
export const designToken = Object.freeze({
    rowOffset: 69,
});

// @ts-expect-error Thanks to https://stackoverflow.com/a/67243723/13217729
const kebabize = str => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $);
const prepKey = (k: string) => '--' + kebabize(k).toUpperCase();
const prepVal = (v: unknown) => '' + v;

let css: Record<string, string> = {};
for (const key in designToken) {
    css[prepKey(key)] = prepVal((designToken as Record<string, unknown>)[key]);
}
export const designTokenPlugin = plugin(function({ addUtilities }) {
    addUtilities({ ':root': css });
});