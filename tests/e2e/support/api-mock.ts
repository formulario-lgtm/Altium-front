import type { Page, Route } from '@playwright/test';
import type { components } from '../../../src/types/generated/api';

type Schemas = components['schemas'];

export const VALID_PASSWORD = 'Altium2026Secure';
export const CSRF_TOKEN = 'csrf-e2e-token';

/** Mirrors backend ROLE_PERMISSION_MATRIX for SELLER (submit/export use update/read). */
export const SELLER_PERMISSIONS = ['sales.read', 'sales.create', 'sales.update'];

export const ADMINISTRATIVE_PERMISSIONS = ['teams.read', 'sales.read', 'sales.return'];

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
  ...SELLER_PERMISSIONS,
];

const INSURER_ID = 'a1b2c3d4-1111-4000-8000-000000000001';
const PLAN_ID = 'a1b2c3d4-2222-4000-8000-000000000002';
const SALE_ID = 'a1b2c3d4-3333-4000-8000-000000000003';

const SELLER: Schemas['SaleSellerSummaryDto'] = {
  id: '6f9619ff-8b86-4d01-b42d-00c04fc964ff',
  email: 'ana.perez@altium.example',
  firstName: 'Ana',
  lastName: 'Pérez',
};

function buildSale(overrides: Partial<Schemas['SaleDto']> = {}): Schemas['SaleDto'] {
  return {
    id: SALE_ID,
    saleNumber: 'V-000001',
    version: 1,
    status: 'DRAFT',
    customerType: 'DEREGULATED',
    observations: null,
    createdAt: '2026-10-20T10:00:00.000Z',
    updatedAt: '2026-10-24T12:00:00.000Z',
    submittedAt: null,
    healthInsurer: { id: INSURER_ID, code: 'PREVENCION_SALUD', name: 'Prevención Salud' },
    healthPlan: { id: PLAN_ID, code: 'A1', name: 'Plan A1' },
    seller: SELLER,
    members: [
      {
        id: 'a1b2c3d4-4444-4000-8000-000000000004',
        memberType: 'HOLDER',
        cuil: '27301234567',
        firstName: 'Ana',
        lastName: 'Pérez',
        sex: 'FEMALE',
        birthDate: '1990-05-10',
        age: 36,
        nationality: 'Argentino',
        maritalStatus: 'SINGLE',
        weightKg: 60,
        heightCm: 165,
        lastMenstrualPeriod: null,
        hasPreexistingConditions: false,
        preexistingConditionsDetails: null,
        displayOrder: 0,
      },
    ],
    contact: {
      areaCode: '11',
      phone: '55554444',
      email: 'ana.perez@altium.example',
      address: 'Calle Falsa 123',
      postalCode: '1000',
      province: 'CABA',
    },
    employment: {
      currentInsurance: 'OSDE',
      grossSalary: 500000,
      employers: [
        {
          id: 'a1b2c3d4-5555-4000-8000-000000000005',
          employerCuit: '30712345678',
          displayOrder: 0,
        },
      ],
    },
    taxInfo: null,
    billing: {
      paymentMethod: 'CARD',
      holderIsPayer: true,
      paymentMedium: 'Visa',
      payerIdentifier: null,
      payerEmail: null,
      payerPhone: null,
      cardBrand: 'Visa',
      cardLastFour: '4242',
      cardExpiryMonth: 12,
      cardExpiryYear: 2030,
      paymentProviderReference: null,
      cbuCapturePending: false,
    },
    ...overrides,
  };
}

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
    role: { id: '1c8d2e2f-6b54-4e4f-ae4f-2e7b5a3a9c22', code: 'SELLER', name: 'Vendedor' },
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
    name: 'Super administrador',
    description: null,
    isSystem: true,
    permissionCodes: SUPER_ADMIN_PERMISSIONS,
  },
  {
    id: '1c8d2e2f-6b54-4e4f-ae4f-2e7b5a3a9c22',
    code: 'SELLER',
    name: 'Vendedor',
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

    if (pathname === '/api/v1/health-insurers' && method === 'GET') {
      const body: Schemas['HealthInsurerListResponseDto'] = {
        items: [{ id: INSURER_ID, code: 'PREVENCION_SALUD', name: 'Prevención Salud' }],
      };
      await json(route, 200, body);
      return;
    }

    if (pathname === `/api/v1/health-insurers/${INSURER_ID}/plans` && method === 'GET') {
      const body: Schemas['HealthPlanListResponseDto'] = {
        items: [
          {
            id: PLAN_ID,
            healthInsurerId: INSURER_ID,
            code: 'A1',
            name: 'Plan A1',
            displayOrder: 1,
          },
        ],
      };
      await json(route, 200, body);
      return;
    }

    if (pathname === '/api/v1/sales' && method === 'GET') {
      const sale = buildSale();
      const body: Schemas['SaleListResponseDto'] = {
        items: [
          {
            id: sale.id,
            saleNumber: sale.saleNumber,
            status: sale.status,
            customerType: sale.customerType,
            healthInsurerName: sale.healthInsurer.name,
            healthPlanName: sale.healthPlan?.name ?? null,
            holderFirstName: sale.members[0]?.firstName ?? null,
            holderLastName: sale.members[0]?.lastName ?? null,
            holderCuilMasked: '27*******67',
            seller: sale.seller,
            submittedAt: sale.submittedAt,
            updatedAt: sale.updatedAt,
          },
        ],
        pageInfo: { limit: 25, offset: 0, total: 1, hasNextPage: false },
      };
      await json(route, 200, body);
      return;
    }

    if (pathname === '/api/v1/sales' && method === 'POST') {
      await json(route, 201, buildSale({ version: 1, status: 'DRAFT' }));
      return;
    }

    const saleMatch = /^\/api\/v1\/sales\/([^/]+)(.*)$/.exec(pathname);
    if (saleMatch) {
      const saleId = saleMatch[1]!;
      const rest = saleMatch[2] ?? '';

      if (rest === '' && method === 'GET') {
        await json(route, 200, buildSale({ id: saleId }));
        return;
      }

      if (rest === '' && method === 'PATCH') {
        const body = request.postDataJSON() as Schemas['UpdateSaleDto'];
        if (body.version !== 1 && body.version !== undefined) {
          await json(route, 409, problem(409, 'VERSION_CONFLICT', 'Version conflict'));
          return;
        }
        await json(
          route,
          200,
          buildSale({
            id: saleId,
            version: (body.version ?? 1) + 1,
            customerType: body.customerType ?? 'DEREGULATED',
            observations: body.observations ?? null,
          }),
        );
        return;
      }

      if (rest === '/submit' && method === 'POST') {
        await json(
          route,
          200,
          buildSale({
            id: saleId,
            status: 'SUBMITTED',
            submittedAt: '2026-10-24T18:00:00.000Z',
            documentationPending: true,
          }),
        );
        return;
      }

      if (rest === '/return' && method === 'POST') {
        const body = request.postDataJSON() as Schemas['ReturnSaleDto'];
        await json(
          route,
          200,
          buildSale({
            id: saleId,
            status: 'RETURNED',
            submittedAt: '2026-10-24T18:00:00.000Z',
            observations: body.reason,
          }),
        );
        return;
      }

      if (rest === '/documents' && method === 'GET') {
        const body: Schemas['SaleDocumentsResponseDto'] = {
          items: [],
          storageIntegrationPending: true,
          requiredCategories: [
            {
              documentType: 'PAYSLIP',
              label: 'Recibo de sueldo',
              saleMemberId: null,
              satisfied: false,
            },
            {
              documentType: 'DNI_FRONT',
              label: 'DNI frente',
              saleMemberId: null,
              satisfied: false,
            },
          ],
        };
        await json(route, 200, body);
        return;
      }

      if (rest === '/history' && method === 'GET') {
        const body: Schemas['SaleStatusHistoryResponseDto'] = { items: [] };
        await json(route, 200, body);
        return;
      }

      if (rest === '/export' && method === 'GET') {
        const origin = request.headers()['origin'] ?? '*';
        await route.fulfill({
          status: 200,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          headers: {
            'access-control-allow-origin': origin,
            'access-control-allow-credentials': 'true',
            'content-disposition': 'attachment; filename="V-000001.xlsx"',
          },
          body: 'PK mock-xlsx',
        });
        return;
      }
    }

    await json(route, 404, problem(404, 'NOT_FOUND', 'Not Found'));
  });

  return state;
}
