import { building } from '$app/environment';
import { base } from '$app/paths';
import { defineBaseMetaTags } from 'svelte-meta-tags';

export const prerender = true;

export const load = ({ url }) => {
	// See BASE_URL_ORIGIN in src/global.d.ts
	const origin = building ? BASE_URL_ORIGIN : url.origin;
	const href = new URL(url.pathname, origin).href;
	const static_ = (path: string) => new URL(base + path, origin).href;

	const baseTags = defineBaseMetaTags({
		title: '404',
		titleTemplate: '%s | Twig',
		description: 'Twig is an educational proof assistant. Make Gentzen-style derivations via drag-and-drop.',
		canonical: href, // creates a cleaned up URL (without hashes or query params) from your current URL
		openGraph: {
			type: 'website',
			url: href,
			locale: 'en_IE',
			title: 'Twig | Educational Proof Assistant',
			description: 'Twig is an educational proof assistant. Make Gentzen-style derivations via drag-and-drop.',
			siteName: 'Twig',
			images: [
				{
					url: static_('/branding/banner.png'),
					alt: 'Twig: Educational Proof Assistant',
					width: 1280,
					height: 640,
					type: 'image/png'
				}
			]
		}
	});

	return { ...baseTags };
};