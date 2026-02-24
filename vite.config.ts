/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import Icons from 'unplugin-icons/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

// For some reason allowJs doesn't prevent the error with this
// @ts-expect-error
import peggyLoader from 'vite-plugin-peggy-loader';

// These lines are added by Storybook and they throw typescript errors for some reason.
// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
// @ts-expect-error
import path from 'node:path'; // @ts-expect-error
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = // @ts-expect-error
	typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
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
			compiler: 'svelte'
		}),
		// Set https: true to use
		basicSsl({
			name: 'dev',
			certDir: './'
		})
	],
	server: {
		https: false,
		allowedHosts:
			mode === 'development'
				? ['.ngrok-free.app']
				: []
	},
	test: {
		// include: ['src/**/*.{test,spec}.{js,ts}']
		include: ['src/**/*.{js,ts}'],
		projects: [
			{
				extends: true,
				plugins: [
					// The plugin will run tests for the stories defined in your Storybook config
					// See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
					storybookTest({
						configDir: path.join(dirname, '.storybook')
					})
				],
				test: {
					name: 'storybook',
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({}),
						instances: [
							{
								browser: 'chromium'
							}
						]
					},
					setupFiles: ['.storybook/vitest.setup.ts']
				}
			}
		]
	},
	define: {
		'import.meta.vitest': 'undefined'
	}
}));
