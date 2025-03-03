// Do not use $lib here!
import { derivDT, _derivDT } from "./lib/components/viewport/deriv/deriv.DT";
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



// New DT system WIP
let _css: Record<string, string> = {};
export const _DT = prepareDTs(
    _derivDT,
    // ...
);

export type DesignToken = Readonly<{
    [key: string]: any;
    /** Prefix to add when mergin into the main DT */
    prefix?: string;
    /** Set of keys that won't take prefixes (even in css) */
    noprefix?: readonly string[];
    /** Has token entries to export to css */
    css?: Record<string, any>;
}>;
// Update this if you update above!
type Special = 'prefix' | 'noprefix' | 'css';

function prepareDTs<T extends DesignToken[]>(...dts: T) {
    // Special keys
    const special = new Set(['prefix', 'noprefix', 'css']);
    // Final output
    let DT: Writeable<DesignToken> = {};

    for (const dt of dts) {
        const pre = dt.prefix;
        const nopre = new Set(dt?.noprefix ?? []);
        const addPre: (s: string) => string = pre
            ? (s) => nopre.has(s) ? s : pre + s.charAt(0).toUpperCase() + s.slice(1)
            : (s) => s;

        // JS entries
        for (const key in dt) {
            if (special.has(key)) continue;
            DT[addPre(key)] = dt[key];
        }
        // CSS entries
        if (!dt.css) continue;
        for (const key in dt.css) {
            const pkey = addPre(key);
            const val = dt.css[key];
            DT[pkey] = val;
            _css[prepKey(pkey)] = prepVal(val);
        }
    }

    return Object.freeze(DT) as PrepDTs<T>;
}

// Here's the type madness to make the function above work better
// with intellisense
type PrepNoprefix<NoPre extends readonly string[] | undefined> 
    = NoPre extends readonly string[] ? NoPre : [];
type PrepPrefix<Pre extends string | undefined> 
    = Pre extends string ? Pre : '';
type Flatten<T extends DesignToken> 
    = Omit<T, Special> & T['css'];

type AddPrefix<T extends string, Pre extends string> 
    = `${Pre}${Capitalize<string & T>}`;
type AddPrefixIfChosen<T extends string, Pre extends string, Nopre> 
    = T extends Nopre ? T : AddPrefix<T, Pre>;
type PrefixChosenKeys<T, Pre extends string, Nopre> 
    = { [key in keyof T as AddPrefixIfChosen<string & key, Pre, Nopre>]: T[key] };

type PrepDT<DT extends DesignToken> 
    = PrefixChosenKeys<Flatten<DT>, PrepPrefix<DT['prefix']>, PrepNoprefix<DT['noprefix']>[number]>;
type PrepDTs<DTs extends DesignToken[]> 
    = Readonly<UnionToIntersection<PrepDT<DTs[number]>>>;

// The following merges an array T of objects like Object.assign when given T[number]
// https://stackoverflow.com/a/50375286/2398020
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

type Writeable<T> = { -readonly [P in keyof T]: T[P] };