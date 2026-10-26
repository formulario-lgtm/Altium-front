import { describe, expect, it } from 'vitest';
import { displayDateFieldValue, localDateValue, parseDateFieldValue } from './date-field-value';

describe('DateField values', () => {
  it('preserves local calendar dates without UTC conversion', () => {
    const date = parseDateFieldValue('1990-05-10')!;
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([1990, 4, 10]);
    expect(localDateValue(date)).toBe('1990-05-10');
    expect(displayDateFieldValue('1990-05-10')).toBe('10/05/1990');
  });
  it.each(['2026-02-30', '2026-13-01', '2026-10-26T25:00', '2026-10-26T12:65', '', null])(
    'rejects invalid value %s',
    (value) => {
      expect(parseDateFieldValue(value)).toBeNull();
      expect(displayDateFieldValue(value, true)).toBe('');
    },
  );
  it('supports leap dates and local date/time display', () => {
    expect(localDateValue(parseDateFieldValue('2024-02-29')!)).toBe('2024-02-29');
    expect(displayDateFieldValue('2026-10-26T09:30', true)).toBe('26/10/2026 09:30');
  });
});
