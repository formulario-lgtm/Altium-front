import { describe, expect, it } from 'vitest';
import { roleLabel } from './role-labels';

describe('roleLabel', () => {
  it('maps system role codes to Spanish labels', () => {
    expect(roleLabel('SUPER_ADMIN')).toBe('Super administrador');
    expect(roleLabel('SELLER')).toBe('Vendedor');
    expect(roleLabel('ADMINISTRATIVE')).toBe('Administrativo');
    expect(roleLabel('SUPERVISOR')).toBe('Supervisor');
  });

  it('falls back for unknown or empty codes', () => {
    expect(roleLabel('UNKNOWN')).toBe('UNKNOWN');
    expect(roleLabel(null)).toBe('');
    expect(roleLabel(undefined)).toBe('');
  });
});
