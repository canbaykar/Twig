import { defineConfig } from 'vitest/config';
import Icons from 'unplugin-icons/vite'
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

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
		// Set https: true to use
		basicSsl({
			name: 'dev',
			certDir: './',
		}),
	],

	server: {
		https: false,
	},

	test: {
		// include: ['src/**/*.{test,spec}.{js,ts}']
		include: ['src/**/*.{js,ts}'],
	},
	define: {
		'import.meta.vitest': 'undefined',
	},
});
