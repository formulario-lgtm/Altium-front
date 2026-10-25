import { computed, ref } from 'vue';

/**
 * Process-wide counter of in-flight API work that should block the UI.
 * Kept outside Pinia so the openapi-fetch middleware can use it without cycles.
 */
const pendingCount = ref(0);

/** Quiet GETs that must never freeze the shell (background polls, health). */
const SILENT_PATH_SUFFIXES = ['/api/v1/notifications/unread-count', '/health'] as const;

export function isSilentLoadingUrl(url: string): boolean {
  try {
    const { pathname } = new URL(url, 'http://local.invalid');
    return SILENT_PATH_SUFFIXES.some((suffix) => pathname.endsWith(suffix));
  } catch {
    return SILENT_PATH_SUFFIXES.some((suffix) => url.includes(suffix));
  }
}

export function beginGlobalLoading(): void {
  pendingCount.value += 1;
}

export function endGlobalLoading(): void {
  pendingCount.value = Math.max(0, pendingCount.value - 1);
}

/** Test helper — resets leaked counters between cases. */
export function resetGlobalLoading(): void {
  pendingCount.value = 0;
}

export function useGlobalLoadingState() {
  return {
    pendingCount: computed(() => pendingCount.value),
    isLoading: computed(() => pendingCount.value > 0),
  };
}
