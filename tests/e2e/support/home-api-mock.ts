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
        label: 'Ventas presentadas (equipos)',
        value: 12,
        unit: 'COUNT',
        availability: 'AVAILABLE',
      },
      {
        code: 'COMPLIANCE',
        label: 'Cumplimiento',
        value: 60,
        unit: 'PERCENT',
        availability: 'AVAILABLE',
      },
      {
        code: 'BEHIND_PACE',
        label: 'Vendedores bajo ritmo',
        value: 1,
        unit: 'COUNT',
        availability: 'AVAILABLE',
      },
      {
        code: 'PENDING_ADMIN',
        label: 'Pendientes de gestión admin',
        value: 9,
        unit: 'COUNT',
        availability: 'AVAILABLE',
      },
    ],
    compliance: {
      hasGoal: true,
      targetIsZero: false,
      targetValue: 20,
      compliancePercent: 60,
    },
    expectedPercent: 80,
    dashboard: {
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
      alerts: [],
    },
    sellersBehindPace: [
      {
        sellerId: SELLER_USER_ID,
        firstName: 'Ana',
        lastName: 'Pérez',
        teamId: TEAM_ID,
        salesPresented: 2,
        expectedPercent: 80,
        behindPace: true,
        compliance: {
          hasGoal: true,
          targetIsZero: false,
          targetValue: 10,
          compliancePercent: 20,
        },
      },
    ],
    teamSummaries: [],
    dailyPresented: [
      { key: '2026-10-01', count: 2 },
      { key: '2026-10-02', count: 3 },
    ],
    alerts: [
      {
        code: 'BEHIND_PACE',
        title: 'Vendedores bajo el ritmo esperado',
        description: 'Cumplimiento menor al ritmo del mes.',
        severity: 'info',
        count: 1,
        entityType: 'user',
      },
    ],
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
      { key: '2026-10-01', count: 5 },
      { key: '2026-10-02', count: 7 },
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
