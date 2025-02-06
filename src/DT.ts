// Do not use $lib here!
import { derivDT } from "./lib/components/viewport/deriv/deriv.DT";
import plugin from "tailwindcss/plugin";

/**
 * DT stands for design token. It contains constants related to the tree 
 * rendering that both JS and CSS can reach. The keys are converted into 
 * UPPER-KEBAB-CASE for CSS (with -- prefix)!
 * 
 * To add keys to this either add directly to its definition, or (for better 
 * organisation) make a file like below and add it to the definition of DT;
 * @example
 * // Contents of src/lib/thing/thing.DT.ts:
 * export const thingDT = Object.freeze({
 *    abcDef: 42, // In CSS turns to: --ABC-DEF: 42;
 * });
 * 
 * // Contents of src/DT.ts:
 * // Do not use $lib here!
 * import { thingDT } from "./lib/something/DT.ts";
 * import plugin from "tailwindcss/plugin";
 * 
 * export const DT = Object.freeze({
 *    // ...
 *    ...thingDT,
 * });
 * 
 * // ...
 */
export const DT = Object.freeze({
    ...derivDT,
    // Add other design tokents here
});


// ---- Plugin ----
// @ts-expect-error Thanks to https://stackoverflow.com/a/67243723/13217729
const kebabize = str => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $);
const prepKey = (k: string) => '--' + kebabize(k).toUpperCase();
const prepVal = (v: unknown) => '' + v;

let css: Record<string, string> = {};
for (const key in DT) {
    css[prepKey(key)] = prepVal((DT as Record<string, unknown>)[key]);
}
/** Tailwind plugin to inject the tokens into CSS */
export const DTPlugin = plugin(function({ addBase }) {
    addBase({ ':root': css });
});