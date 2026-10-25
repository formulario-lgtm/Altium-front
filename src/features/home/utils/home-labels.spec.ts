import { describe, expect, it } from 'vitest';
import type { HomeKpi } from '@/services/http';
import {
  formatHomeCompliance,
  formatHomeKpiHint,
  formatHomeKpiValue,
  resolveHomeVariant,
} from './home-labels';
import {
  administrativeKpiRoute,
  alertRoute,
  sellerKpiRoute,
  sellerOperationalAlerts,
} from './home-navigation';
import { seriesHasData } from './home-charts';
import type { HomeAlert } from '@/services/http';

describe('home-labels', () => {
  it('resolves home variant by permission priority', () => {
    expect(resolveHomeVariant(() => false)).toBe('fallback');
    expect(resolveHomeVariant((c) => c === 'home.seller.read')).toBe('seller');
    expect(
      resolveHomeVariant((c) => c === 'home.seller.read' || c === 'home.supervisor.read'),
    ).toBe('supervisor');
    expect(
      resolveHomeVariant(
        (c) =>
          c === 'home.admin.read' ||
          c === 'home.administrative.read' ||
          c === 'home.supervisor.read',
      ),
    ).toBe('admin');
  });

  it('never invents 0% when there is no goal', () => {
    expect(
      formatHomeCompliance({
        hasGoal: false,
        targetIsZero: false,
        targetValue: null,
        compliancePercent: null,
      }),
    ).toBe('Sin objetivo');

    const noGoalKpi: HomeKpi = {
      code: 'COMPLIANCE',
      label: 'Cumplimiento',
      value: null,
      unit: 'PERCENT',
      availability: 'NO_GOAL',
    };
    expect(formatHomeKpiValue(noGoalKpi)).toBe('Sin objetivo');
    expect(formatHomeKpiHint(noGoalKpi)).toContain('Sin objetivo');
  });

  it('formats deltas when previous period exists', () => {
    const kpi: HomeKpi = {
      code: 'SALES_PRESENTED',
      label: 'Presentadas',
      value: 5,
      unit: 'COUNT',
      availability: 'AVAILABLE',
      delta: 2,
      previousValue: 3,
    };
    expect(formatHomeKpiValue(kpi)).toBe('5');
    expect(formatHomeKpiHint(kpi)).toContain('+2');
  });
});

describe('home-navigation', () => {
  it('maps seller KPI cards to filtered sales routes', () => {
    expect(sellerKpiRoute('RETURNED_STOCK')).toEqual({
      name: 'sales',
      query: { status: 'RETURNED' },
    });
    expect(sellerKpiRoute('DRAFTS')).toEqual({ name: 'sales', query: { status: 'DRAFT' } });
  });

  it('maps administrative KPI cards to review queue', () => {
    expect(administrativeKpiRoute('PENDING_REVIEW')).toEqual({
      name: 'admin-sales',
      query: { status: 'SUBMITTED' },
    });
    expect(administrativeKpiRoute('OVERDUE_FOLLOW_UPS')).toEqual({ name: 'admin-follow-ups' });
  });

  it('does not link sellers to goals from NO_GOAL alerts', () => {
    const alert: HomeAlert = {
      code: 'NO_GOAL',
      title: 'Sin objetivo mensual',
      description: 'No hay objetivo.',
      severity: 'info',
    };
    expect(alertRoute(alert, 'seller')).toBeNull();
    expect(alertRoute(alert, 'administrative')).toBeNull();
    expect(alertRoute(alert, 'supervisor')).toEqual({ name: 'supervision-goals' });
  });

  it('keeps seller alerts operational (excludes NO_GOAL)', () => {
    const alerts: HomeAlert[] = [
      {
        code: 'NO_GOAL',
        title: 'Sin objetivo',
        description: '…',
        severity: 'info',
      },
      {
        code: 'CORRECTIONS_REQUIRED',
        title: 'Por corregir',
        description: '…',
        severity: 'critical',
        count: 1,
      },
    ];
    expect(sellerOperationalAlerts(alerts).map((a) => a.code)).toEqual(['CORRECTIONS_REQUIRED']);
  });
});

describe('home-charts', () => {
  it('detects empty series without inventing points', () => {
    expect(seriesHasData([])).toBe(false);
    expect(seriesHasData([{ key: '2026-10-01', count: 0 }])).toBe(false);
    expect(seriesHasData([{ key: '2026-10-01', count: 2 }])).toBe(true);
  });
});
