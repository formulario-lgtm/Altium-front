import { z } from 'zod';

const requiredText = (message: string) =>
  z.string({ required_error: message }).trim().min(1, message).max(100, 'Máximo 100 caracteres.');

export const userFormSchema = z.object({
  firstName: requiredText('Ingresa el nombre.'),
  lastName: requiredText('Ingresa el apellido.'),
  email: z
    .string({ required_error: 'Ingresa el correo.' })
    .trim()
    .min(1, 'Ingresa el correo.')
    .email('Ingresa un correo válido.'),
  roleId: z.string({ required_error: 'Selecciona un rol.' }).min(1, 'Selecciona un rol.'),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
