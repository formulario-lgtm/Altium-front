import type { EChartsCoreOption } from 'echarts/core';
import type { ChartPalette } from '@/features/supervision/utils/chart-theme';
export type SupervisorShare = { id: string; name: string; value: number };

/** Only mutually exclusive contributions belong in this pie (never mix reviews and outcomes). */
export function buildSupervisorShareOption(
  items: readonly SupervisorShare[],
  palette: ChartPalette,
): EChartsCoreOption {
  return {
    tooltip: { trigger: 'item', renderMode: 'richText', formatter: '{b}: {c} ({d}%)' },
    legend: { type: 'scroll', bottom: 0, textStyle: { color: palette.textSecondary } },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '43%'],
        label: { show: false },
        emphasis: { label: { show: true, color: palette.text, formatter: '{c}' } },
        data: items
          .filter((item) => item.value > 0)
          .map((item, index) => ({
            ...item,
            itemStyle: { color: palette.series[index % palette.series.length] },
          })),
      },
    ],
  };
}
