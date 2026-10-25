import { defineStore } from 'pinia';
import { computed, ref, shallowRef } from 'vue';
import {
  clearCsrfToken,
  isApiError,
  type AuthSessionResponse,
  type AuthSessionSummary,
  type AuthUser,
} from '@/services/http';
import { fetchMe } from '@/services/http/auth.service';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

/**
 * Authenticated session (app state). The CSRF token lives in `services/http/csrf` memory;
 * nothing here is persisted. `GET /auth/me` is not cached in TanStack Query to avoid duplication.
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null);
  const permissions = ref<string[]>([]);
  const session = ref<AuthSessionSummary | null>(null);
  const status = ref<AuthStatus>('idle');
  /** Set when the boot `me()` failed for a reason other than 401 (e.g. API unreachable). */
  const bootError = ref<string | null>(null);
  const pendingSession = shallowRef<Promise<void> | null>(null);
  /**
   * Bumped by `setSession` / `clearSession` so an in-flight boot `me()` cannot overwrite
   * a login that completed while the probe was still pending (stuck on `/login`).
   */
  let sessionEpoch = 0;

  const permissionSet = computed(() => new Set(permissions.value));
  const isAuthenticated = computed(() => status.value === 'authenticated');
  const mustChangePassword = computed(() => user.value?.mustChangePassword === true);
  const roleCode = computed(() => user.value?.role.code ?? null);
  const displayName = computed(() =>
    user.value ? `${user.value.firstName} ${user.value.lastName}`.trim() : '',
  );

  function setSession(response: AuthSessionResponse): void {
    sessionEpoch += 1;
    user.value = response.user;
    permissions.value = [...response.permissions];
    session.value = response.session;
    status.value = 'authenticated';
    bootError.value = null;
  }

  function clearSession(): void {
    sessionEpoch += 1;
    user.value = null;
    permissions.value = [];
    session.value = null;
    status.value = 'unauthenticated';
    clearCsrfToken();
  }

  function hasPermission(code: string): boolean {
    return permissionSet.value.has(code);
  }

  function hasAnyPermission(codes: readonly string[]): boolean {
    return codes.some((code) => permissionSet.value.has(code));
  }

  function hasAllPermissions(codes: readonly string[]): boolean {
    return codes.every((code) => permissionSet.value.has(code));
  }

  async function loadSession(): Promise<void> {
    const epoch = sessionEpoch;
    status.value = 'loading';
    bootError.value = null;
    try {
      const me = await fetchMe();
      // Login (or logout) won the race — discard this probe result.
      if (epoch !== sessionEpoch) {
        return;
      }
      setSession(me);
    } catch (error) {
      if (epoch !== sessionEpoch) {
        return;
      }
      clearSession();
      if (!isApiError(error) || error.status !== 401) {
        bootError.value = isApiError(error) ? error.message : 'No se pudo verificar la sesión.';
      }
    } finally {
      // Never leave the UI stuck on `loading` if setSession/clearSession was skipped.
      if (epoch === sessionEpoch && status.value === 'loading') {
        status.value = 'unauthenticated';
      }
    }
  }

  /** Resolves the session once (boot). Concurrent callers share the same request. */
  function ensureSession(): Promise<void> {
    if (status.value === 'authenticated' || status.value === 'unauthenticated') {
      return Promise.resolve();
    }
    if (!pendingSession.value) {
      pendingSession.value = loadSession().finally(() => {
        pendingSession.value = null;
      });
    }
    return pendingSession.value;
  }

  return {
    user,
    permissions,
    session,
    status,
    bootError,
    isAuthenticated,
    mustChangePassword,
    roleCode,
    displayName,
    setSession,
    clearSession,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    ensureSession,
  };
});
