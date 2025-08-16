import { z } from 'zod';

export const observationBodySchema = z.object({
  name: z.string().trim().min(1, 'Name must be 1–40 chars').max(40, 'Name must be 1–40 chars'),
  meteors: z.number().int('Meteors must be an integer between 0 and 500').min(0, 'Meteors must be an integer between 0 and 500').max(500, 'Meteors must be an integer between 0 and 500'),
  minutes: z.number().gt(0, 'Minutes must be > 0 and ≤ 240').max(240, 'Minutes must be > 0 and ≤ 240'),
});

export const observationFormSchema = z.object({
  name: z.string().trim().min(1, 'Name must be 1–40 chars').max(40, 'Name must be 1–40 chars'),
  meteors: z.coerce.number().int('Meteors must be an integer between 0 and 500').min(0, 'Meteors must be an integer between 0 and 500').max(500, 'Meteors must be an integer between 0 and 500'),
  minutes: z.coerce.number().gt(0, 'Minutes must be > 0 and ≤ 240').max(240, 'Minutes must be > 0 and ≤ 240'),
});

export type ObservationBodyInput = z.infer<typeof observationBodySchema>;
export type ObservationFormInput = z.infer<typeof observationFormSchema>;
