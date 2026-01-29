import { z } from 'zod';

const baseCreateSiteSchema = z.object({
  Code_Site: z.string().min(1).max(20),
  Libelle_Site: z.string().min(1).max(50),
  Commentaire: z.string().max(200).nullable(),
});

const baseEditSiteSchema = z.object({
  Libelle_Site: z.string().min(1).max(50),
  Commentaire: z.string().max(200).nullable(),
});

export const createSiteSchema = (t: (key: string) => string) =>
  z.object({
    Code_Site: z.string().min(1, t('validation.code_required')).max(20),
    Libelle_Site: z.string().min(1, t('validation.label_required')).max(50),
    Commentaire: z.string().max(200).nullable(),
  });

export const editSiteSchema = (t: (key: string) => string) =>
  z.object({
    Libelle_Site: z.string().min(1, t('validation.label_required')).max(50),
    Commentaire: z.string().max(200).nullable(),
  });

export type CreateSiteInput = z.infer<typeof baseCreateSiteSchema>;
export type EditSiteInput = z.infer<typeof baseEditSiteSchema>;

