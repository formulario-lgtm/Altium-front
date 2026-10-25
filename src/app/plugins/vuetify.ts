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
    /** Muted surface (not border) — Vuetify may use this for field chrome; keep contrast. */
    'surface-variant': '#E4EBF5',
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
    'high-emphasis-opacity': 0.96,
    'medium-emphasis-opacity': 0.88,
    'disabled-opacity': 0.42,
    'hover-opacity': 0.04,
    'focus-opacity': 0.08,
    'selected-opacity': 0.1,
    'activated-opacity': 0.12,
    'shadow-key-umbra-opacity': 0.06,
    'shadow-key-penumbra-opacity': 0.04,
    'shadow-key-ambient-opacity': 0.03,
  },
};

export const darkTheme = {
  dark: true,
  colors: {
    background: dark.background,
    surface: dark.surface,
    'surface-bright': dark.surfaceElevated,
    /** Muted surface (not border) — keeps labels/placeholders readable on dark cards. */
    'surface-variant': '#152748',
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
    'border-opacity': 0.9,
    'high-emphasis-opacity': 0.98,
    'medium-emphasis-opacity': 0.9,
    'disabled-opacity': 0.4,
    'hover-opacity': 0.08,
    'focus-opacity': 0.12,
    'selected-opacity': 0.16,
    'activated-opacity': 0.18,
    'shadow-key-umbra-opacity': 0.35,
    'shadow-key-penumbra-opacity': 0.22,
    'shadow-key-ambient-opacity': 0.18,
  },
};

/**
 * Vuetify defaults = Altium design-system variants.
 * Feature screens should rely on these (color="primary", outlined fields, bordered cards)
 * instead of local one-off styling.
 */
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
        rounded: 'lg',
        elevation: 0,
        class: 'text-none',
      },
      VCard: {
        rounded: 'xl',
        elevation: 0,
        border: true,
        class: 'altium-surface-card',
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
        hideDetails: 'auto',
        rounded: 'lg',
        persistentPlaceholder: false,
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
        hideDetails: 'auto',
        rounded: 'lg',
        menuIcon: 'mdi-chevron-down',
      },
      VAutocomplete: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
        hideDetails: 'auto',
        rounded: 'lg',
        menuIcon: 'mdi-chevron-down',
      },
      VCombobox: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
        hideDetails: 'auto',
        rounded: 'lg',
      },
      VTextarea: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
        hideDetails: 'auto',
        rounded: 'lg',
        autoGrow: false,
        rows: 3,
      },
      VFileInput: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
        hideDetails: 'auto',
        rounded: 'lg',
      },
      VCheckbox: {
        color: 'primary',
        density: 'comfortable',
        hideDetails: 'auto',
      },
      VRadioGroup: {
        color: 'primary',
        density: 'comfortable',
        hideDetails: 'auto',
      },
      VRadio: {
        color: 'primary',
        density: 'comfortable',
        hideDetails: 'auto',
      },
      VSwitch: {
        color: 'primary',
        density: 'comfortable',
        hideDetails: 'auto',
        inset: true,
      },
      VChip: {
        rounded: 'pill',
        size: 'small',
      },
      VDialog: {
        scrim: true,
        retainFocus: true,
      },
      VNavigationDrawer: {
        elevation: 0,
        border: true,
        color: 'surface',
      },
      VAppBar: {
        elevation: 0,
        border: true,
        color: 'surface',
        flat: true,
      },
      VDataTable: {
        hover: true,
      },
      VDataTableServer: {
        hover: true,
      },
      VAlert: {
        rounded: 'lg',
        variant: 'tonal',
      },
      VList: {
        rounded: 'lg',
        color: 'primary',
      },
      VListItem: {
        rounded: 'lg',
      },
      VMenu: {
        offset: 8,
      },
      VSnackbar: {
        rounded: 'lg',
      },
    },
  });
}
