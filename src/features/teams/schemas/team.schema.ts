import { z } from 'zod';

/** Limits mirror Altium-back team DTOs (name 1–150, description ≤ 2000). */
export const teamFormSchema = z.object({
  name: z
    .string({ required_error: 'Ingresa el nombre del equipo.' })
    .trim()
    .min(1, 'Ingresa el nombre del equipo.')
    .max(150, 'Máximo 150 caracteres.'),
  description: z.string().trim().max(2000, 'Máximo 2000 caracteres.').default(''),
  supervisorId: z
    .string({ required_error: 'Selecciona un supervisor.' })
    .min(1, 'Selecciona un supervisor.'),
  isActive: z.boolean().default(true),
});

export type TeamFormValues = z.infer<typeof teamFormSchema>;
