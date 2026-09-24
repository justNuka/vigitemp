import { z } from "zod";
import { buildCriticalThresholdIssues } from "@/lib/location-critical-threshold-contract";
import { computeEmt } from "@/lib/emt";

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
      message: "Sans sonde, la surveillance doit etre desactivee.",
    })
  }

  if (
    data.Sonde_Numero_Serie &&
    (data.Lieu_Etat === null || data.Lieu_Etat === undefined || data.Lieu_Etat === "")
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Lieu_Etat"],
      message: "Le mode de surveillance est requis.",
    })
  }

  const hasConsigne = data.Consigne !== null && data.Consigne !== undefined
  const hasSup = data.Consigne_Sup !== null && data.Consigne_Sup !== undefined
  const hasInf = data.Consigne_Inf !== null && data.Consigne_Inf !== undefined
  const supActive =
    typeof data.Est_Consigne_Sup_Active === "boolean"
      ? data.Est_Consigne_Sup_Active
      : hasSup
  const infActive =
    typeof data.Est_Consigne_Inf_Active === "boolean"
      ? data.Est_Consigne_Inf_Active
      : hasInf

  if (
    (hasConsigne || supActive || infActive) &&
    (data.Frequence === null || data.Frequence === undefined)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Frequence"],
      message: "La frequence de mesure est requise.",
    })
  }

  if (
    data.Frequence !== null &&
    data.Frequence !== undefined &&
    Number(data.Frequence) <= 0
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Frequence"],
      message: "La frequence de mesure doit etre strictement superieure a 0.",
    })
  }

  if (
    data.Retard_Alarme_Haut !== null &&
    data.Retard_Alarme_Haut !== undefined &&
    Number(data.Retard_Alarme_Haut) <= 0
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Retard_Alarme_Haut"],
      message: "Le retard d'alarme haut doit etre strictement superieur a 0.",
    })
  }

  if (
    data.Retard_Alarme_Bas !== null &&
    data.Retard_Alarme_Bas !== undefined &&
    Number(data.Retard_Alarme_Bas) <= 0
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Retard_Alarme_Bas"],
      message: "Le retard d'alarme bas doit etre strictement superieur a 0.",
    })
  }

  const thresholdIssues = buildLocationAlarmThresholdIssues({
    mode: typeof data.EMT_Mode === "string" ? data.EMT_Mode : null,
    emtValue: typeof data.EMT_Valeur === "number" ? data.EMT_Valeur : null,
    consigne: typeof data.Consigne === "number" ? data.Consigne : null,
    consigneSup: typeof data.Consigne_Sup === "number" ? data.Consigne_Sup : null,
    consigneInf: typeof data.Consigne_Inf === "number" ? data.Consigne_Inf : null,
    isConsigneSupActive: supActive,
    isConsigneInfActive: infActive,
    preAlarmHigh:
      typeof data.Consigne_Sup_Pre_Alarme === "number"
        ? data.Consigne_Sup_Pre_Alarme
        : null,
    preAlarmHighActive: data.Est_Consigne_Sup_Pre_Alarme_Active === true,
    preAlarmLow:
      typeof data.Consigne_Inf_Pre_Alarme === "number"
        ? data.Consigne_Inf_Pre_Alarme
        : null,
    preAlarmLowActive: data.Est_Consigne_Inf_Pre_Alarme_Active === true,
    criticalHigh:
      typeof data.Seuil_Critique_Haut === "number" ? data.Seuil_Critique_Haut : null,
    criticalHighActive: data.Est_Seuil_Critique_Haut_Active === true,
    criticalLow:
      typeof data.Seuil_Critique_Bas === "number" ? data.Seuil_Critique_Bas : null,
    criticalLowActive: data.Est_Seuil_Critique_Bas_Active === true,
    incertitude: typeof data.Incertitude === "number" ? data.Incertitude : null,
    erreurJustesse:
      typeof data.Erreur_Justesse === "number" ? data.Erreur_Justesse : null,
    derive: typeof data.Derive === "number" ? data.Derive : null,
    includeDeriveInUncertainty:
      data.EMT_Mode === "quart" || data.EMT_Mode === "manuel"
        ? true
        : data.Prendre_En_Compte_Derive === true,
    correctAccuracyError: data.Corriger_Erreur_Justesse === true,
  })

  for (const issue of thresholdIssues) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: issue.path,
      message: issue.message,
    })
  }
}

export const locationFormSchema = z.object({
  Nom_Lieu: z.string().min(1, "Nom du lieu requis").max(30, "Le nom du lieu ne peut pas depasser 30 caracteres."),
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
  Seuil_Critique_Haut: z.number().optional().nullable(),
  Est_Seuil_Critique_Haut_Active: z.boolean().optional(),
  Retard_Alarme_Haut: z.number().optional().nullable(),
  Consigne_Inf: z.number().optional().nullable(),
  Est_Consigne_Inf_Active: z.boolean().optional(),
  Consigne_Inf_Pre_Alarme: z.number().optional().nullable(),
  Est_Consigne_Inf_Pre_Alarme_Active: z.boolean().optional(),
  Seuil_Critique_Bas: z.number().optional().nullable(),
  Est_Seuil_Critique_Bas_Active: z.boolean().optional(),
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
  Apply_Mailing_To_Groups: z.boolean().optional(),
  Applied_Etalonnage_Id: z.coerce.number().int().positive().optional().nullable(),
}).superRefine(addConsigneGuards);

export type LocationFormValues = z.infer<typeof locationFormSchema>;
