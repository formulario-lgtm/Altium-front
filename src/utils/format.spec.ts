import { describe, expect, it } from 'vitest';
import { formatDateTime, fullName, initialsFromLabel, initialsFromPerson } from './format';

describe('format helpers', () => {
  it('formats names and initials', () => {
    expect(fullName({ firstName: 'Altium', lastName: 'Admin' })).toBe('Altium Admin');
    expect(initialsFromPerson({ firstName: 'Altium', lastName: 'Admin' })).toBe('AA');
    expect(initialsFromLabel('Altium Admin')).toBe('AA');
    expect(initialsFromLabel('Solo')).toBe('SO');
    expect(initialsFromLabel('')).toBe('?');
  });

  it('formats date-times or em dash', () => {
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateTime('not-a-date')).toBe('—');
    expect(formatDateTime('2026-10-24T21:23:00.000Z')).toMatch(/2026/);
  });
});
