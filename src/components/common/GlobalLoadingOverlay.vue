<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useGlobalLoadingState } from '@/services/http/loading';

const { isLoading } = useGlobalLoadingState();
const status = ref<HTMLElement | null>(null);
let previousFocus: HTMLElement | null = null;

watch(
  isLoading,
  async (busy) => {
    if (busy) {
      if (document.activeElement instanceof HTMLElement) previousFocus = document.activeElement;
      await nextTick();
      if (isLoading.value) status.value?.focus({ preventScroll: true });
    } else {
      await nextTick();
      if (!isLoading.value && previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true });
      if (!isLoading.value) previousFocus = null;
    }
  },
  { immediate: true },
);

function blockKeys(event: KeyboardEvent): void {
  if (!isLoading.value) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}
function focusStatus(): void {
  status.value?.focus({ preventScroll: true });
}
function containFocus(event: FocusEvent): void {
  if (isLoading.value && status.value && event.target !== status.value) {
    status.value.focus({ preventScroll: true });
  }
}
document.addEventListener('keydown', blockKeys, true);
document.addEventListener('focusin', containFocus, true);
onBeforeUnmount(() => {
  document.removeEventListener('keydown', blockKeys, true);
  document.removeEventListener('focusin', containFocus, true);
});
</script>

<template>
  <v-overlay
    v-if="isLoading"
    :model-value="true"
    :transition="false"
    class="altium-global-loading-overlay align-center justify-center"
    persistent
    no-click-animation
    scrim="background"
    :opacity="0.62"
    :z-index="10000"
    aria-busy="true"
    aria-live="polite"
    @pointerdown.capture.prevent="focusStatus"
  >
    <div
      ref="status"
      class="altium-global-loading"
      role="status"
      tabindex="-1"
      data-testid="global-loading"
    >
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
