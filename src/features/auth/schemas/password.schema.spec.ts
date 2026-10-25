import { describe, expect, it } from 'vitest';
import { changePasswordSchema, passwordPolicySchema, setPasswordSchema } from './password.schema';

describe('passwordPolicySchema', () => {
  it('accepts a password that meets the backend policy', () => {
    expect(passwordPolicySchema.safeParse('Altium2026Secure').success).toBe(true);
  });

  it.each([
    ['too short', 'Short1Aa'],
    ['no uppercase', 'altium2026secure'],
    ['no lowercase', 'ALTIUM2026SECURE'],
    ['no digit', 'AltiumSecurePass'],
    ['too long', `Aa1${'x'.repeat(126)}`],
  ])('rejects %s', (_label, value) => {
    expect(passwordPolicySchema.safeParse(value).success).toBe(false);
  });

  it('accepts exactly 12 and 128 characters', () => {
    expect(passwordPolicySchema.safeParse('Abcdefghij12').success).toBe(true);
    expect(passwordPolicySchema.safeParse(`Aa1${'x'.repeat(125)}`).success).toBe(true);
  });
});

describe('setPasswordSchema', () => {
  it('requires matching confirmation', () => {
    const result = setPasswordSchema.safeParse({
      newPassword: 'Altium2026Secure',
      confirmPassword: 'Altium2026Other1',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirmPassword']);
    }
  });
});

describe('changePasswordSchema', () => {
  it('rejects reusing the current password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'Altium2026Secure',
      newPassword: 'Altium2026Secure',
      confirmPassword: 'Altium2026Secure',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a valid change', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'whatever',
      newPassword: 'Altium2026Secure',
      confirmPassword: 'Altium2026Secure',
    });
    expect(result.success).toBe(true);
  });
});
