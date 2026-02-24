/**
 * When prerendering (building == true), you can use this as url origin.
 * This is added to prerender meta tags correctly so that browsers
 * without JS still get correct tags even with adapter-static.
 * Only use when building == true!!
 * Defined in vite.config.ts.
 */
declare const BASE_URL_ORIGIN: string;