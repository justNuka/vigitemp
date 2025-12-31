import { z } from 'zod';

export const createSiteSchema = z.object({
  Code_Site: z.string().min(1, 'Code site requis').max(20),
  Libelle_Site: z.string().min(1, 'Libellé site requis').max(50),
  Commentaire: z.string().max(200).nullable(),
});

export const editSiteSchema = z.object({
  Libelle_Site: z.string().min(1, 'Libellé site requis').max(50),
  Commentaire: z.string().max(200).nullable(),
});

export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type EditSiteInput = z.infer<typeof editSiteSchema>;

