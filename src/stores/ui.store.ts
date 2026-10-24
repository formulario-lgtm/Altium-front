import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'altium.ui.theme';

function readStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'dark' ? 'dark' : 'light';
}

function persistTheme(mode: ThemeMode): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }
}

export const useUiStore = defineStore('ui', () => {
  const themeMode = ref<ThemeMode>(readStoredTheme());

  const isDark = computed(() => themeMode.value === 'dark');

  function setTheme(mode: ThemeMode): void {
    themeMode.value = mode;
    persistTheme(mode);
  }

  function toggleTheme(): void {
    setTheme(themeMode.value === 'dark' ? 'light' : 'dark');
  }

  return {
    themeMode,
    isDark,
    setTheme,
    toggleTheme,
  };
});
