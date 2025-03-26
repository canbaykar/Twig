import type { Config } from "tailwindcss";
import { DTPlugin } from './src/DT';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
	plugins: [DTPlugin, tailwindcssAnimate],
};

export default config;
