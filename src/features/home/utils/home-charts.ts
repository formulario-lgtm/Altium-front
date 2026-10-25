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

export function buildActivityBarOption(
  series: readonly HomeSeriesPoint[],
  palette: ChartPalette,
  seriesName = 'Acciones',
): EChartsCoreOption {
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: [seriesName], textStyle: { color: palette.textSecondary } },
    grid: { left: 40, right: 16, top: 40, bottom: 32 },
    xAxis: {
      type: 'category',
      data: series.map((s) => dayLabel(s.key)),
      ...baseAxis(palette),
    },
    yAxis: { type: 'value', name: 'Cantidad', minInterval: 1, ...baseAxis(palette) },
    series: [
      {
        name: seriesName,
        type: 'bar',
        data: series.map((s) => s.count),
        itemStyle: { color: palette.primary },
      },
    ],
  };
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
    grid: { left: 100, right: 24, top: 24, bottom: 32 },
    xAxis: { type: 'value', name: '%', ...baseAxis(palette) },
    yAxis: {
      type: 'category',
      data: rows.map((s) => s.lastName || s.firstName),
      ...baseAxis(palette),
    },
    series: [
      {
        type: 'bar',
        data: rows.map((s) => Math.round(s.compliancePercent ?? 0)),
        itemStyle: {
          color: (params: { data: number }) =>
            params.data >= 100
              ? palette.success
              : params.data >= 70
                ? palette.warning
                : palette.error,
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
      textStyle: { color: palette.textSecondary },
    },
    grid: { left: 48, right: 48, top: 40, bottom: 48 },
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
      { type: 'value', name: '%', max: 120, ...baseAxis(palette) },
    ],
    series: [
      {
        name: 'Presentadas',
        type: 'bar',
        data: teams.map((t) => t.salesPresented),
        itemStyle: { color: palette.primary },
      },
      {
        name: 'Cumplimiento %',
        type: 'line',
        yAxisIndex: 1,
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
