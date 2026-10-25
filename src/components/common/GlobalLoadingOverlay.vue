<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import { useGlobalLoadingState } from '@/services/http/loading';

/** Avoid flash on sub-200ms responses while still covering slow calls quickly. */
const SHOW_DELAY_MS = 180;

const { isLoading } = useGlobalLoadingState();
const visible = ref(false);
let showTimer: ReturnType<typeof setTimeout> | null = null;

function clearShowTimer(): void {
  if (showTimer !== null) {
    clearTimeout(showTimer);
    showTimer = null;
  }
}

watch(
  isLoading,
  (busy) => {
    if (busy) {
      clearShowTimer();
      showTimer = setTimeout(() => {
        visible.value = true;
        showTimer = null;
      }, SHOW_DELAY_MS);
      return;
    }
    clearShowTimer();
    visible.value = false;
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  clearShowTimer();
});
</script>

<template>
  <v-overlay
    :model-value="visible"
    class="altium-global-loading-overlay align-center justify-center"
    persistent
    no-click-animation
    scrim="background"
    :opacity="0.62"
    :z-index="10000"
    aria-busy="true"
    aria-live="polite"
  >
    <div class="altium-global-loading" role="status" data-testid="global-loading">
      <v-progress-circular indeterminate color="primary" size="48" width="3" />
      <p class="altium-global-loading__label">Cargando…</p>
    </div>
  </v-overlay>
</template>

<style scoped lang="scss">
.altium-global-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  min-width: 9.5rem;
  padding: 1.35rem 1.6rem;
  border-radius: var(--altium-radius-xl, 1.25rem);
  background: var(--altium-glass);
  border: 1px solid var(--altium-glass-border);
  box-shadow: var(--altium-card-shadow);
  backdrop-filter: blur(18px) saturate(1.15);
  -webkit-backdrop-filter: blur(18px) saturate(1.15);
}

.altium-global-loading__label {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: rgb(var(--v-theme-on-surface));
}
</style>
