import { defineConfig } from 'vitest/config';
import Icons from 'unplugin-icons/vite'
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

// For some reason allowJs doesn't prevent the error with this
// @ts-expect-error
import peggyLoader from "vite-plugin-peggy-loader";

export default defineConfig({
	plugins: [
		peggyLoader({
            cache: false,
            optimizeParser: 'speed',
            trace: false,
            dependencies: {},
            allowedStartRules: []
        }),
		sveltekit(), 
		tailwindcss(),
		Icons({
			compiler: 'svelte',
		}),
	],

	test: {
		// include: ['src/**/*.{test,spec}.{js,ts}']
		include: ['src/**/*.{js,ts}'],
	},
	define: {
		'import.meta.vitest': 'undefined',
	},
});
