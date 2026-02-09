import { z } from 'zod';

export const moduleSchema = z.object({
  Module_Numero_Serie: z.string().min(1, 'Numéro de série est requis').max(50, 'Maximum 50 caractères'),
  Type_Module: z.string().min(1, 'Type est requis'),
  Port_Serie: z.number().int('Doit être un nombre entier').min(1, 'Minimum 1').max(255, 'Maximum 255'),
  Emplacement: z.string().min(1, 'Emplacement est requis').max(50, 'Maximum 50 caractères'),
  Adresse_IP: z
    .string()
    .optional()
    .refine((val) => !val || /^(\d{1,3}\.){3}\d{1,3}$/.test(val), 'Adresse IP invalide'),
  Id_Serveur: z.string().optional(),
  Delai_Reseau: z.number().optional(),
  Est_Module_GSO: z.boolean().optional(),
});

export type ModuleFormData = z.infer<typeof moduleSchema>;

