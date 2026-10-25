import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useUiStore } from './ui.store';

describe('useUiStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.localStorage.clear();
  });

  it('defaults to dark when nothing is stored', () => {
    const store = useUiStore();
    expect(store.themeMode).toBe('dark');
    expect(store.isDark).toBe(true);
  });

  it('toggles between dark and light themes', () => {
    const store = useUiStore();
    expect(store.themeMode).toBe('dark');

    store.toggleTheme();
    expect(store.themeMode).toBe('light');
    expect(window.localStorage.getItem('altium.ui.theme')).toBe('light');

    store.toggleTheme();
    expect(store.themeMode).toBe('dark');
    expect(window.localStorage.getItem('altium.ui.theme')).toBe('dark');
  });

  it('respects an explicitly stored light preference', () => {
    window.localStorage.setItem('altium.ui.theme', 'light');
    const store = useUiStore();
    expect(store.themeMode).toBe('light');
  });
});
