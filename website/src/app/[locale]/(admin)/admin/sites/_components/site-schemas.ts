import { z } from 'zod';

const baseCreateSiteSchema = z.object({
  Libelle_Site: z.string().min(1).max(50),
  Commentaire: z.string().max(200).nullable(),
  assignedUserIds: z.array(z.number()),
});

const baseEditSiteSchema = z.object({
  Libelle_Site: z.string().min(1).max(50),
  Commentaire: z.string().max(200).nullable(),
  assignedUserIds: z.array(z.number()),
});

export const createSiteSchema = (t: (key: string) => string) =>
  z.object({
    Libelle_Site: z.string().min(1, t('validation.label_required')).max(50),
    Commentaire: z.string().max(200).nullable(),
    assignedUserIds: z.array(z.number()),
  });

export const editSiteSchema = (t: (key: string) => string) =>
  z.object({
    Libelle_Site: z.string().min(1, t('validation.label_required')).max(50),
    Commentaire: z.string().max(200).nullable(),
    assignedUserIds: z.array(z.number()),
  });

export type CreateSiteInput = z.infer<typeof baseCreateSiteSchema>;
export type EditSiteInput = z.infer<typeof baseEditSiteSchema>;

