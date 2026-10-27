import type { Page, Route } from '@playwright/test';
import type { components } from '../../../src/types/generated/api';
import { tryHandleHomeApi } from './home-api-mock';

type Schemas = components['schemas'];

export const VALID_PASSWORD = 'Altium2026Secure';
export const CSRF_TOKEN = 'csrf-e2e-token';

/** Mirrors backend ROLE_PERMISSION_MATRIX for SELLER (submit/export use update/read). */
export const SELLER_PERMISSIONS = [
  'sales.read',
  'sales.create',
  'sales.update',
  'notifications.read',
  'home.seller.read',
];

export const ADMINISTRATIVE_PERMISSIONS = [
  'teams.read',
  'sales.read',
  'sales.return',
  'sales.review',
  'sales.observe',
  'sales.follow_up',
  'administrative.dashboard.read',
  'notifications.read',
  'home.administrative.read',
];

export const SUPERVISOR_PERMISSIONS = [
  'teams.read',
  'sales.read',
  'notifications.read',
  'supervision.analytics.read',
  'supervision.goals.manage',
  'home.supervisor.read',
];

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
  'administrative.assignments.manage',
  'administrative.dashboard.read',
  'supervision.analytics.read',
  'supervision.goals.manage',
  'sales.review',
  'sales.observe',
  'sales.follow_up',
  'notifications.read',
  'home.admin.read',
  'home.seller.read',
  'home.administrative.read',
  'home.supervisor.read',
  ...SELLER_PERMISSIONS,
];

const INSURER_ID = 'a1b2c3d4-1111-4000-8000-000000000001';
const PLAN_ID = 'a1b2c3d4-2222-4000-8000-000000000002';
const SALE_ID = 'a1b2c3d4-3333-4000-8000-000000000003';
const TEAM_ID = 'a1b2c3d4-5555-4000-8000-000000000005';
const TEAM_ID_B = 'a1b2c3d4-5555-4000-8000-000000000006';
const SELLER_USER_ID = '6f9619ff-8b86-4d01-b42d-00c04fc964ff';
const ADMIN_USER_ID = 'a1b2c3d4-6666-4000-8000-000000000007';
const GOAL_ID = 'a1b2c3d4-7777-4000-8000-000000000008';

const SELLER: Schemas['SaleSellerSummaryDto'] = {
  id: '6f9619ff-8b86-4d01-b42d-00c04fc964ff',
  email: 'ana.perez@altium.example',
  firstName: 'Ana',
  lastName: 'Pérez',
};

export function buildSale(overrides: Partial<Schemas['SaleDto']> = {}): Schemas['SaleDto'] {
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
      cardNumber: '4242424242424242',
      cvv: '123',
      cardExpiryMonth: 12,
      cardExpiryYear: 2030,
      paymentProviderReference: null,
      cbuCapturePending: false,
    },
    administrativeAssignee: null,
    reviewStartedAt: null,
    lastReviewedAt: null,
    ...overrides,
  };
}

export function sessionResponse(
  permissions: string[],
  roleCode = 'SUPER_ADMIN',
): Schemas['AuthSessionResponseDto'] {
  return {
    csrfToken: CSRF_TOKEN,
    permissions,
    session: { id: 'b3c1a6c2-0000-4000-8000-000000000001', expiresAt: '2030-01-01T00:00:00.000Z' },
    user: {
      id: '6f9619ff-8b86-4d01-b42d-00c04fc964ff',
      username: 'aperez',
      email: 'ana.perez@altium.example',
      firstName: 'Ana',
      lastName: 'Pérez',
      mustChangePassword: false,
      role: { id: '0b7c1d1e-5a43-4d3e-9d3e-1d6a4f2f8b11', code: roleCode },
      status: 'ACTIVE',
    },
  };
}

