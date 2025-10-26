import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: netlify(),

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      allowedHosts: ['dev.samkeno.com']
    }
  },

  integrations: [react()]
});