import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useUiStore } from './ui.store';

describe('useUiStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.localStorage.clear();
  });

  it('toggles between light and dark themes', () => {
    const store = useUiStore();
    expect(store.themeMode).toBe('light');

    store.toggleTheme();
    expect(store.themeMode).toBe('dark');
    expect(window.localStorage.getItem('altium.ui.theme')).toBe('dark');
  });
});