export const USERS: Schemas['UserDto'][] = [
  {
    id: '6f9619ff-8b86-4d01-b42d-00c04fc964ff',
    firstName: 'Ana',
    lastName: 'Pérez',
    username: 'aperez',
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
    username: 'bgomez',
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
  roleCode?: string;
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
      if (body.username === 'aperez' && body.password === VALID_PASSWORD) {
        state.authenticated = true;
        await json(route, 200, sessionResponse(permissions, options.roleCode));
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
      await json(route, 200, sessionResponse(permissions, options.roleCode));
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

    if (pathname === '/api/v1/administrative/dashboard' && method === 'GET') {
      const body: Schemas['AdministrativeDashboardDto'] = {
        pendingReview: 2,
        inReview: 1,
        returned: 1,
        pendingFollowUps: 3,
        recentAttention: 4,
      };
      await json(route, 200, body);
      return;
    }

    if (await tryHandleHomeApi(pathname, method, route, json)) {
      return;
    }

    if (pathname === '/api/v1/teams' && method === 'GET') {
      const body: Schemas['TeamListResponseDto'] = {
        items: [
          {
            id: TEAM_ID,
            name: 'Equipo Norte',
            description: null,
            isActive: true,
            activeMemberCount: 3,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-10-01T00:00:00.000Z',
            supervisor: {
              id: SELLER_USER_ID,
              email: 'supervisor@altium.example',
              firstName: 'Sofía',
              lastName: 'Ruiz',
            },
          },
          {
            id: TEAM_ID_B,
            name: 'Equipo Sur',
            description: null,
            isActive: true,
            activeMemberCount: 2,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-10-01T00:00:00.000Z',
            supervisor: {
              id: SELLER_USER_ID,
              email: 'supervisor@altium.example',
              firstName: 'Sofía',
              lastName: 'Ruiz',
            },
          },
        ],
        pageInfo: { limit: 100, offset: 0, total: 2, hasNextPage: false },
      };
      await json(route, 200, body);
      return;
    }

    if (pathname === '/api/v1/supervision/dashboard' && method === 'GET') {
      const body: Schemas['SupervisionDashboardDto'] = {
        year: 2026,
        month: 10,
        teamId: null,
        timeZone: 'America/Argentina/Buenos_Aires',
        periodStart: '2026-10-01T03:00:00.000Z',
        periodEndExclusive: '2026-11-01T03:00:00.000Z',
        salesPresented: 12,
        returnsInPeriod: 2,
        returnedStock: 3,
        pendingReview: 4,
        inReview: 2,
        followUpsPending: 5,
        followUpsOverdue: 1,
        compliance: {
          hasGoal: true,
          targetIsZero: false,
          targetValue: 20,
          compliancePercent: 60,
        },
        returnRate: {
          asOf: '2026-10-25T12:00:00.000Z',
          presented: 12,
          returnedAmongPresented: 2,
          ratePercent: 16.67,
        },
        seriesPresented: [
          { date: '2026-10-01', count: 2 },
          { date: '2026-10-02', count: 3 },
        ],
        seriesReturns: [{ date: '2026-10-02', count: 1 }],
        alerts: [
          {
            code: 'OVERDUE_FOLLOW_UPS',
            severity: 'warning',
            message: 'Hay seguimientos vencidos en el alcance.',
          },
        ],
      };
      await json(route, 200, body);
      return;
    }

    if (pathname === '/api/v1/supervision/sellers' && method === 'GET') {
      const body: Schemas['SellerListResponseDto'] = {
        items: [
          {
            sellerId: SELLER_USER_ID,
            firstName: 'Ana',
            lastName: 'Pérez',
            teamId: TEAM_ID,
            teamName: 'Equipo Norte',
            salesPresented: 8,
            returnedStock: 1,
            lastActivityAt: '2026-10-20T12:00:00.000Z',
            compliance: {
              hasGoal: true,
              targetIsZero: false,
              targetValue: 10,
              compliancePercent: 80,
            },
            returnRate: {
              asOf: '2026-10-25T12:00:00.000Z',
              presented: 8,
              returnedAmongPresented: 1,
              ratePercent: 12.5,
            },
          },
          {
            sellerId: 'a1b2c3d4-8888-4000-8000-000000000009',
            firstName: 'Luis',
            lastName: 'Gómez',
            teamId: TEAM_ID_B,
            teamName: 'Equipo Sur',
            salesPresented: 2,
            returnedStock: 0,
            lastActivityAt: null,
            compliance: {
              hasGoal: false,
              targetIsZero: false,
              targetValue: null,
              compliancePercent: null,
            },
            returnRate: {
              asOf: '2026-10-25T12:00:00.000Z',
              presented: 2,
              returnedAmongPresented: 0,
              ratePercent: 0,
            },
          },
        ],
      };
      await json(route, 200, body);
      return;
    }

    if (pathname === `/api/v1/supervision/sellers/${SELLER_USER_ID}` && method === 'GET') {
      const body: Schemas['SellerDetailDto'] = {
        sellerId: SELLER_USER_ID,
        firstName: 'Ana',
        lastName: 'Pérez',
        year: 2026,
        month: 10,
        salesPresented: 8,
        pendingReview: 1,
        inReview: 1,
        returnedStock: 1,
        compliance: {
          hasGoal: true,
          targetIsZero: false,
          targetValue: 10,
          compliancePercent: 80,
        },
        returnRate: {
          asOf: '2026-10-25T12:00:00.000Z',
          presented: 8,
          returnedAmongPresented: 1,
          ratePercent: 12.5,
        },
        seriesPresented: [{ date: '2026-10-01', count: 2 }],
        statusDistribution: [
          { status: 'SUBMITTED', count: 1 },
          { status: 'RETURNED', count: 1 },
        ],
        planDistribution: [
          { healthInsurerName: 'Prevención Salud', healthPlanName: 'A1', count: 5 },
        ],
        recentSales: [
          {
            id: SALE_ID,
            saleNumber: 'V-000001',
            status: 'SUBMITTED',
            firstSubmittedAt: '2026-10-05T12:00:00.000Z',
          },
        ],
      };
      await json(route, 200, body);
      return;
    }

    if (pathname === '/api/v1/supervision/administratives' && method === 'GET') {
      const body: Schemas['AdministrativeListResponseDto'] = {
        items: [
          {
            administrativeUserId: ADMIN_USER_ID,
            firstName: 'María',
            lastName: 'López',
            teamId: TEAM_ID,
            teamName: 'Equipo Norte',
            reviewsStarted: 9,
            avgFirstReviewHours: 4.5,
            returnsPerformed: 2,
            followUpsPending: 3,
            followUpsOverdue: 1,
            currentWorkload: 4,
          },
        ],
      };
      await json(route, 200, body);
      return;
    }

    if (pathname === `/api/v1/supervision/administratives/${ADMIN_USER_ID}` && method === 'GET') {
      const body: Schemas['AdministrativeDetailDto'] = {
        administrativeUserId: ADMIN_USER_ID,
        firstName: 'María',
        lastName: 'López',
        year: 2026,
        month: 10,
        reviewsStarted: 9,
        observationsCreated: 6,
        followUpsCreated: 5,
        followUpsPending: 3,
        followUpsOverdue: 1,
        returnsPerformed: 2,
        avgFirstReviewHours: 4.5,
        currentWorkload: 4,
        activitySeries: [
          { date: '2026-10-01', reviewsStarted: 2, returns: 0 },
          { date: '2026-10-02', reviewsStarted: 1, returns: 1 },
        ],
      };
      await json(route, 200, body);
      return;
    }

    if (pathname === '/api/v1/supervision/goals' && method === 'GET') {
      const body: Schemas['MonthlyGoalListResponseDto'] = {
        items: [
          {
            id: GOAL_ID,
            goalType: 'SALES_SUBMITTED',
            targetType: 'USER',
            teamId: TEAM_ID,
            userId: SELLER_USER_ID,
            year: 2026,
            month: 10,
            targetValue: 10,
            unit: 'COUNT',
            createdAt: '2026-09-28T12:00:00.000Z',
            updatedAt: '2026-09-28T12:00:00.000Z',
            createdBy: SELLER_USER_ID,
            updatedBy: null,
          },
        ],
      };
      await json(route, 200, body);
      return;
    }

    if (pathname === '/api/v1/supervision/goals' && method === 'POST') {
      const payload = request.postDataJSON() as Schemas['CreateMonthlyGoalDto'];
      const body: Schemas['MonthlyGoalDto'] = {
        id: 'a1b2c3d4-9999-4000-8000-000000000010',
        goalType: payload.goalType,
        targetType: payload.targetType,
        teamId: (payload.teamId as string | null | undefined) ?? null,
        userId: (payload.userId as string | null | undefined) ?? null,
        year: payload.year,
        month: payload.month,
        targetValue: payload.targetValue,
        unit: payload.unit,
        createdAt: '2026-10-25T12:00:00.000Z',
        updatedAt: '2026-10-25T12:00:00.000Z',
        createdBy: SELLER_USER_ID,
        updatedBy: null,
      };
      await json(route, 201, body);
      return;
    }

    if (pathname === `/api/v1/supervision/goals/${GOAL_ID}/history` && method === 'GET') {
      const body: Schemas['MonthlyGoalHistoryResponseDto'] = {
        items: [
          {
            id: 'a1b2c3d4-aaaa-4000-8000-000000000011',
            previousValue: 8,
            newValue: 10,
            reason: 'Ajuste de meta',
            changedAt: '2026-09-28T12:00:00.000Z',
            changedBy: SELLER_USER_ID,
          },
        ],
      };
      await json(route, 200, body);
      return;
    }

    if (pathname === '/api/v1/notifications/unread-count' && method === 'GET') {
      await json(route, 200, { count: 0 });
      return;
    }

    if (pathname === '/api/v1/notifications' && method === 'GET') {
      const body: Schemas['UserNotificationListResponseDto'] = {
        items: [],
        pageInfo: { limit: 12, offset: 0, total: 0, hasNextPage: false },
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
            createdAt: sale.createdAt,
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

      if (rest === '/start-review' && method === 'POST') {
        await json(
          route,
          200,
          buildSale({
            id: saleId,
            status: 'IN_REVIEW',
            submittedAt: '2026-10-24T18:00:00.000Z',
            reviewStartedAt: '2026-10-25T12:00:00.000Z',
          }),
        );
        return;
      }

      if (rest === '/observations' && method === 'GET') {
        await json(route, 200, { items: [] });
        return;
      }

      if (rest === '/follow-ups' && method === 'GET') {
        await json(route, 200, { items: [] });
        return;
      }

      if (rest === '/documents' && method === 'GET') {
        const body: Schemas['SaleDocumentsResponseDto'] = {
          items: [],
          storageIntegrationPending: false,
          requiredCategories: [
            {
              documentType: 'PAYSLIP',
              label: 'Recibo de sueldo',
              saleMemberId: null,
              satisfied: false,
            },
            {
              documentType: 'DNI_FRONT',
              label: 'DNI frente · Titular',
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
