// Exports constants related to the tree rendering
// so that both JS and CSS can use them.

export const designToken = Object.freeze({
    rowOffset: 34.5,
});

// --- CSS-in-JS Form ---
// The keys are converted into UPPER-KEBAB-CASE for CSS (with -- prefix)!

// @ts-expect-error Thanks to https://stackoverflow.com/a/67243723/13217729
const kebabize = str => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $);
const prepKey = (k: string) => '--' + kebabize(k).toUpperCase();
const prepVal = (v: unknown) => '' + v;

let css: Record<string, string> = {};
for (const key in designToken) {
    css[prepKey(key)] = prepVal((designToken as Record<string, unknown>)[key]);
}
export const designTokenCSS = Object.freeze(css);