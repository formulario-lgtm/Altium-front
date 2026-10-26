import type { EChartsCoreOption } from 'echarts/core';
import type { HomeSeriesPoint } from '@/services/http';
import {
  baseAxis,
  chartPalette,
  type ChartPalette,
} from '@/features/supervision/utils/chart-theme';

function dayLabel(key: string): string {
  if (key.length >= 10) return key.slice(8, 10);
  if (key.length >= 7) return key.slice(5, 7);
  return key;
}

export function seriesHasData(series: readonly HomeSeriesPoint[] | undefined): boolean {
  return (series ?? []).some((point) => point.count > 0);
}

/** Daily counts, deliberately separate from the monthly goal progress. */
export function buildSellerPresentedOption(
  series: readonly HomeSeriesPoint[],
  palette: ChartPalette,
): EChartsCoreOption {
  return buildDailyCountOption(series, palette);
}

export function buildDailyCountOption(
  series: readonly HomeSeriesPoint[],
  palette: ChartPalette,
  seriesName = 'Presentadas',
): EChartsCoreOption {
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 28, right: 8, top: 24, bottom: 28 },
    xAxis: {
      type: 'category',
      data: series.map((point) => `${point.key.slice(8, 10)}/${point.key.slice(5, 7)}`),
      ...baseAxis(palette),
    },
    yAxis: { type: 'value', min: 0, minInterval: 1, ...baseAxis(palette) },
    series: [
      {
        name: seriesName,
        type: 'bar',
        barMaxWidth: 24,
        data: series.map((point) => point.count),
        itemStyle: { color: palette.primary, borderRadius: [4, 4, 0, 0] },
      },
    ],
  };
}

export function buildPresentedLineOption(
  series: readonly HomeSeriesPoint[],
  palette: ChartPalette,
  options?: { target?: number | null; seriesName?: string; periodLabel?: string },
): EChartsCoreOption {
  const name = options?.seriesName ?? 'Presentadas';
  const option: EChartsCoreOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: [name], textStyle: { color: palette.textSecondary } },
    grid: { left: 40, right: 16, top: 40, bottom: 32 },
    xAxis: {
      type: 'category',
      data: series.map((s) => dayLabel(s.key)),
      name: options?.periodLabel ? undefined : 'Día',
      ...baseAxis(palette),
    },
    yAxis: { type: 'value', name: 'Cantidad', minInterval: 1, ...baseAxis(palette) },
    series: [
      {
        name,
        type: 'line',
        smooth: true,
        data: series.map((s) => s.count),
        itemStyle: { color: palette.primary },
        areaStyle: { color: palette.primary, opacity: 0.12 },
      },
    ],
  };

  const target = options?.target;
  if (target != null && target > 0) {
    (option.series as Array<Record<string, unknown>>)[0]!.markLine = {
      symbol: 'none',
      label: { formatter: `Meta: ${target}`, color: palette.warning },
      lineStyle: { color: palette.warning, type: 'dashed' },
      data: [{ yAxis: target }],
    };
  }

  return option;
}

/** Admin home returns a six-month series, not daily points. */
export function buildMonthlyCountOption(
  series: readonly HomeSeriesPoint[],
  palette: ChartPalette,
): EChartsCoreOption {
  return {
    ...buildDailyCountOption(series, palette),
    xAxis: {
      type: 'category',
      data: series.map((point) => `${point.key.slice(5, 7)}/${point.key.slice(2, 4)}`),
      ...baseAxis(palette),
    },
  };
}

export function buildActivityBarOption(
  series: readonly HomeSeriesPoint[],
  palette: ChartPalette,
  seriesName = 'Acciones',
): EChartsCoreOption {
  return buildDailyCountOption(series, palette, seriesName);
}

export function buildComplianceBySellerOption(
  items: readonly {
    lastName: string;
    firstName: string;
    compliancePercent: number | null;
  }[],
  palette: ChartPalette,
): EChartsCoreOption {
  const rows = items.slice(0, 12);
  return {
    tooltip: {
      trigger: 'axis',
      valueFormatter: (v: unknown) => `${Number(v).toFixed(0)}%`,
    },
    grid: {
      left: 8,
      right: 48,
      top: 16,
      bottom: 28,
      outerBoundsMode: 'same',
      outerBoundsContain: 'axisLabel',
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: Math.max(
        100,
        ...rows.map((seller) => Math.ceil((seller.compliancePercent ?? 0) / 25) * 25),
      ),
      ...baseAxis(palette),
      axisLabel: { color: palette.textSecondary, formatter: '{value}%' },
    },
    yAxis: {
      type: 'category',
      data: rows.map((s) => `${s.firstName} ${s.lastName}`.trim()),
      inverse: true,
      ...baseAxis(palette),
      axisLabel: { color: palette.textSecondary, width: 130, overflow: 'truncate' },
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 20,
        label: { show: true, position: 'right', formatter: '{c}%', color: palette.text },
        data: rows.map((s) => Math.round(s.compliancePercent ?? 0)),
        itemStyle: {
          color: (params: { data: number }) =>
            params.data >= 100 ? palette.success : palette.primary,
        },
      },
    ],
  };
}

export function buildTeamPerformanceOption(
  teams: readonly {
    teamName: string;
    salesPresented: number;
    compliancePercent: number | null;
    hasGoal: boolean;
  }[],
  palette: ChartPalette,
): EChartsCoreOption {
  return {
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['Presentadas', 'Cumplimiento %'],
      bottom: 0,
      type: 'scroll',
      itemWidth: 12,
      itemHeight: 10,
      textStyle: { color: palette.textSecondary },
    },
    grid: {
      left: 36,
      right: 36,
      top: 32,
      bottom: 64,
      outerBoundsMode: 'same',
      outerBoundsContain: 'axisLabel',
    },
    xAxis: {
      type: 'category',
      data: teams.map((t) => t.teamName),
      ...baseAxis(palette),
      axisLabel: {
        ...baseAxis(palette).axisLabel,
        rotate: teams.length > 4 ? 25 : 0,
      },
    },
    yAxis: [
      { type: 'value', name: 'Ventas', minInterval: 1, ...baseAxis(palette) },
      {
        type: 'value',
        name: '%',
        min: 0,
        max: Math.max(
          100,
          ...teams.map((team) => Math.ceil((team.compliancePercent ?? 0) / 25) * 25),
        ),
        ...baseAxis(palette),
      },
    ],
    series: [
      {
        name: 'Presentadas',
        type: 'bar',
        barMaxWidth: 32,
        data: teams.map((t) => t.salesPresented),
        itemStyle: { color: palette.primary },
      },
      {
        name: 'Cumplimiento %',
        type: 'line',
        yAxisIndex: 1,
        symbol: 'circle',
        symbolSize: 8,
        label: { show: true, position: 'top', formatter: '{c}%', color: palette.success },
        data: teams.map((t) =>
          t.hasGoal && t.compliancePercent != null ? Math.round(t.compliancePercent) : null,
        ),
        itemStyle: { color: palette.success },
      },
    ],
  };
}

export function paletteFromTheme(isDark: boolean): ChartPalette {
  return chartPalette(isDark);
}
