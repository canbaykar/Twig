import { definePageMetaTags } from 'svelte-meta-tags';

export const load = () => {
  const pageTags = definePageMetaTags({
    title: 'Twig | Educational Proof Assistant',
	titleTemplate: '%s',
  });

  return { ...pageTags };
};