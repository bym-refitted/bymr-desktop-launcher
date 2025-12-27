import adapter from "@sveltejs/adapter-static"; // This was changed from adapter-auto
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),
    alias: {
      $lib: "./src/lib",
      "$lib/*": "./src/lib/*"
    }
  },
  vitePlugin: {
    inspector: true
  }
};

export default config;
