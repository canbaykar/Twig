import { building } from '$app/environment';
import { base } from '$app/paths';
import { defineBaseMetaTags } from 'svelte-meta-tags';

export const prerender = true;

export const load = ({ url }) => {
	// See BASE_URL_ORIGIN in src/global.d.ts
	const origin = building ? BASE_URL_ORIGIN : url.origin;
	const href = new URL(url.pathname, origin).href;
	const static_ = (path: string) => new URL(base + path, origin).href;
	const bannerURL = static_('/branding/banner.png');

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
					url: bannerURL,
					alt: 'Twig: Educational Proof Assistant',
					width: 1280,
					height: 640,
					type: 'image/png'
				}
			]
		},

		additionalMetaTags: [
			{ // For Google Search Console
				name: "google-site-verification",
				content: "WHmIHZna6NaNkLJp2G8GRQ10kFRWr_CaO0h-NisyZgw"
			},
			{ // OrcaScan suggestion
				property: "og:logo",
				content: bannerURL
			},
		],
	});

	return { ...baseTags };
};