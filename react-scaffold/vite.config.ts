import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    {
      enforce: 'pre',
      ...mdx({ providerImportSource: '@mdx-js/react' })
    },
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
    tailwindcss()
  ],
  server: {
    port: 5173,
    open: false
  },
  build: {
    outDir: 'dist',
    target: 'es2022'
  }
});
