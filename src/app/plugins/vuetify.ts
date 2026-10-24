import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

export const lightTheme = {
  dark: false,
  colors: {
    background: '#F5F7FA',
    surface: '#FFFFFF',
    primary: '#1565C0',
    secondary: '#455A64',
    success: '#2E7D32',
    warning: '#ED6C02',
    error: '#C62828',
    info: '#0277BD',
  },
};

export const darkTheme = {
  dark: true,
  colors: {
    background: '#0F1419',
    surface: '#1A222C',
    primary: '#90CAF9',
    secondary: '#90A4AE',
    success: '#81C784',
    warning: '#FFB74D',
    error: '#EF9A9A',
    info: '#4FC3F7',
  },
};

export function createVuetifyPlugin() {
  return createVuetify({
    theme: {
      defaultTheme: 'light',
      themes: {
        light: lightTheme,
        dark: darkTheme,
      },
    },
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: { mdi },
    },
    defaults: {
      VBtn: {
        rounded: 'md',
      },
      VCard: {
        rounded: 'lg',
        elevation: 1,
      },
    },
  });
}
