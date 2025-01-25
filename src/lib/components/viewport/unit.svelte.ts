import { browser } from "$app/environment";
import viewport from "$lib/state/viewport.svelte";

/**
 * Some devices have non-integer devicePixelRatio
 * which makes trouble when css pixels are used.
 * UNIT = 1 / devicePixelRatio. Also reachable via
 * --U (in px) and --U-NUM (unitless) in CSS.
 */
export let UNIT = 1;

if (browser) {
    const dpr = window.devicePixelRatio;
    UNIT /= dpr;
    document.documentElement.style.setProperty('--U', UNIT + 'px');
    document.documentElement.style.setProperty('--U-NUM', UNIT + '');
    viewport.scale *= dpr;
    // console.log('UNIT ready: ' + UNIT);
}