import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import vuetify from 'vite-plugin-vuetify';
import { vuetifyOptimizeDeps } from './scripts/vuetify-optimize-deps';
import { createSharingConfig } from './scripts/sharing-config';

/**
 * Pre-bundle Vuetify components used across lazy routes.
 * Source of truth: `scripts/vuetify-optimize-deps.ts` (enforced by `pnpm check:vuetify-deps`).
 * Without this, the first visit to a screen triggers Vite dep re-optimization
 * and a full page reload (blank flash / bounce back to `/`).
 */
export default defineConfig(({ mode }) => ({
  ...createSharingConfig(mode),
  plugins: [
    vue(),
    vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: [...vuetifyOptimizeDeps, 'vuetify'],
  },
  server: {
    port: 5173,
    host: true,
  },
}));
