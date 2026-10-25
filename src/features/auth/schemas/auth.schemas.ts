import { z } from 'zod';

export const emailSchema = z
  .string({ required_error: 'Ingresa tu correo.' })
  .trim()
  .min(1, 'Ingresa tu correo.')
  .email('Ingresa un correo válido.');

/** Login does not enforce the password policy (backend only checks credentials). */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ required_error: 'Ingresa tu contraseña.' }).min(1, 'Ingresa tu contraseña.'),
  remember: z.boolean().default(false),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export type LoginValues = z.infer<typeof loginSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
