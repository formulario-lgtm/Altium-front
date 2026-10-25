import { describe, expect, it } from 'vitest';
import {
  fieldError,
  fieldErrorProps,
  memberFieldError,
  memberFieldErrorProps,
  saleFieldPathLabel,
} from './sale-field-errors';

describe('sale-field-errors', () => {
  const errors = {
    'members[0].cuil': 'Se requiere un CUIL válido de 11 dígitos',
    'contact.email': 'El email es obligatorio',
    'employment.employers[1].employerCuit': 'CUIT inválido',
  };

  it('resolves bracket and dotted member paths', () => {
    expect(memberFieldError(errors, 0, 'cuil')).toBe(errors['members[0].cuil']);
    expect(fieldError({ 'members.0.cuil': 'x' }, 'members.0.cuil')).toBe('x');
    expect(memberFieldError({ 'members.0.cuil': 'x' }, 0, 'cuil')).toBe('x');
  });

  it('builds Vuetify error props for a path', () => {
    expect(fieldErrorProps(errors, 'contact.email')).toEqual({
      error: true,
      'error-messages': ['El email es obligatorio'],
    });
    expect(fieldErrorProps(errors, 'contact.phone')).toEqual({
      error: false,
      'error-messages': [],
    });
    expect(memberFieldErrorProps(errors, 0, 'cuil').error).toBe(true);
  });

  it('humanizes field paths for the submit summary', () => {
    expect(saleFieldPathLabel('members[0].cuil')).toBe('Titular · CUIL');
    expect(saleFieldPathLabel('contact.email')).toBe('Correo');
    expect(saleFieldPathLabel('employment.employers[1].employerCuit')).toBe('CUIT empleador 2');
  });
});
