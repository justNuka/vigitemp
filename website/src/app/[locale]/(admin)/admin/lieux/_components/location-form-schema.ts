import { z } from "zod";

const mailingContactSchema = z.object({
  Id_Tel_Num: z.number().optional(),
  Numero_Ordre: z.number().int().min(1).default(1),
  Id_Utilisateur: z.number().nullable(),
  Est_Via_Telephone: z.boolean().default(false),
  Est_Via_Email: z.boolean().default(true),
});


function addConsigneGuards(data: Record<string, unknown>, ctx: z.RefinementCtx) {
  if (data.Id_Site === null || data.Id_Site === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Id_Site"],
      message: "Le site est requis.",
    })
  }

  if (!data.Sonde_Numero_Serie && data.Lieu_Etat !== "D") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Lieu_Etat"],
      message: "Sans sonde, la surveillance doit ?tre d?sactiv?e.",
    })
  }

  if (data.Sonde_Numero_Serie && (data.Lieu_Etat === null || data.Lieu_Etat === undefined || data.Lieu_Etat === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Lieu_Etat"],
      message: "Le mode de surveillance est requis.",
    })
  }

  const hasConsigne = data.Consigne !== null && data.Consigne !== undefined
  const hasSup = data.Consigne_Sup !== null && data.Consigne_Sup !== undefined
  const hasInf = data.Consigne_Inf !== null && data.Consigne_Inf !== undefined
  const supActive = (typeof data.Est_Consigne_Sup_Active === "boolean" ? data.Est_Consigne_Sup_Active : hasSup)
  const infActive = (typeof data.Est_Consigne_Inf_Active === "boolean" ? data.Est_Consigne_Inf_Active : hasInf)

  if (hasConsigne && supActive && hasSup && Number(data.Consigne_Sup) <= Number(data.Consigne)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Consigne_Sup"],
      message: "La consigne supérieure doit être strictement supérieure à la consigne.",
    })
  }

  if (hasConsigne && infActive && hasInf && Number(data.Consigne_Inf) >= Number(data.Consigne)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Consigne_Inf"],
      message: "La consigne inférieure doit être strictement inférieure à la consigne.",
    })
  }

  if (supActive && infActive && hasSup && hasInf && Number(data.Consigne_Inf) >= Number(data.Consigne_Sup)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Consigne_Inf"],
      message: "La consigne inférieure doit être strictement inférieure à la consigne supérieure.",
    })
  }

  if ((hasConsigne || supActive || infActive) && (data.Frequence === null || data.Frequence === undefined)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Frequence"],
      message: "La fréquence de mesure est requise.",
    })
  }

  if (data.Frequence !== null && data.Frequence !== undefined && Number(data.Frequence) <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Frequence"],
      message: "La fréquence de mesure doit être strictement supérieure à 0.",
    })
  }

  if (data.Retard_Alarme_Haut !== null && data.Retard_Alarme_Haut !== undefined && Number(data.Retard_Alarme_Haut) <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Retard_Alarme_Haut"],
      message: "Le retard d'alarme haut doit être strictement supérieure à 0.",
    })
  }

  if (data.Retard_Alarme_Bas !== null && data.Retard_Alarme_Bas !== undefined && Number(data.Retard_Alarme_Bas) <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Retard_Alarme_Bas"],
      message: "Le retard d'alarme bas doit être strictement supérieure à 0.",
    })
  }
}

export const locationFormSchema = z.object({
  Nom_Lieu: z.string().min(1, "Nom du lieu requis").max(50),
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
  Retard_Non_Reponse: z.number().optional().nullable(),
  Retard_Alarme_Changement_Consigne: z.number().optional().nullable(),
  Nb_Mesures_Temporisation_Redeclenchement: z.number().int().min(0).optional().nullable(),
  Tolerance_Surveillance_Sup: z.number().optional().nullable(),
  Tolerance_Surveillance_Inf: z.number().optional().nullable(),
  Unite: z.string().optional().nullable(),
  Derniere_Date_Etalonnage: z.string().optional().nullable(),
  Erreur_Justesse: z.number().optional().nullable(),
  Incertitude: z.number().optional().nullable(),
  Derive: z.number().optional().nullable(),
  EMT_Mode: z.string().optional().nullable(),
  EMT_Valeur: z.number().optional().nullable(),
  Corriger_Erreur_Justesse: z.boolean().optional(),
  Prendre_En_Compte_Derive: z.boolean().optional(),
  MailingContacts: z.array(mailingContactSchema).optional(),
  Applied_Etalonnage_Id: z.coerce.number().int().positive().optional().nullable(),
}).superRefine(addConsigneGuards);

export type LocationFormValues = z.infer<typeof locationFormSchema>;
