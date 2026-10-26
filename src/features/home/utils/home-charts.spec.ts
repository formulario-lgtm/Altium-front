import { describe, expect, it } from 'vitest';
import {
  buildSellerPresentedOption,
  buildActivityBarOption,
  buildMonthlyCountOption,
  buildComplianceBySellerOption,
  buildTeamPerformanceOption,
  paletteFromTheme,
} from './home-charts';

describe('seller daily chart', () => {
  it('shows an isolated presentation as a bar with date context and a zero baseline', () => {
    const palette = paletteFromTheme(true);
    const option = buildSellerPresentedOption([{ key: '2026-10-25', count: 1 }], palette);
    expect(option.xAxis).toMatchObject({ data: ['25/10'] });
    expect(option.yAxis).toMatchObject({ min: 0, minInterval: 1 });
    expect(option.series).toEqual([
      expect.objectContaining({
        type: 'bar',
        data: [1],
        itemStyle: expect.objectContaining({ color: palette.primary }),
      }),
    ]);
    expect(option.series[0]).not.toHaveProperty('markLine');
  });
});

describe('operational home charts', () => {
  it('labels the admin six-month history as months rather than days', () => {
    const option = buildMonthlyCountOption(
      [
        { key: '2026-05', count: 5 },
        { key: '2026-10', count: 40 },
      ],
      paletteFromTheme(true),
    );
    expect(option.xAxis).toMatchObject({ data: ['05/26', '10/26'] });
    expect(option.series[0]).toMatchObject({ data: [5, 40] });
    expect(option.yAxis).toMatchObject({ min: 0 });
  });
  it('shows daily consolidated actions without a repeated legend or monthly target', () => {
    const option = buildActivityBarOption(
      [{ key: '2026-10-25', count: 3 }],
      paletteFromTheme(false),
    );
    expect(option.series[0]).toMatchObject({ name: 'Acciones', type: 'bar', data: [3] });
    expect(option.xAxis).toMatchObject({ data: ['25/10'] });
    expect(option).not.toHaveProperty('legend');
    expect(option.series[0]).not.toHaveProperty('markLine');
  });

  it('labels sellers by their full name and keeps percentages above 100 visible', () => {
    const option = buildComplianceBySellerOption(
      [{ firstName: 'Ana', lastName: 'Pérez', compliancePercent: 160 }],
      paletteFromTheme(true),
    );
    expect(option.yAxis).toMatchObject({ data: ['Ana Pérez'], inverse: true });
    expect(option.xAxis.max).toBeGreaterThanOrEqual(160);
  });

  it('does not invent compliance for teams without a goal or clip exceeded goals', () => {
    const option = buildTeamPerformanceOption(
      [
        { teamName: 'Norte', salesPresented: 16, hasGoal: true, compliancePercent: 160 },
        { teamName: 'Sur', salesPresented: 2, hasGoal: false, compliancePercent: null },
      ],
      paletteFromTheme(true),
    );
    expect(option.yAxis[1].max).toBeGreaterThanOrEqual(160);
    expect(option.series[1]).toMatchObject({ data: [160, null] });
  });
});
