import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Use vitePreprocess to support TypeScript and PostCSS/Tailwind in <style> blocks
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto supports Vercel, Netlify, Cloudflare, etc.
    adapter: adapter(),

    // Professional Tip: Alias common directories if needed
    alias: {
      $components: 'src/lib/components',
      $assets: 'src/lib/client/assets',
    },
  },

  compilerOptions: {
    // In Svelte 5, runes are the default.
    // This explicit setting is usually only needed for migration
    // or very specific library exclusions.
    runes: true,
  },
};

export default config;
