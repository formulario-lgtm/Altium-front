import { z } from 'zod';

/** Mirrors the backend policy (activate, reset, change): 12–128 chars, upper, lower, digit. */
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

export const PASSWORD_POLICY_HINT =
  'Mínimo 12 caracteres, con al menos una mayúscula, una minúscula y un número.';

export const passwordPolicySchema = z
  .string({ required_error: 'Ingresa una contraseña.' })
  .min(PASSWORD_MIN_LENGTH, `Debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`)
  .max(PASSWORD_MAX_LENGTH, `Debe tener como máximo ${PASSWORD_MAX_LENGTH} caracteres.`)
  .regex(/[A-Z]/, 'Debe incluir al menos una letra mayúscula.')
  .regex(/[a-z]/, 'Debe incluir al menos una letra minúscula.')
  .regex(/\d/, 'Debe incluir al menos un número.');

export const setPasswordSchema = z
  .object({
    newPassword: passwordPolicySchema,
    confirmPassword: z.string({ required_error: 'Repite la contraseña.' }),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden.',
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: 'Ingresa tu contraseña actual.' })
      .min(1, 'Ingresa tu contraseña actual.'),
    newPassword: passwordPolicySchema,
    confirmPassword: z.string({ required_error: 'Repite la contraseña.' }),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden.',
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    path: ['newPassword'],
    message: 'La nueva contraseña debe ser distinta de la actual.',
  });

export type SetPasswordValues = z.infer<typeof setPasswordSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
