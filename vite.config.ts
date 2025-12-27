import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      clientPort: 5173,
    },
  },
  
  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_'],
});