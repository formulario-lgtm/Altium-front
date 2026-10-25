import { describe, expect, it } from 'vitest';
import { auditActionLabel } from './audit-labels';

describe('auditActionLabel', () => {
  it('maps known actions to Spanish', () => {
    expect(auditActionLabel('auth.login')).toBe('Inicio de sesión');
    expect(auditActionLabel('sale.document.upload')).toBe('Subida de documento de venta');
  });

  it('falls back to the raw code for unknowns', () => {
    expect(auditActionLabel('custom.unknown')).toBe('custom.unknown');
    expect(auditActionLabel(null)).toBe('');
  });
});
