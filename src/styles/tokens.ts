/**
 * Altium design tokens — single source of truth for light/dark CRM chrome.
 * Map into Vuetify themes in `src/app/plugins/vuetify.ts` and CSS vars in `main.scss`.
 * Do not hardcode these hex values in feature views.
 */

export const altiumTokens = {
  dark: {
    background: '#07101F',
    surface: '#0E1B35',
    surfaceElevated: '#152748',
    primary: '#3B82F6',
    onPrimary: '#FFFFFF',
    textPrimary: '#F4F7FC',
    textSecondary: '#9EB0C9',
    border: '#243B5A',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
  },
  light: {
    background: '#EEF3F9',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    primary: '#2563EB',
    onPrimary: '#FFFFFF',
    textPrimary: '#15233A',
    textSecondary: '#5F7088',
    border: '#D8E2EF',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB',
  },
} as const;

/** Shared radii (rem) — mirrored as `--altium-radius-*` in `main.scss`. */
export const altiumRadii = {
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.25rem',
  pill: '999px',
} as const;

export type AltiumThemeTokens = (typeof altiumTokens)['light'];
