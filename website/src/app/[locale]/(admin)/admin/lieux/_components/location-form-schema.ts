import { z } from "zod";

const mailingContactSchema = z.object({
  Id_Tel_Num: z.number().optional(),
  Numero_Ordre: z.number().int().min(1).default(1),
  Id_Utilisateur: z.number().nullable(),
  Est_Via_Telephone: z.boolean().default(false),
  Est_Via_Email: z.boolean().default(true),
});

export const locationFormSchema = z.object({
  Nom_Lieu: z.string().min(1, "Nom du lieu requis").max(50),
  Type_Lieu: z.string().optional().nullable(),
  Commentaire: z.string().optional().nullable(),
  Lieu_Etat: z.string().optional().nullable(),
  Id_Site: z.number().optional().nullable(),
  GroupIds: z.array(z.number()).optional(),
  Id_Groupe1: z.number().optional().nullable(),
  Id_Groupe2: z.number().optional().nullable(),
  Sonde_Numero_Serie: z.string().optional().nullable(),
  Id_Module: z.number().optional().nullable(),
  Consigne: z.number().optional().nullable(),
  Frequence: z.number().optional().nullable(),
  Consigne_Sup: z.number().optional().nullable(),
  Est_Consigne_Sup_Active: z.boolean().optional(),
  Consigne_Sup_Pre_Alarme: z.number().optional().nullable(),
  Est_Consigne_Sup_Pre_Alarme_Active: z.boolean().optional(),
  Retard_Alarme_Haut: z.number().optional().nullable(),
  Consigne_Inf: z.number().optional().nullable(),
  Est_Consigne_Inf_Active: z.boolean().optional(),
  Consigne_Inf_Pre_Alarme: z.number().optional().nullable(),
  Est_Consigne_Inf_Pre_Alarme_Active: z.boolean().optional(),
  Retard_Alarme_Bas: z.number().optional().nullable(),
  Tolerance_Surveillance_Sup: z.number().optional().nullable(),
  Tolerance_Surveillance_Inf: z.number().optional().nullable(),
  Unite: z.string().optional().nullable(),
  Erreur_Justesse: z.number().optional().nullable(),
  Incertitude: z.number().optional().nullable(),
  Derive: z.number().optional().nullable(),
  EMT_Mode: z.string().optional().nullable(),
  EMT_Valeur: z.number().optional().nullable(),
  Corriger_Erreur_Justesse: z.boolean().optional(),
  Prendre_En_Compte_Derive: z.boolean().optional(),
  MailingContacts: z.array(mailingContactSchema).optional(),
});

export type LocationFormValues = z.infer<typeof locationFormSchema>;
