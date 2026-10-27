import { describe, expect, it } from 'vitest';
import { paletteFromTheme } from './home-charts';
import { buildSupervisorShareOption } from './supervisor-charts';

describe('supervisor donut contributions', () => {
  it('keeps all positive people and excludes zero slices without changing values', () => {
    const option = buildSupervisorShareOption(
      [
        { id: 'a', name: 'Ana', value: 8 },
        { id: 'b', name: 'Bruno', value: 4 },
        { id: 'z', name: 'Sin actividad', value: 0 },
      ],
      paletteFromTheme(true),
    );
    expect(option.series[0]).toMatchObject({
      type: 'pie',
      data: [
        { id: 'a', name: 'Ana', value: 8 },
        { id: 'b', name: 'Bruno', value: 4 },
      ],
    });
    expect(option.tooltip).toMatchObject({ renderMode: 'richText' });
  });
});
