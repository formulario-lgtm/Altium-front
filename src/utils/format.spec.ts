import { describe, expect, it } from 'vitest';
import {
  formatDateTime,
  formatSaleNumber,
  fullName,
  initialsFromLabel,
  initialsFromPerson,
} from './format';

describe('format helpers', () => {
  it('formats names and initials', () => {
    expect(fullName({ firstName: 'Altium', lastName: 'Admin' })).toBe('Altium Admin');
    expect(initialsFromPerson({ firstName: 'Altium', lastName: 'Admin' })).toBe('AA');
    expect(initialsFromLabel('Altium Admin')).toBe('AA');
    expect(initialsFromLabel('Solo')).toBe('SO');
    expect(initialsFromLabel('')).toBe('?');
  });

  it('formats date-times as dd/mm/aaaa hh:mm or em dash', () => {
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateTime('not-a-date')).toBe('—');
    expect(formatDateTime('2026-10-24T21:23:00.000Z')).toMatch(
      /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/,
    );
  });

  it('formats sale numbers as plain integers', () => {
    expect(formatSaleNumber('V-000001')).toBe('1');
    expect(formatSaleNumber('V-000042')).toBe('42');
    expect(formatSaleNumber('42')).toBe('42');
    expect(formatSaleNumber(7)).toBe('7');
    expect(formatSaleNumber(null)).toBe('—');
  });
});
