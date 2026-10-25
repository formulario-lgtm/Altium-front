import { describe, expect, it } from 'vitest';
import {
  formatCompliance,
  formatHours,
  formatPercent,
  isClosedPeriod,
  KPI_HELP,
  personName,
  saleStatusLabel,
  SUPERVISION_ALERT_THRESHOLDS,
} from './supervision-labels';

describe('supervision-labels', () => {
  it('never shows 0% when there is no goal', () => {
    expect(
      formatCompliance({
        hasGoal: false,
        targetIsZero: false,
        targetValue: null,
        compliancePercent: null,
      }),
    ).toBe('Sin objetivo');
    expect(
      formatCompliance({
        hasGoal: true,
        targetIsZero: true,
        targetValue: 0,
        compliancePercent: null,
      }),
    ).toBe('Objetivo en cero');
    expect(
      formatCompliance({
        hasGoal: true,
        targetIsZero: false,
        targetValue: 10,
        compliancePercent: 80,
      }),
    ).toBe('80%');
  });

  it('formats helpers and status labels', () => {
    expect(formatPercent(12.34, 1)).toBe('12.3%');
    expect(formatPercent(null)).toBe('—');
    expect(formatHours(1.25)).toBe('1.3 h');
    expect(personName('Ana', 'Pérez')).toBe('Pérez, Ana');
    expect(saleStatusLabel('RETURNED')).toBe('Devuelta');
  });

  it('detects closed periods in business calendar', () => {
    const now = new Date('2026-10-15T12:00:00.000Z');
    expect(isClosedPeriod(2026, 9, now)).toBe(true);
    expect(isClosedPeriod(2026, 10, now)).toBe(false);
    expect(isClosedPeriod(2027, 1, now)).toBe(false);
  });

  it('exposes documented alert thresholds and KPI help copy', () => {
    expect(SUPERVISION_ALERT_THRESHOLDS.overdueFollowUpsWarn).toBe(5);
    expect(SUPERVISION_ALERT_THRESHOLDS.overdueFollowUpsCritical).toBe(10);
    expect(SUPERVISION_ALERT_THRESHOLDS.returnedStockWarn).toBe(10);
    expect(KPI_HELP.compliance.toLowerCase()).toContain('sin objetivo');
  });
});
