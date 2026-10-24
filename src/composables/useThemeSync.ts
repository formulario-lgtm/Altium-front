import { watch } from 'vue';
import { useTheme } from 'vuetify';
import { useUiStore } from '@/stores/ui.store';

/** Keeps Vuetify theme in sync with the Pinia UI store. */
export function useThemeSync(): void {
  const theme = useTheme();
  const uiStore = useUiStore();

  watch(
    () => uiStore.themeMode,
    (mode) => {
      theme.change(mode);
    },
    { immediate: true },
  );
}
