import { describe, expect, it } from 'vitest';
import { altiumTokens } from '@/styles/tokens';
import { baseAxis, chartPalette } from './chart-theme';

describe('chart-theme', () => {
  it('maps dark and light palettes from design tokens', () => {
    const dark = chartPalette(true);
    const light = chartPalette(false);
    expect(dark.primary).toBe(altiumTokens.dark.primary);
    expect(light.primary).toBe(altiumTokens.light.primary);
    expect(dark.series.length).toBeGreaterThanOrEqual(5);
    expect(light.text).toBe(altiumTokens.light.textPrimary);
  });

  it('builds axis styles from the palette', () => {
    const palette = chartPalette(false);
    const axis = baseAxis(palette);
    expect(axis.axisLabel.color).toBe(palette.textSecondary);
    expect(axis.splitLine.lineStyle.color).toBe(palette.border);
  });
});
