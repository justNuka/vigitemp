import { z } from "zod"

export const VIGILOG_ACCESS_CODES = ["ACCES_VIGILOG", "ACCES_METROLOGIE"] as const
export const VIGILOG_CONFIG_MANAGE_CODES = ["ACCES_METROLOGIE"] as const

export const VIGILOG_STATUSES = [
  "EN_ATTENTE_DEPART",
  "EN_ATTENTE_RECEPTION",
  "RECUE",
  "ANALYSEE",
  "ACQUITTEE",
  "ANNULEE",
] as const

export const VIGILOG_TRAFFIC_LIGHTS = ["VERT", "ORANGE", "ROUGE"] as const

const decimalSchema = z.coerce.number().finite()
const positiveIntegerSchema = z.coerce.number().int().min(1)
const dateTimeSchema = z.preprocess((value) => {
  if (value instanceof Date) return value
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date
  }
  return value
}, z.date())

export const vigilogConfigurationSchema = z.object({
  Nom_Configuration: z.string().trim().min(1).max(100),
  Description_Configuration: z.string().trim().max(255).nullable().optional(),
  Consigne: decimalSchema.nullable().optional(),
  Limite_Basse_Active: z.coerce.boolean().default(false),
  Limite_Basse: decimalSchema.nullable().optional(),
  Limite_Haute_Active: z.coerce.boolean().default(false),
  Limite_Haute: decimalSchema.nullable().optional(),
  Frequence_Min: positiveIntegerSchema,
  Retard_Alarme_Min: positiveIntegerSchema,
  Delai_Demarrage_Min: z.coerce.number().int().min(0).max(1440).default(0),
  Autorise_Arret_Bouton_Stop: z.coerce.boolean().default(true),
  Reinitialise_Avec_Bouton_Start: z.coerce.boolean().default(true),
  Actif: z.coerce.boolean().default(true),
}).superRefine((value, ctx) => {
  if (value.Limite_Basse_Active && value.Limite_Basse == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Limite_Basse"],
      message: "Limite basse requise",
    })
  }

  if (value.Limite_Haute_Active && value.Limite_Haute == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Limite_Haute"],
      message: "Limite haute requise",
    })
  }
})

export const vigilogDepartureSchema = z.object({
  Id_VigiLog_Configuration: positiveIntegerSchema,
  Id_VigiLog: positiveIntegerSchema.nullable().optional(),
  Id_Site_Depart: positiveIntegerSchema,
  Id_Site_Arrivee: positiveIntegerSchema,
  Numero_Serie_VigiLog: z.string().trim().min(1).max(30),
  Commentaire: z.string().trim().max(2000).nullable().optional(),
})

export const vigilogLoggerSchema = z.object({
  Numero_Serie: z.string().trim().min(1).max(30),
  Modele: z.string().trim().max(50).nullable().optional(),
  Libelle: z.string().trim().max(100).nullable().optional(),
  Actif: z.coerce.boolean().default(true),
  Date_Etalonnage: dateTimeSchema.nullable().optional(),
  Date_Validite: dateTimeSchema.nullable().optional(),
  Duree_Validite_Jours: z.coerce.number().int().min(1).max(3650).nullable().optional(),
  Err_Justesse: z.coerce.number().finite().nullable().optional(),
  Commentaire: z.string().trim().max(2000).nullable().optional(),
})

export const vigilogReceiveSchema = z.object({
  Commentaire: z.string().trim().max(2000).nullable().optional(),
  Mesures: z.array(
    z.object({
      Numero_Ordre: z.coerce.number().int().min(0).nullable().optional(),
      Date_Heure_Mesure: dateTimeSchema,
      Valeur: decimalSchema.nullable().optional(),
      Est_Marqueur: z.coerce.boolean().default(false),
      Details: z.string().trim().max(200).nullable().optional(),
    }),
  ).max(20000).optional().default([]),
})

export const vigilogAcknowledgeSchema = z.object({
  Commentaire_Acquittement: z.string().trim().max(2000).nullable().optional(),
})

export function buildVigilogReference(userId: number) {
  const now = new Date()
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("")
  const timePart = [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("")

  return `VLG-${datePart}-${timePart}-${userId}`
}

export function normalizeOptionalText(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}
