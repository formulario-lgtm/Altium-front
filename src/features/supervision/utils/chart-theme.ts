import { altiumTokens } from '@/styles/tokens';

export type ChartPalette = {
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  series: string[];
};

export function chartPalette(isDark: boolean): ChartPalette {
  const t = isDark ? altiumTokens.dark : altiumTokens.light;
  return {
    text: t.textPrimary,
    textSecondary: t.textSecondary,
    border: t.border,
    primary: t.primary,
    success: t.success,
    warning: t.warning,
    error: t.error,
    info: t.info,
    series: [...new Set([t.primary, t.info, t.success, t.warning, t.error, t.textSecondary])],
  };
}

export function baseChartTextStyle(palette: ChartPalette) {
  return {
    color: palette.text,
    fontFamily: 'inherit',
  };
}

export function baseAxis(palette: ChartPalette) {
  return {
    axisLine: { lineStyle: { color: palette.border } },
    axisLabel: { color: palette.textSecondary },
    splitLine: { lineStyle: { color: palette.border, opacity: 0.45 } },
  };
}
