import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// @ts-expect-error process is a nodejs global
const mobile = !!/android|ios/.exec(process.env.TAURI_ENV_PLATFORM);
const host = process.env.TAURI_DEV_HOST;


export default defineConfig(async () => ({
	plugins: [sveltekit()],

	// 1. prevent vite from obscuring rust errors
	clearScreen: false,
	// 2. tauri expects a fixed port, fail if that port is not available
	server: {
		port: 5173,
		strictPort: true,
		host: mobile ? host : false,
		hmr: mobile 
			? { 
				protocol: "ws",
				host,
				port: 5173
			}
			: undefined,
		watch: {
			// 3. tell vite to ignore watching `src-tauri`
			ignored: ["**/src-tauri/**"],
		},
	}
}));
