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

  const permissionSet = computed(() => new Set(permissions.value));
  const isAuthenticated = computed(() => status.value === 'authenticated');
  const mustChangePassword = computed(() => user.value?.mustChangePassword === true);
  const roleCode = computed(() => user.value?.role.code ?? null);
  const displayName = computed(() =>
    user.value ? `${user.value.firstName} ${user.value.lastName}`.trim() : '',
  );

  function setSession(response: AuthSessionResponse): void {
    user.value = response.user;
    permissions.value = [...response.permissions];
    session.value = response.session;
    status.value = 'authenticated';
    bootError.value = null;
  }

  function clearSession(): void {
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
    status.value = 'loading';
    bootError.value = null;
    try {
      setSession(await fetchMe());
    } catch (error) {
      clearSession();
      if (!isApiError(error) || error.status !== 401) {
        bootError.value = isApiError(error) ? error.message : 'No se pudo verificar la sesión.';
      }
    } finally {
      // Never leave the UI stuck on `loading` if setSession/clearSession was skipped.
      if (status.value === 'loading') {
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
