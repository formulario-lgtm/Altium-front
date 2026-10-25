import { describe, expect, it } from 'vitest';
import {
  resolveAuthNavigation,
  sanitizeRedirect,
  type GuardAuthState,
  type GuardTarget,
} from './guards';

function auth(
  overrides: Partial<GuardAuthState> & { permissions?: string[] } = {},
): GuardAuthState {
  const permissions = new Set(overrides.permissions ?? []);
  return {
    status: overrides.status ?? 'authenticated',
    mustChangePassword: overrides.mustChangePassword ?? false,
    hasAllPermissions: (codes) => codes.every((code) => permissions.has(code)),
  };
}

function target(name: string, meta: GuardTarget['meta'], fullPath = `/${name}`): GuardTarget {
  return { name, meta, fullPath };
}

describe('resolveAuthNavigation', () => {
  it('redirects unauthenticated users to login with redirect', () => {
    const result = resolveAuthNavigation(
      target('users', { requiresAuth: true }, '/users?q=ana'),
      auth({ status: 'unauthenticated' }),
    );
    expect(result).toEqual({ name: 'login', query: { redirect: '/users?q=ana' } });
  });

  it('allows guests on guest-only routes', () => {
    expect(
      resolveAuthNavigation(
        target('login', { guestOnly: true }),
        auth({ status: 'unauthenticated' }),
      ),
    ).toBe(true);
  });

  it('sends authenticated users away from guest-only routes', () => {
    expect(resolveAuthNavigation(target('login', { guestOnly: true }), auth())).toEqual({
      name: 'home',
    });
  });

  it('forces change-password when required', () => {
    expect(
      resolveAuthNavigation(
        target('users', { requiresAuth: true }),
        auth({ mustChangePassword: true }),
      ),
    ).toEqual({ name: 'account-change-password' });
    expect(
      resolveAuthNavigation(
        target('account-change-password', { requiresAuth: true }),
        auth({ mustChangePassword: true }),
      ),
    ).toBe(true);
    expect(
      resolveAuthNavigation(
        target('login', { guestOnly: true }),
        auth({ mustChangePassword: true }),
      ),
    ).toEqual({ name: 'account-change-password' });
  });

  it('enforces route permissions', () => {
    const route = target('audit', { requiresAuth: true, permissions: ['audit.read'] });
    expect(resolveAuthNavigation(route, auth())).toEqual({ name: 'forbidden' });
    expect(resolveAuthNavigation(route, auth({ permissions: ['audit.read'] }))).toBe(true);
  });

  it('allows sellers on sales routes and blocks admin routes', () => {
    const seller = auth({
      permissions: ['sales.read', 'sales.create', 'sales.update'],
    });
    expect(
      resolveAuthNavigation(
        target('sales', { requiresAuth: true, permissions: ['sales.read'] }),
        seller,
      ),
    ).toBe(true);
    expect(
      resolveAuthNavigation(
        target('users', { requiresAuth: true, permissions: ['users.read'] }),
        seller,
      ),
    ).toEqual({ name: 'forbidden' });
  });

  it('always allows public routes', () => {
    expect(
      resolveAuthNavigation(
        target('not-found', { public: true }),
        auth({ status: 'unauthenticated' }),
      ),
    ).toBe(true);
  });
});

describe('sanitizeRedirect', () => {
  it('accepts internal paths', () => {
    expect(sanitizeRedirect('/users?q=1')).toBe('/users?q=1');
    expect(sanitizeRedirect(['/teams'])).toBe('/teams');
  });

  it('rejects external, protocol-relative and login targets', () => {
    expect(sanitizeRedirect('https://evil.example')).toBeNull();
    expect(sanitizeRedirect('//evil.example')).toBeNull();
    expect(sanitizeRedirect('/login?redirect=/x')).toBeNull();
    expect(sanitizeRedirect(undefined)).toBeNull();
  });
});
