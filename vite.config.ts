import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import vuetify from 'vite-plugin-vuetify';

/**
 * Pre-bundle Vuetify components used across lazy routes.
 * Without this, the first visit to a screen triggers Vite dep re-optimization
 * and a full page reload (blank flash / bounce back to `/`).
 */
const vuetifyOptimizeDeps = [
  'vuetify/components/VAlert',
  'vuetify/components/VApp',
  'vuetify/components/VAppBar',
  'vuetify/components/VAvatar',
  'vuetify/components/VBtn',
  'vuetify/components/VCard',
  'vuetify/components/VCheckbox',
  'vuetify/components/VChip',
  'vuetify/components/VDataTable',
  'vuetify/components/VDialog',
  'vuetify/components/VDivider',
  'vuetify/components/VForm',
  'vuetify/components/VGrid',
  'vuetify/components/VIcon',
  'vuetify/components/VList',
  'vuetify/components/VMain',
  'vuetify/components/VMenu',
  'vuetify/components/VNavigationDrawer',
  'vuetify/components/VOverlay',
  'vuetify/components/VProgressLinear',
  'vuetify/components/VSelect',
  'vuetify/components/VSnackbar',
  'vuetify/components/VSwitch',
  'vuetify/components/VTextField',
  'vuetify/components/VTextarea',
];

export default defineConfig({
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
  preview: {
    port: 4173,
    host: true,
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
