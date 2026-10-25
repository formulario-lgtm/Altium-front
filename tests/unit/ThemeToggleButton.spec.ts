import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import ThemeToggleButton from '@/components/layout/ThemeToggleButton.vue';
import { useUiStore } from '@/stores/ui.store';

describe('ThemeToggleButton', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.localStorage.clear();
  });

  it('toggles theme when clicked', async () => {
    const wrapper = mount(ThemeToggleButton);
    const store = useUiStore();

    expect(store.themeMode).toBe('dark');
    await wrapper.get('button').trigger('click');
    expect(store.themeMode).toBe('light');
  });
});
