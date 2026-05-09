import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

// Para GitHub Pages con repo "FlowStock" usa base: '/FlowStock/'.
// Si despliegas en dominio propio como flowstock.nathanielvergara.com, usa base: '/'.
export default defineConfig({
  base: '/',
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.svg', 'icons/icon-512.svg'],
      manifest: {
        name: 'FlowStock',
        short_name: 'FlowStock',
        description: 'Contagem visual de estoque',
        theme_color: '#111827',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
          { src: 'icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  build: {
    target: 'es2020',
    sourcemap: false,
  },
});
