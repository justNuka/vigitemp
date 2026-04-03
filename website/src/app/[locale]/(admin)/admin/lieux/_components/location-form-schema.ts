import { z } from "zod";

const mailingContactSchema = z.object({
  Id_Tel_Num: z.number().optional(),
  Numero_Ordre: z.number().int().min(1).default(1),
  Id_Utilisateur: z.number().nullable(),
  Est_Via_Telephone: z.boolean().default(false),
  Est_Via_Email: z.boolean().default(true),
});


function addConsigneGuards(data: any, ctx: z.RefinementCtx) {
  const hasConsigne = data.Consigne !== null && data.Consigne !== undefined
  const hasSup = data.Consigne_Sup !== null && data.Consigne_Sup !== undefined
  const hasInf = data.Consigne_Inf !== null && data.Consigne_Inf !== undefined
  const supActive = data.Est_Consigne_Sup_Active ?? hasSup
  const infActive = data.Est_Consigne_Inf_Active ?? hasInf

  if (hasConsigne && supActive && hasSup && Number(data.Consigne_Sup) <= Number(data.Consigne)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Consigne_Sup"],
      message: "La consigne sup doit etre strictement superieure a la consigne.",
    })
  }

  if (hasConsigne && infActive && hasInf && Number(data.Consigne_Inf) >= Number(data.Consigne)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Consigne_Inf"],
      message: "La consigne inf doit etre strictement inferieure a la consigne.",
    })
  }

  if (supActive && infActive && hasSup && hasInf && Number(data.Consigne_Inf) >= Number(data.Consigne_Sup)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Consigne_Inf"],
      message: "La consigne inf doit etre strictement inferieure a la consigne sup.",
    })
  }

  if ((hasConsigne || supActive || infActive) && (data.Frequence === null || data.Frequence === undefined)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Frequence"],
      message: "La frequence de mesure est requise.",
    })
  }

  if (data.Frequence !== null && data.Frequence !== undefined && Number(data.Frequence) <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Frequence"],
      message: "La frequence de mesure doit etre strictement superieure a 0.",
    })
  }

  if (data.Retard_Alarme_Haut !== null && data.Retard_Alarme_Haut !== undefined && Number(data.Retard_Alarme_Haut) <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Retard_Alarme_Haut"],
      message: "Le retard d'alarme haut doit etre strictement superieur a 0.",
    })
  }

  if (data.Retard_Alarme_Bas !== null && data.Retard_Alarme_Bas !== undefined && Number(data.Retard_Alarme_Bas) <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Retard_Alarme_Bas"],
      message: "Le retard d'alarme bas doit etre strictement superieur a 0.",
    })
  }
}

export const locationFormSchema = z.object({
  Nom_Lieu: z.string().min(1, "Nom du lieu requis").max(50),
  Type_Lieu: z.string().optional().nullable(),
  Commentaire: z.string().optional().nullable(),
  Lieu_Etat: z.string().optional().nullable(),
  Id_Site: z.number().optional().nullable(),
  GroupIds: z.array(z.number()).optional(),
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
  Nb_Mesures_Temporisation_Redeclenchement: z.number().int().min(0).optional().nullable(),
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
}).superRefine(addConsigneGuards);

export type LocationFormValues = z.infer<typeof locationFormSchema>;
