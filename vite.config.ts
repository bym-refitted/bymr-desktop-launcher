import tailwindcss from "@tailwindcss/vite";
import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      compilerOptions: {
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
      },
      adapter: adapter({ fallback: "index.html" }),
    }),
  ],
  clearScreen: false,
  server: { port: 5173, strictPort: true, warmup: { clientFiles: ["./src/routes/**/+page.svelte"] } },
});
