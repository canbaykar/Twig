import type { Config } from "tailwindcss";
import { designTokenPlugin } from "./src/lib/components/viewport/deriv/designToken";

const config: Config = {
	plugins: [designTokenPlugin],
};

export default config;
