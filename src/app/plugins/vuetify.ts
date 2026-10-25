import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { en, es } from 'vuetify/locale';
import { altiumTokens } from '@/styles/tokens';

const light = altiumTokens.light;
const dark = altiumTokens.dark;

export const lightTheme = {
  dark: false,
  colors: {
    background: light.background,
    surface: light.surface,
    'surface-bright': light.surfaceElevated,
    'surface-variant': light.border,
    primary: light.primary,
    'on-primary': light.onPrimary,
    secondary: light.textSecondary,
    'on-secondary': light.surface,
    success: light.success,
    warning: light.warning,
    error: light.error,
    info: light.info,
    'on-background': light.textPrimary,
    'on-surface': light.textPrimary,
    'on-surface-variant': light.textSecondary,
  },
  variables: {
    'border-color': light.border,
    'border-opacity': 1,
    'high-emphasis-opacity': 0.92,
    'medium-emphasis-opacity': 0.72,
    'disabled-opacity': 0.42,
    'hover-opacity': 0.04,
    'focus-opacity': 0.08,
    'selected-opacity': 0.08,
    'activated-opacity': 0.1,
  },
};

export const darkTheme = {
  dark: true,
  colors: {
    background: dark.background,
    surface: dark.surface,
    'surface-bright': dark.surfaceElevated,
    'surface-variant': dark.border,
    primary: dark.primary,
    'on-primary': dark.onPrimary,
    secondary: dark.textSecondary,
    'on-secondary': dark.background,
    success: dark.success,
    warning: dark.warning,
    error: dark.error,
    info: dark.info,
    'on-background': dark.textPrimary,
    'on-surface': dark.textPrimary,
    'on-surface-variant': dark.textSecondary,
  },
  variables: {
    'border-color': dark.border,
    'border-opacity': 1,
    'high-emphasis-opacity': 0.95,
    'medium-emphasis-opacity': 0.72,
    'disabled-opacity': 0.4,
    'hover-opacity': 0.06,
    'focus-opacity': 0.1,
    'selected-opacity': 0.12,
    'activated-opacity': 0.12,
  },
};

export function createVuetifyPlugin() {
  return createVuetify({
    locale: {
      locale: 'es',
      fallback: 'en',
      messages: { es, en },
    },
    theme: {
      defaultTheme: 'dark',
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
        elevation: 0,
      },
      VCard: {
        rounded: 'lg',
        elevation: 0,
        border: true,
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
        hideDetails: 'auto',
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
        hideDetails: 'auto',
      },
      VTextarea: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
        hideDetails: 'auto',
      },
      VChip: {
        rounded: 'md',
        size: 'small',
      },
      VDialog: {
        scrim: true,
      },
      VDataTable: {
        hover: true,
      },
      VAlert: {
        rounded: 'lg',
        variant: 'tonal',
      },
    },
  });
}
