import type { Route } from '@playwright/test';
import type { components } from '../../../src/types/generated/api';

type Schemas = components['schemas'];

const SALE_ID = 'a1b2c3d4-3333-4000-8000-000000000003';
const TEAM_ID = 'a1b2c3d4-5555-4000-8000-000000000005';
const SELLER_USER_ID = '6f9619ff-8b86-4d01-b42d-00c04fc964ff';

const PERIOD: Schemas['HomePeriodMetaDto'] = {
  year: 2026,
  month: 10,
  timeZone: 'America/Argentina/Buenos_Aires',
  periodStart: '2026-10-01T03:00:00.000Z',
  periodEndExclusive: '2026-11-01T03:00:00.000Z',
};

export function sellerHomeFixture(): Schemas['SellerHomeResponseDto'] {
  return {
    period: PERIOD,
    kpis: [
      {
        code: 'SALES_PRESENTED',
        label: 'Ventas presentadas (mes)',
        value: 4,
        unit: 'COUNT',
        availability: 'AVAILABLE',
        delta: 1,
        previousValue: 3,
      },
      {
        code: 'COMPLIANCE',
        label: 'Cumplimiento',
        value: 40,
        unit: 'PERCENT',
        availability: 'AVAILABLE',
      },
      {
        code: 'RETURNED_STOCK',
        label: 'Devueltas por corregir',
        value: 1,
        unit: 'COUNT',
        availability: 'AVAILABLE',
      },
      {
        code: 'DRAFTS',
        label: 'Borradores pendientes',
        value: 2,
        unit: 'COUNT',
        availability: 'AVAILABLE',
      },
    ],
    compliance: {
      hasGoal: true,
      targetIsZero: false,
      targetValue: 10,
      compliancePercent: 40,
    },
    remainingToGoal: 6,
    presentedToday: 1,
    dailyPresented: [
      { key: '2026-10-01', count: 1 },
      { key: '2026-10-02', count: 3 },
    ],
    recentSales: [
      {
        id: SALE_ID,
        holderFirstName: 'María',
        holderLastName: 'Gómez',
        saleNumber: 'V-000001',
        status: 'DRAFT',
        updatedAt: '2026-10-24T12:00:00.000Z',
      },
    ],
    returnedNeedingCorrection: [
      {
        id: SALE_ID,
        saleNumber: 'V-000001',
        status: 'RETURNED',
        updatedAt: '2026-10-23T12:00:00.000Z',
      },
    ],
    alerts: [
      {
        code: 'CORRECTIONS_REQUIRED',
        title: 'Ventas por corregir',
        description: 'Hay ventas devueltas con solicitudes de corrección abiertas.',
        severity: 'critical',
        count: 1,
        entityType: 'sale',
      },
    ],
    notifications: [],
    unreadNotificationCount: 0,
  };
}

export function administrativeHomeFixture(): Schemas['AdministrativeHomeResponseDto'] {
  return {
    period: PERIOD,
    kpis: [
      {
        code: 'PENDING_REVIEW',
        label: 'Presentadas pendientes',
        value: 2,
        unit: 'COUNT',
        availability: 'AVAILABLE',
      },
      {
        code: 'IN_REVIEW',
        label: 'En revisión',
        value: 1,
        unit: 'COUNT',
        availability: 'AVAILABLE',
      },
      {
        code: 'OVERDUE_FOLLOW_UPS',
        label: 'Seguimientos vencidos',
        value: 3,
        unit: 'COUNT',
        availability: 'AVAILABLE',
      },
      {
        code: 'RETURNED_STOCK',
        label: 'Devueltas sin corregir',
        value: 1,
        unit: 'COUNT',
        availability: 'AVAILABLE',
      },
    ],
    presentedToday: 1,
    reviewsStartedToday: 2,
    actionsThisMonth: 8,
    activityLast7Days: [
      { key: '2026-10-20', count: 2 },
      { key: '2026-10-21', count: 1 },
    ],
    attentionQueue: [
      {
        id: SALE_ID,
        saleNumber: 'V-000001',
        status: 'SUBMITTED',
        updatedAt: '2026-10-24T12:00:00.000Z',
      },
    ],
    upcomingFollowUps: [],
    alerts: [
      {
        code: 'PENDING_REVIEW',
        title: 'Presentadas pendientes',
        description: 'Ventas en estado Presentada esperando revisión.',
        severity: 'warning',
        count: 2,
        entityType: 'sale',
      },
    ],
  };
}

