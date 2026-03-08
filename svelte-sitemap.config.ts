import type { OptionsSvelteSitemap } from 'svelte-sitemap';

const config: OptionsSvelteSitemap = {
	domain: process.env.BASE_URL_ORIGIN ?? "",
	trailingSlashes: true,
};

export default config;