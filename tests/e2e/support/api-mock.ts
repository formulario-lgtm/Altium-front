import type { Page, Route } from '@playwright/test';
import type { components } from '../../../src/types/generated/api';

type Schemas = components['schemas'];

export const VALID_PASSWORD = 'Altium2026Secure';
export const CSRF_TOKEN = 'csrf-e2e-token';

export const SUPER_ADMIN_PERMISSIONS = [
  'users.read',
  'users.create',
  'users.update',
  'users.update_status',
  'users.reset_password',
  'roles.read',
  'roles.update_permissions',
  'permissions.read',
  'teams.read',
  'teams.create',
  'teams.update',
  'teams.manage_members',
  'audit.read',
  'auth.sessions_read',
  'auth.sessions_revoke',
];

export function sessionResponse(permissions: string[]): Schemas['AuthSessionResponseDto'] {
  return {
    csrfToken: CSRF_TOKEN,
    permissions,
    session: { id: 'b3c1a6c2-0000-4000-8000-000000000001', expiresAt: '2030-01-01T00:00:00.000Z' },
    user: {
      id: '6f9619ff-8b86-4d01-b42d-00c04fc964ff',
      email: 'ana.perez@altium.example',
      firstName: 'Ana',
      lastName: 'Pérez',
      mustChangePassword: false,
      role: { id: '0b7c1d1e-5a43-4d3e-9d3e-1d6a4f2f8b11', code: 'SUPER_ADMIN' },
      status: 'ACTIVE',
    },
  };
}

export const USERS: Schemas['UserDto'][] = [
  {
    id: '6f9619ff-8b86-4d01-b42d-00c04fc964ff',
    firstName: 'Ana',
    lastName: 'Pérez',
    email: 'ana.perez@altium.example',
    status: 'ACTIVE',
    mustChangePassword: false,
    role: { id: '0b7c1d1e-5a43-4d3e-9d3e-1d6a4f2f8b11', code: 'SUPER_ADMIN', name: 'Super admin' },
    lastLoginAt: '2026-10-24T15:00:00.000Z',
    passwordChangedAt: '2026-10-20T12:00:00.000Z',
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-24T15:00:00.000Z',
  },
  {
    id: '3d2f6c0a-7b41-4a0e-8d52-6d0b2c9f1a77',
    firstName: 'Bruno',
    lastName: 'Gómez',
    email: 'bruno.gomez@altium.example',
    status: 'PENDING',
    mustChangePassword: false,
    role: { id: '1c8d2e2f-6b54-4e4f-ae4f-2e7b5a3a9c22', code: 'SELLER', name: 'Seller' },
    lastLoginAt: null,
    passwordChangedAt: null,
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
  },
];

const ROLES: Schemas['RoleDto'][] = [
  {
    id: '0b7c1d1e-5a43-4d3e-9d3e-1d6a4f2f8b11',
    code: 'SUPER_ADMIN',
    name: 'Super admin',
    description: null,
    isSystem: true,
    permissionCodes: SUPER_ADMIN_PERMISSIONS,
  },
  {
    id: '1c8d2e2f-6b54-4e4f-ae4f-2e7b5a3a9c22',
    code: 'SELLER',
    name: 'Seller',
    description: null,
    isSystem: true,
    permissionCodes: [],
  },
];

function problem(status: number, code: string, title: string): Schemas['ProblemDetailsDto'] {
  return { type: 'about:blank', title, status, detail: title, code, requestId: 'req_e2e' };
}

export type MockApiOptions = {
  authenticated?: boolean;
  permissions?: string[];
};

export type MockApiState = {
  authenticated: boolean;
  /** CSRF header received on each mutating call, in order. */
  csrfHeaders: Array<string | null>;
};

/** Intercepts every Altium API call — no live backend required. */
export async function mockApi(page: Page, options: MockApiOptions = {}): Promise<MockApiState> {
  const permissions = options.permissions ?? SUPER_ADMIN_PERMISSIONS;
  const state: MockApiState = { authenticated: options.authenticated ?? false, csrfHeaders: [] };

  async function json(route: Route, status: number, body: unknown): Promise<void> {
    const origin = route.request().headers()['origin'] ?? '*';
    await route.fulfill({
      status,
      contentType: status >= 400 ? 'application/problem+json' : 'application/json',
      headers: {
        'access-control-allow-origin': origin,
        'access-control-allow-credentials': 'true',
      },
      body: body === undefined ? '' : JSON.stringify(body),
    });
  }

  await page.route(/\/(api\/v1\/.*|health)(\?.*)?$/, async (route) => {
    const request = route.request();
    const method = request.method();
    const { pathname } = new URL(request.url());

    if (method === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': request.headers()['origin'] ?? '*',
          'access-control-allow-credentials': 'true',
          'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
          'access-control-allow-headers': 'content-type,x-csrf-token,x-request-id,accept',
        },
      });
      return;
    }

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      state.csrfHeaders.push(request.headers()['x-csrf-token'] ?? null);
    }

    if (pathname === '/health') {
      await json(route, 200, { status: 'ok' });
      return;
    }

    if (pathname === '/api/v1/auth/login' && method === 'POST') {
      const body = request.postDataJSON() as Schemas['LoginDto'];
      if (body.password === VALID_PASSWORD) {
        state.authenticated = true;
        await json(route, 200, sessionResponse(permissions));
      } else {
        await json(route, 401, problem(401, 'AUTH_INVALID_CREDENTIALS', 'Invalid credentials'));
      }
      return;
    }

    if (!state.authenticated) {
      await json(route, 401, problem(401, 'UNAUTHORIZED', 'Unauthorized'));
      return;
    }

    if (pathname === '/api/v1/auth/me') {
      await json(route, 200, sessionResponse(permissions));
      return;
    }

    if (pathname === '/api/v1/auth/logout' && method === 'POST') {
      state.authenticated = false;
      await route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': request.headers()['origin'] ?? '*',
          'access-control-allow-credentials': 'true',
        },
      });
      return;
    }

    if (pathname === '/api/v1/users' && method === 'GET') {
      const body: Schemas['UserListResponseDto'] = {
        items: USERS,
        pageInfo: { limit: 25, offset: 0, total: USERS.length, hasNextPage: false },
      };
      await json(route, 200, body);
      return;
    }

    if (pathname === '/api/v1/roles' && method === 'GET') {
      const body: Schemas['RoleListResponseDto'] = { items: ROLES };
      await json(route, 200, body);
      return;
    }

    await json(route, 404, problem(404, 'NOT_FOUND', 'Not Found'));
  });

  return state;
}
