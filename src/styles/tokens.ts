/**
 * Altium design tokens — provisional brand palette (Stage 5).
 * Swap values here (and in Vuetify themes) without hunting through components.
 */

export const altiumTokens = {
  dark: {
    background: '#101D32',
    surface: '#192B45',
    surfaceElevated: '#243B5A',
    primary: '#4777AC',
    onPrimary: '#F2F6FC',
    textPrimary: '#F2F6FC',
    textSecondary: '#AABCD1',
    border: '#2A3F5C',
    success: '#3D9A6A',
    warning: '#C9A227',
    error: '#D46565',
    info: '#5B8FC7',
  },
  light: {
    background: '#F5F6F8',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    primary: '#243B5A',
    onPrimary: '#F2F6FC',
    textPrimary: '#192B45',
    textSecondary: '#657182',
    border: '#E5EAF0',
    success: '#2F7D57',
    warning: '#A67C00',
    error: '#B54040',
    info: '#3A6EA5',
  },
} as const;

export type AltiumThemeTokens = (typeof altiumTokens)['light'];
