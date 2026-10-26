import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, getCsrfToken, setCsrfToken, type AuthSessionResponse } from '@/services/http';
import { fetchMe } from '@/services/http/auth.service';
import { useAuthStore } from './auth.store';

vi.mock('@/services/http/auth.service', () => ({ fetchMe: vi.fn() }));

const fetchMeMock = vi.mocked(fetchMe);

function sessionResponse(
  overrides: Partial<AuthSessionResponse['user']> = {},
): AuthSessionResponse {
  return {
    csrfToken: 'csrf-1',
    permissions: ['users.read', 'teams.read'],
    session: { id: 'session-1', expiresAt: '2026-10-25T10:00:00.000Z' },
    user: {
      id: 'user-1',
      email: 'ana@altium.example',
      firstName: 'Ana',
      lastName: 'Pérez',
      mustChangePassword: false,
      role: { id: 'role-1', code: 'SUPERVISOR' },
      status: 'ACTIVE',
      ...overrides,
    },
  };
}

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    fetchMeMock.mockReset();
    window.localStorage.clear();
  });

  it('starts idle and unauthenticated', () => {
    const store = useAuthStore();
    expect(store.status).toBe('idle');
    expect(store.isAuthenticated).toBe(false);
    expect(store.hasPermission('users.read')).toBe(false);
  });

  it('stores the session and exposes permission helpers', () => {
    const store = useAuthStore();
    store.setSession(sessionResponse());

    expect(store.status).toBe('authenticated');
    expect(store.displayName).toBe('Ana Pérez');
    expect(store.roleCode).toBe('SUPERVISOR');
    expect(getCsrfToken()).toBe('csrf-1');
    expect(store.hasPermission('users.read')).toBe(true);
    expect(store.hasPermission('users.create')).toBe(false);
    expect(store.hasAnyPermission(['users.create', 'teams.read'])).toBe(true);
    expect(store.hasAllPermissions(['users.read', 'users.create'])).toBe(false);
  });

  it('never persists session data', () => {
    const store = useAuthStore();
    store.setSession(sessionResponse());
    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
  });

  it('clearSession wipes user, permissions and CSRF', () => {
    const store = useAuthStore();
    setCsrfToken('csrf-1');
    store.setSession(sessionResponse());
    store.clearSession();

    expect(store.status).toBe('unauthenticated');
    expect(store.user).toBeNull();
    expect(store.permissions).toEqual([]);
    expect(getCsrfToken()).toBeNull();
  });

  it('ensureSession calls me() once and shares concurrent calls', async () => {
    fetchMeMock.mockResolvedValue(sessionResponse({ mustChangePassword: true }));
    const store = useAuthStore();

    await Promise.all([store.ensureSession(), store.ensureSession()]);
    await store.ensureSession();

    expect(fetchMeMock).toHaveBeenCalledOnce();
    expect(store.isAuthenticated).toBe(true);
    expect(store.mustChangePassword).toBe(true);
  });

  it('ensureSession marks unauthenticated on 401 without boot error', async () => {
    fetchMeMock.mockRejectedValue(
      new ApiError({ kind: 'unauthorized', code: 'UNAUTHORIZED', message: 'x', status: 401 }),
    );
    const store = useAuthStore();
    await store.ensureSession();

    expect(store.status).toBe('unauthenticated');
    expect(store.bootError).toBeNull();
  });

  it('ensureSession records a boot error when the API is unreachable', async () => {
    fetchMeMock.mockRejectedValue(
      new ApiError({ kind: 'network', code: 'NETWORK_ERROR', message: 'Sin conexión' }),
    );
    const store = useAuthStore();
    await store.ensureSession();

    expect(store.status).toBe('unauthenticated');
    expect(store.bootError).toBe('Sin conexión');
  });

  it('keeps a login session when a late boot me() 401 arrives', async () => {
    let rejectMe!: (error: unknown) => void;
    fetchMeMock.mockReturnValue(
      new Promise<AuthSessionResponse>((_, reject) => {
        rejectMe = reject;
      }),
    );
    const store = useAuthStore();
    const boot = store.ensureSession();

    store.setSession(sessionResponse());
    expect(store.status).toBe('authenticated');

    rejectMe(
      new ApiError({ kind: 'unauthorized', code: 'UNAUTHORIZED', message: 'x', status: 401 }),
    );
    await boot;

    expect(store.status).toBe('authenticated');
    expect(store.user?.email).toBe('ana@altium.example');
    expect(store.bootError).toBeNull();
  });
});
