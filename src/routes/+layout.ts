import { defineBaseMetaTags } from 'svelte-meta-tags';

export const prerender = true;

export const load = ({ url }) => {
  const baseTags = defineBaseMetaTags({
    title: '404',
    titleTemplate: '%s | Twig',
    description: 'Twig is an educational proof assistant. Make Gentzen-style derivations via drag-and-drop.',
    canonical: new URL(url.pathname, url.origin).href, // creates a cleaned up URL (without hashes or query params) from your current URL
    openGraph: {
      type: 'website',
      url: new URL(url.pathname, url.origin).href,
      locale: 'en_IE',
      title: 'Twig | Educational Proof Assistant',
      description: 'Twig is an educational proof assistant. Make Gentzen-style derivations via drag-and-drop.',
      siteName: 'Twig',
      images: [
        {
          url: '/branding/banner.png',
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