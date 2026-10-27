import { computed, ref } from 'vue';

/**
 * Process-wide counter of in-flight API work that should block the UI.
 * Kept outside Pinia so the openapi-fetch middleware can use it without cycles.
 */
const pendingCount = ref(0);
const requestReleases = new Set<() => void>();

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

/** Owns one UI task; calling the release function twice cannot decrement other work. */
export function beginGlobalTask(): () => void {
  beginGlobalLoading();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    endGlobalLoading();
  };
}

/** HTTP work belongs to the current session and must not block the next login after expiry. */
export function beginRequestLoading(): () => void {
  const finish = beginGlobalTask();
  const release = () => {
    finish();
    requestReleases.delete(release);
  };
  requestReleases.add(release);
  return release;
}

export function clearRequestLoading(): void {
  for (const release of requestReleases) release();
}

/** Test helper — resets leaked counters between cases. */
export function resetGlobalLoading(): void {
  clearRequestLoading();
  pendingCount.value = 0;
}

export function useGlobalLoadingState() {
  return {
    pendingCount: computed(() => pendingCount.value),
    isLoading: computed(() => pendingCount.value > 0),
  };
}