export function supervisorHomeFixture(): Schemas['SupervisorHomeResponseDto'] {
  return {
    period: PERIOD,
    teamId: null,
    kpis: [
      {
        code: 'SALES_PRESENTED',
        label: 'Ventas presentadas',
        value: 12,
        unit: 'COUNT',
        availability: 'AVAILABLE',
      },
      {
        code: 'REVIEWS_STARTED',
        label: 'Ventas revisadas',
        value: 9,
        unit: 'COUNT',
        availability: 'AVAILABLE',
      },
      {
        code: 'APPROVED',
        label: 'Aprobaciones del mes',
        value: 5,
        unit: 'COUNT',
        availability: 'AVAILABLE',
      },
      {
        code: 'REJECTED',
        label: 'Rechazos del mes',
        value: 3,
        unit: 'COUNT',
        availability: 'AVAILABLE',
      },
    ],
    sellers: [
      {
        sellerId: SELLER_USER_ID,
        firstName: 'Ana',
        lastName: 'Pérez',
        salesPresented: 8,
        submitted: 2,
        inReview: 2,
        approved: 2,
        rejected: 1,
        returned: 1,
      },
      {
        sellerId: '6f9619ff-8b86-4d01-b42d-00c04fc964aa',
        firstName: 'Bruno',
        lastName: 'Gómez',
        salesPresented: 4,
        submitted: 1,
        inReview: 1,
        approved: 1,
        rejected: 0,
        returned: 1,
      },
    ],
    sellerTotals: {
      salesPresented: 12,
      submitted: 3,
      inReview: 3,
      approved: 3,
      rejected: 1,
      returned: 2,
    },
    administratives: [
      {
        administrativeUserId: '7f9619ff-8b86-4d01-b42d-00c04fc964aa',
        firstName: 'María',
        lastName: 'López',
        roleCode: 'ADMINISTRATIVE',
        reviewsStarted: 6,
        approved: 4,
        rejected: 1,
        returns: 3,
        currentWorkload: 4,
      },
      {
        administrativeUserId: '7f9619ff-8b86-4d01-b42d-00c04fc964bb',
        firstName: 'Diego',
        lastName: 'García',
        roleCode: 'ADMINISTRATIVE',
        reviewsStarted: 3,
        approved: 1,
        rejected: 2,
        returns: 1,
        currentWorkload: 2,
      },
    ],
    administrativeTotals: {
      reviewsStarted: 9,
      approved: 5,
      rejected: 3,
      returns: 4,
      currentWorkload: 6,
    },
    unassigned: 2,
    followUpsOverdue: 1,
    alerts: [],
  };
}

export function adminHomeFixture(): Schemas['AdminHomeResponseDto'] {
  return {
    period: PERIOD,
    kpis: [
      {
        code: 'SALES_PRESENTED',
        label: 'Ventas presentadas (mes)',
        value: 40,
        unit: 'COUNT',
        availability: 'AVAILABLE',
      },
      {
        code: 'COMPLIANCE',
        label: 'Cumplimiento',
        value: 75,
        unit: 'PERCENT',
        availability: 'AVAILABLE',
      },
      {
        code: 'PENDING_OPS',
        label: 'Pendientes revisión/corrección',
        value: 8,
        unit: 'COUNT',
        availability: 'AVAILABLE',
      },
      {
        code: 'ACTIVE_USERS',
        label: 'Usuarios activos',
        value: 18,
        unit: 'COUNT',
        availability: 'AVAILABLE',
      },
    ],
    comparableCompliance: {
      hasGoal: true,
      targetIsZero: false,
      targetValue: 50,
      compliancePercent: 75,
    },
    monthlyPresented: [
      { key: '2026-05', count: 5 },
      { key: '2026-06', count: 10 },
      { key: '2026-07', count: 18 },
      { key: '2026-08', count: 24 },
      { key: '2026-09', count: 31 },
      { key: '2026-10', count: 40 },
    ],
    teamPerformance: [
      {
        teamId: TEAM_ID,
        teamName: 'Equipo Norte',
        salesPresented: 20,
        compliance: {
          hasGoal: true,
          targetIsZero: false,
          targetValue: 25,
          compliancePercent: 80,
        },
      },
    ],
    followUpsOverdue: 2,
    staleSubmitted: 1,
    teamsWithoutGoal: 0,
    usersPendingActivation: 1,
    usersSuspended: 0,
    recentSecurityEvents: [],
    alerts: [
      {
        code: 'PENDING_ACTIVATION',
        title: 'Usuarios pendientes de activación',
        description: 'Cuentas en estado PENDING.',
        severity: 'info',
        count: 1,
        entityType: 'user',
      },
    ],
  };
}

/** Returns true when the request was handled as a home endpoint. */
export async function tryHandleHomeApi(
  pathname: string,
  method: string,
  route: Route,
  json: (route: Route, status: number, body: unknown) => Promise<void>,
): Promise<boolean> {
  if (method !== 'GET') return false;

  if (pathname === '/api/v1/home/seller') {
    await json(route, 200, sellerHomeFixture());
    return true;
  }
  if (pathname === '/api/v1/home/administrative') {
    await json(route, 200, administrativeHomeFixture());
    return true;
  }
  if (pathname === '/api/v1/home/supervisor') {
    await json(route, 200, supervisorHomeFixture());
    return true;
  }
  if (pathname === '/api/v1/home/admin') {
    await json(route, 200, adminHomeFixture());
    return true;
  }
  return false;
}
