import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getClientIp } from "@/lib/api-logger"
import { log } from "@/lib/logger"
import { z } from "zod"
import { apiError, apiOk } from "@/lib/api-response"
import { clearLocationCache } from "@/lib/measurement-cache"
import { extractAddressFromSerial, getSensorFamilyFromSerial, isGsoType } from "@/lib/sensor-naming"
import { computeEmt, emtModeFromDb, emtModeToDb } from "@/lib/emt"
import { requireStandardOrExpertIfFieldsUsed } from "@/lib/license-guards"
import { isSurveillanceActionCommentRequired } from "@/lib/action-comment-policy"
import { withAnyAuthorizationLogging } from "@/lib/api-wrappers"
import { getPermissionAliases } from "@/lib/permissions"
import { findLocationNameConflict } from "@/lib/location-name-conflicts"
import { buildLocationValueRangeIssues, getSensorTypeValueRangeBySerial } from "@/lib/sensor-value-range"
import { getDbDatePlusMinutes, getDbNow } from "@/lib/sql-provider"
import { syncGspLocationConfiguration } from "@/lib/gsp-config-sync"

const mailingContactSchema = z.object({
  Id_Tel_Num: z.number().optional(),
  Numero_Ordre: z.number().int().min(1).optional(),
  Id_Utilisateur: z.number().nullable().optional(),
  Est_Via_Telephone: z.boolean().optional(),
  Est_Via_Email: z.boolean().optional(),
})

const STANDARD_METROLOGY_FIELDS = [
  "EMT_Mode",
  "EMT_Valeur",
  "Corriger_Erreur_Justesse",
  "Prendre_En_Compte_Derive",
  "Derniere_Date_Etalonnage",
  "Applied_Etalonnage_Id",
  "Unite",
  "Erreur_Justesse",
  "Incertitude",
  "Derive",
] as const

const GSO_FIXED_FREQUENCY_SECONDS = 15 * 60

function parseAppliedCalibrationDate(value: unknown) {
  if (value === undefined) return undefined
  if (value === null || value === "") return null
  if (typeof value !== "string") throw new Error("invalid_calibration_date")

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("invalid_calibration_date")
  }

  parsed.setHours(0, 0, 0, 0)
  return parsed
}

type ChangedFieldEntry = {
  field: string
  from: unknown
  to: unknown
}

const AUDIT_FIELD_LABELS: Record<string, string> = {
  Nom_Lieu: "Nom du lieu",
  Commentaire: "Commentaire",
  Observations_Info: "Observations",
  Id_Site: "Site",
  Sonde_Numero_Serie: "Sensor",
  Consigne: "Consigne",
  Frequence: "Fréquence (min)",
  Consigne_Sup: "Consigne supérieure",
  Consigne_Inf: "Consigne inférieure",
  Retard_Alarme_Haut: "Retard alarme haut",
  Retard_Alarme_Bas: "Retard alarme bas",
  Retard_Non_Reponse: "Retard non-reponse",
  Retard_Alarme_Changement_Consigne: "Retard changement de consigne",
  Nb_Mesures_Temporisation_Redeclenchement: "Temporisation de redéclenchement",
  Derniere_Date_Etalonnage: "Date d'étalonnage appliquée",
  Erreur_Justesse: "Erreur de justesse",
  Incertitude: "Incertitude",
  Derive: "Dérive",
}

function formatAuditValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-"
  if (typeof value === "boolean") return value ? "Oui" : "Non"
  if (typeof value === "number" || typeof value === "bigint") return String(value)
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) {
    return value.length > 0 ? value.map((item) => formatAuditValue(item)).join(", ") : "-"
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

function buildMultiFieldAuditReason(changes: ChangedFieldEntry[], actionComment?: string): string {
  const lines = changes.map((change) => {
    const label = AUDIT_FIELD_LABELS[change.field] ?? change.field
    return `- ${label}: ${formatAuditValue(change.from)} -> ${formatAuditValue(change.to)}`
  })

  const changesBlock = ["Modifications:", ...lines].join("\n")
  if (actionComment && actionComment.trim().length > 0) {
    return `${actionComment.trim()}\n\n${changesBlock}`
  }
  return changesBlock
}


function addConsigneGuards(data: Record<string, unknown>, ctx: z.RefinementCtx) {
  const hasIdSite = Object.prototype.hasOwnProperty.call(data, "Id_Site")
  if (hasIdSite && (data.Id_Site === null || data.Id_Site === undefined)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Id_Site"],
      message: "Le site est requis.",
    })
  }

  const hasSonde = Object.prototype.hasOwnProperty.call(data, "Sonde_Numero_Serie")
  const hasLieuEtat = Object.prototype.hasOwnProperty.call(data, "Lieu_Etat")
  if (hasSonde && !data.Sonde_Numero_Serie && hasLieuEtat && data.Lieu_Etat !== "D") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Lieu_Etat"],
      message: "Sans sonde, la surveillance doit être désactivée.",
    })
  }

  const hasConsigne = data.Consigne !== null && data.Consigne !== undefined
  const hasSup = data.Consigne_Sup !== null && data.Consigne_Sup !== undefined
  const hasInf = data.Consigne_Inf !== null && data.Consigne_Inf !== undefined
  const hasSupPreAlarm = data.Consigne_Sup_Pre_Alarme !== null && data.Consigne_Sup_Pre_Alarme !== undefined
  const hasInfPreAlarm = data.Consigne_Inf_Pre_Alarme !== null && data.Consigne_Inf_Pre_Alarme !== undefined
  const supActive = (typeof data.Est_Consigne_Sup_Active === "boolean" ? data.Est_Consigne_Sup_Active : hasSup)
  const infActive = (typeof data.Est_Consigne_Inf_Active === "boolean" ? data.Est_Consigne_Inf_Active : hasInf)
  const supPreAlarmActive = typeof data.Est_Consigne_Sup_Pre_Alarme_Active === "boolean"
    ? data.Est_Consigne_Sup_Pre_Alarme_Active
    : hasSupPreAlarm
  const infPreAlarmActive = typeof data.Est_Consigne_Inf_Pre_Alarme_Active === "boolean"
    ? data.Est_Consigne_Inf_Pre_Alarme_Active
    : hasInfPreAlarm

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

  if (Object.prototype.hasOwnProperty.call(data, "Frequence") && data.Frequence !== null && data.Frequence !== undefined && Number(data.Frequence) <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Frequence"],
      message: "La fréquence de mesure doit être strictement supérieure à 0.",
    })
  }

  if (Object.prototype.hasOwnProperty.call(data, "Retard_Alarme_Haut") && data.Retard_Alarme_Haut !== null && data.Retard_Alarme_Haut !== undefined && Number(data.Retard_Alarme_Haut) <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Retard_Alarme_Haut"],
      message: "Le retard d'alarme haut doit être strictement supérieur à 0.",
    })
  }

  if (Object.prototype.hasOwnProperty.call(data, "Retard_Alarme_Bas") && data.Retard_Alarme_Bas !== null && data.Retard_Alarme_Bas !== undefined && Number(data.Retard_Alarme_Bas) <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Retard_Alarme_Bas"],
      message: "Le retard d'alarme bas doit être strictement supérieur à 0.",
    })
  }

  if (supActive && supPreAlarmActive && hasSup && hasSupPreAlarm && Number(data.Consigne_Sup_Pre_Alarme) >= Number(data.Consigne_Sup)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Consigne_Sup_Pre_Alarme"],
      message: "La pré-alarme supérieure doit être strictement inférieure à la consigne supérieure.",
    })
  }

  if (infActive && infPreAlarmActive && hasInf && hasInfPreAlarm && Number(data.Consigne_Inf_Pre_Alarme) <= Number(data.Consigne_Inf)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Consigne_Inf_Pre_Alarme"],
      message: "La pré-alarme inférieure doit être strictement supérieure à la consigne inférieure.",
    })
  }

  if (supPreAlarmActive && infPreAlarmActive && hasSupPreAlarm && hasInfPreAlarm && Number(data.Consigne_Inf_Pre_Alarme) >= Number(data.Consigne_Sup_Pre_Alarme)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Consigne_Inf_Pre_Alarme"],
      message: "La pré-alarme inférieure doit être strictement inférieure à la pré-alarme supérieure.",
    })
  }

  if (Object.prototype.hasOwnProperty.call(data, "Retard_Non_Reponse") && data.Retard_Non_Reponse !== null && data.Retard_Non_Reponse !== undefined && Number(data.Retard_Non_Reponse) <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Retard_Non_Reponse"],
      message: "Le retard de non-réponse doit être strictement supérieur à 0.",
    })
  }
}

const updateLieuSchema = z.object({
  Nom_Lieu: z.string().trim().min(1, "Nom du lieu requis").max(30, "Le nom du lieu ne peut pas depasser 30 caracteres.").optional(),
  Lieu_Etat: z.string().max(1).nullable().optional(),
  Commentaire: z.string().nullable().optional(),
  Observations_Info: z.string().nullable().optional(),
  Id_Site: z.number().nullable().optional(),
  GroupIds: z.array(z.number()).optional(),
  Sonde_Numero_Serie: z.string().nullable().optional(),
  Id_Module: z.number().nullable().optional(),
  Consigne: z.number().nullable().optional(),
  Frequence: z.number().nullable().optional(),
  Consigne_Sup: z.number().nullable().optional(),
  Tolerance_Surveillance_Sup: z.number().nullable().optional(),
  Est_Consigne_Sup_Active: z.boolean().optional(),
  Consigne_Sup_Pre_Alarme: z.number().nullable().optional(),
  Est_Consigne_Sup_Pre_Alarme_Active: z.boolean().optional(),
  Retard_Alarme_Haut: z.number().nullable().optional(),
  Consigne_Inf: z.number().nullable().optional(),
  Tolerance_Surveillance_Inf: z.number().nullable().optional(),
  Est_Consigne_Inf_Active: z.boolean().optional(),
  Consigne_Inf_Pre_Alarme: z.number().nullable().optional(),
  Est_Consigne_Inf_Pre_Alarme_Active: z.boolean().optional(),
  Retard_Alarme_Bas: z.number().nullable().optional(),
  Retard_Non_Reponse: z.number().nullable().optional(),
  Retard_Alarme_Changement_Consigne: z.number().nullable().optional(),
  Nb_Mesures_Temporisation_Redeclenchement: z.number().int().min(0).nullable().optional(),
  Est_Archive: z.boolean().optional(),
  surveillanceDurationMinutes: z.number().int().positive().nullable().optional(),
  EMT_Mode: z.string().nullable().optional(),
  EMT_Valeur: z.number().nullable().optional(),
  Corriger_Erreur_Justesse: z.boolean().optional(),
  Prendre_En_Compte_Derive: z.boolean().optional(),
  Unite: z.string().nullable().optional(),
  Derniere_Date_Etalonnage: z.string().nullable().optional(),
  Applied_Etalonnage_Id: z.number().int().positive().nullable().optional(),
  Erreur_Justesse: z.number().nullable().optional(),
  Incertitude: z.number().nullable().optional(),
  Derive: z.number().nullable().optional(),
  MailingContacts: z.array(mailingContactSchema).optional(),
  Apply_Mailing_To_Groups: z.boolean().optional(),
  Est_Son_Alarme_Active: z.boolean().optional(),
  Commentaire_Action: z.string().trim().max(500).nullable().optional(),
}).superRefine(addConsigneGuards)


function normalizeMailingContacts(contacts: Array<{
  Numero_Ordre?: number | null
  Id_Utilisateur?: number | null
  Est_Via_Telephone?: boolean | null
  Est_Via_Email?: boolean | null
}> | undefined) {
  if (!contacts) return [] as Array<{
    Numero_Ordre: number
    Id_Utilisateur: number
    Est_Via_Telephone: boolean
    Est_Via_Email: boolean
  }>

  return contacts
    .map((contact, index) => ({
      Numero_Ordre: contact.Numero_Ordre ?? index + 1,
      Id_Utilisateur: contact.Id_Utilisateur ?? null,
      Est_Via_Telephone: !!contact.Est_Via_Telephone,
      Est_Via_Email: !!contact.Est_Via_Email,
    }))
    .filter((contact) => contact.Id_Utilisateur !== null && (contact.Est_Via_Email || contact.Est_Via_Telephone))
    .map((contact) => ({
      Numero_Ordre: contact.Numero_Ordre,
      Id_Utilisateur: contact.Id_Utilisateur as number,
      Est_Via_Telephone: contact.Est_Via_Telephone,
      Est_Via_Email: contact.Est_Via_Email,
    }))
}

function isMissingLieuGsoColumnError(error: unknown) {
  if (!error || typeof error !== "object") return false
  const err = error as { code?: string; meta?: { column?: string } }
  if (err.code !== "P2022") return false
  const column = err.meta?.column ?? ""
  return column.includes("Est_Lieu_GSO") || column.includes("Adresse_Sonde") || column.includes("Observations_Info")
}

const LOCATION_UPDATE_CODES = Array.from(
  new Set([
    ...getPermissionAliases("LOCATION_CONFIG_ACCESS"),
    ...getPermissionAliases("LOCATION_DISABLE_ACCESS"),
  ]),
)

export const PATCH = withAnyAuthorizationLogging(
  LOCATION_UPDATE_CODES,
  async (req: NextRequest, { user }, { params }: { params: Promise<{ id: string }> }) => {

    try {
      const { id: idParam } = await params
      const lieuId = parseInt(idParam)

      if (!lieuId) {
        return apiError(400, "invalid_id", "ID lieu requis")
      }

      const body = await req.json()
      const metrologyGuard = await requireStandardOrExpertIfFieldsUsed(body as Record<string, unknown>, STANDARD_METROLOGY_FIELDS)
      if (metrologyGuard) return metrologyGuard

      const validated = updateLieuSchema.parse(body)
      const appliedCalibrationDate = parseAppliedCalibrationDate(validated.Derniere_Date_Etalonnage)
      const appliedCalibrationId = validated.Applied_Etalonnage_Id ?? null

      const shouldUpdateGroups =
        Object.prototype.hasOwnProperty.call(body, "GroupIds")

      const shouldArchive = validated.Est_Archive === true
      const groupIds = shouldUpdateGroups
        ? Array.from(
            new Set(
              [...(validated.GroupIds ?? [])].filter((v): v is number => typeof v === "number" && !Number.isNaN(v)),
            ),
          )
        : undefined

      const {
        GroupIds,
        Lieu_Etat,
        Id_Site,
        Sonde_Numero_Serie,
        Id_Module,
        surveillanceDurationMinutes,
        MailingContacts,
        EMT_Mode,
        EMT_Valeur,
        Corriger_Erreur_Justesse,
        Prendre_En_Compte_Derive,
        Unite,
        Erreur_Justesse,
        Incertitude,
        Derive,
        Applied_Etalonnage_Id,
        Commentaire_Action,
        ...lieuPatchRest
      } = validated
      // Cast to Record<string, unknown> so derived DB columns (_Base, EMT_*, Est_Correction_*)
      // can be added without TypeScript narrowing to the Zod schema type.
      const lieuPatch: Record<string, unknown> = { ...lieuPatchRest }

      const actionComment = typeof Commentaire_Action === "string" ? Commentaire_Action.trim() : ""
      const shouldCheckActionComment = Object.prototype.hasOwnProperty.call(body, "Commentaire_Action")
      if (shouldCheckActionComment) {
        const requireActionComment = await isSurveillanceActionCommentRequired()
        if (requireActionComment && actionComment.length === 0) {
          return apiError(400, "missing_action_comment", "Le commentaire est obligatoire pour cette action")
        }
      }

      if (Object.prototype.hasOwnProperty.call(validated, "Frequence")) {
        const value = validated.Frequence
        lieuPatch.Frequence = value === null || value === undefined ? value : Math.round(value * 60)
      }

      if (Object.prototype.hasOwnProperty.call(validated, "Nb_Mesures_Temporisation_Redeclenchement")) {
        const value = validated.Nb_Mesures_Temporisation_Redeclenchement
        lieuPatch.Nb_Mesures_Temporisation_Redeclenchement = value == null ? 0 : Math.max(0, Math.trunc(value))
      }

      if (Object.prototype.hasOwnProperty.call(validated, "Erreur_Justesse")) {
        lieuPatch.Derniere_Erreur_Justesse = validated.Erreur_Justesse ?? null
      }

      if (Object.prototype.hasOwnProperty.call(validated, "Incertitude")) {
        lieuPatch.Derniere_Incertitude = validated.Incertitude ?? null
      }

      if (Object.prototype.hasOwnProperty.call(validated, "Derive")) {
        lieuPatch.Derive = validated.Derive ?? null
      }

      if (Object.prototype.hasOwnProperty.call(validated, "Unite")) {
        lieuPatch.Derniere_Unite = validated.Unite ?? null
      }

      if (appliedCalibrationDate !== undefined) {
        lieuPatch.Derniere_Date_Etalonnage = appliedCalibrationDate
      }

      const includeDeriveInUncertainty =
        validated.EMT_Mode === "quart" || validated.EMT_Mode === "manuel"
          ? true
          : (validated.Prendre_En_Compte_Derive ?? false)

      const emt = computeEmt({
        mode: validated.EMT_Mode,
        emtValue: validated.EMT_Valeur,
        consigne: validated.Consigne,
        consigneSup: validated.Consigne_Sup,
        consigneInf: validated.Consigne_Inf,
        isConsigneSupActive: validated.Est_Consigne_Sup_Active,
        isConsigneInfActive: validated.Est_Consigne_Inf_Active,
        incertitude: validated.Incertitude,
        erreurJustesse: validated.Erreur_Justesse,
        derive: validated.Derive,
        includeDeriveInUncertainty,
        correctAccuracyError: validated.Corriger_Erreur_Justesse ?? false,
      })

      if (validated.EMT_Mode === "quart" || validated.EMT_Mode === "manuel") {
        lieuPatch.Tolerance_Surveillance_Sup = emt.toleranceSup
        lieuPatch.Tolerance_Surveillance_Sup_Base = emt.toleranceSup ?? null
        lieuPatch.Tolerance_Surveillance_Inf = emt.toleranceInf
        lieuPatch.Tolerance_Surveillance_Inf_Base = emt.toleranceInf ?? null
      } else if (validated.EMT_Mode === "sans-objet") {
        lieuPatch.Tolerance_Surveillance_Sup = (validated.Est_Consigne_Sup_Active ?? false) ? validated.Consigne_Sup : null
        lieuPatch.Tolerance_Surveillance_Sup_Base = (validated.Est_Consigne_Sup_Active ?? false) ? (validated.Consigne_Sup ?? null) : null
        lieuPatch.Tolerance_Surveillance_Inf = (validated.Est_Consigne_Inf_Active ?? false) ? validated.Consigne_Inf : null
        lieuPatch.Tolerance_Surveillance_Inf_Base = (validated.Est_Consigne_Inf_Active ?? false) ? (validated.Consigne_Inf ?? null) : null
      } else {
        // For non-EMT modes, mirror Tolerance_Surveillance_Sup/Inf to Base if they were explicitly sent
        if (Object.prototype.hasOwnProperty.call(validated, "Tolerance_Surveillance_Sup")) {
          lieuPatch.Tolerance_Surveillance_Sup_Base = validated.Tolerance_Surveillance_Sup ?? null
        }
        if (Object.prototype.hasOwnProperty.call(validated, "Tolerance_Surveillance_Inf")) {
          lieuPatch.Tolerance_Surveillance_Inf_Base = validated.Tolerance_Surveillance_Inf ?? null
        }
      }

      // Mirror consigne changes to Base columns
      if (Object.prototype.hasOwnProperty.call(validated, "Consigne")) {
        lieuPatch.Consigne_Base = validated.Consigne ?? null
      }
      if (Object.prototype.hasOwnProperty.call(validated, "Consigne_Sup")) {
        lieuPatch.Consigne_Sup_Base = validated.Consigne_Sup ?? null
      }
      if (Object.prototype.hasOwnProperty.call(validated, "Consigne_Inf")) {
        lieuPatch.Consigne_Inf_Base = validated.Consigne_Inf ?? null
      }

      if (Object.prototype.hasOwnProperty.call(validated, "EMT_Mode") || Object.prototype.hasOwnProperty.call(validated, "EMT_Valeur")) {
        lieuPatch.EMT_Choix_Mode = emtModeToDb(validated.EMT_Mode)
        lieuPatch.EMT_Sonde = emt.emtSonde
      }

      if (Object.prototype.hasOwnProperty.call(validated, "Corriger_Erreur_Justesse")) {
        lieuPatch.Est_Correction_Ej = validated.Corriger_Erreur_Justesse ? 1 : 0
      }

      if (
        Object.prototype.hasOwnProperty.call(validated, "Prendre_En_Compte_Derive") ||
        Object.prototype.hasOwnProperty.call(validated, "EMT_Mode")
      ) {
        lieuPatch.Est_Correction_derive = includeDeriveInUncertainty
      }

      const hasLieuEtat = Object.prototype.hasOwnProperty.call(validated, "Lieu_Etat")
      const applyLieuEtat = hasLieuEtat && !shouldArchive
      const hasSurveillanceDuration = Object.prototype.hasOwnProperty.call(
        validated,
        "surveillanceDurationMinutes",
      )
      const shouldScheduleSurveillanceReactivation =
        applyLieuEtat &&
        Lieu_Etat === "D" &&
        hasSurveillanceDuration &&
        typeof surveillanceDurationMinutes === "number" &&
        surveillanceDurationMinutes > 0

      const surveillanceReactivationAt = shouldScheduleSurveillanceReactivation
        ? await getDbDatePlusMinutes(prisma, surveillanceDurationMinutes)
        : null
      const surveillanceStateChangedAt = applyLieuEtat
        ? await getDbNow(prisma)
        : null

      const shouldUpdateMailingContacts = Object.prototype.hasOwnProperty.call(body, "MailingContacts")
      const mailingContacts = shouldUpdateMailingContacts ? normalizeMailingContacts(MailingContacts) : []
      const applyMailingToGroups = validated.Apply_Mailing_To_Groups === true
      let mailingPropagationTargetIds: number[] = []

      const hasIdSite = Object.prototype.hasOwnProperty.call(validated, "Id_Site")
      const hasSondeNumeroSerie = Object.prototype.hasOwnProperty.call(validated, "Sonde_Numero_Serie")
      const hasIdModule = Object.prototype.hasOwnProperty.call(validated, "Id_Module")

      const currentLieuForRange = await prisma.t_lieu.findUnique({
        where: { Id_Lieu: lieuId },
        select: { Sonde_Numero_Serie: true },
      })
      if (!currentLieuForRange) {
        return apiError(404, "not_found", "Lieu introuvable")
      }

      const effectiveSensorSerialForRange = hasSondeNumeroSerie
        ? (validated.Sonde_Numero_Serie?.trim() || null)
        : (currentLieuForRange.Sonde_Numero_Serie?.trim() || null)

      const sensorTypeRange = await getSensorTypeValueRangeBySerial(effectiveSensorSerialForRange)
      const rangeIssues = buildLocationValueRangeIssues(validated, sensorTypeRange)
      if (rangeIssues.length > 0) {
        return apiError(400, "validation_error", "Validation impossible", { issues: rangeIssues })
      }

      const ip = getClientIp(req)
      let previousLieuEtat: string | null = null
      let lieuName: string | null = null
      let previousSoundActive: boolean | null = null
      let previousValues: Record<string, unknown> = {}

      const lieu = await prisma.$transaction(async (tx) => {
        const current = await tx.t_lieu.findUnique({
          where: { Id_Lieu: lieuId },
          select: {
            Sonde_Numero_Serie: true,
            Lieu_Etat: true,
            Nom_Lieu: true,
            Adresse_Sonde: true,
            Est_Lieu_GSO: true,
            Est_Son_Alarme_Active: true,
            Date_Heure_Surveillance_On: true,
            Date_Heure_Surveillance_Off: true,
            Commentaire: true,
            Observations_Info: true,
            Id_Site: true,
            Consigne: true,
            Frequence: true,
            Consigne_Sup: true,
            Consigne_Inf: true,
            Retard_Alarme_Haut: true,
            Retard_Alarme_Bas: true,
            Retard_Non_Reponse: true,
            Retard_Alarme_Changement_Consigne: true,
            Nb_Mesures_Temporisation_Redeclenchement: true,
            Derniere_Erreur_Justesse: true,
            Derniere_Incertitude: true,
            Derive: true,
            Derniere_Date_Etalonnage: true,
          },
        })

        previousLieuEtat = current?.Lieu_Etat ?? null
        lieuName = current?.Nom_Lieu ?? null
        previousSoundActive = current?.Est_Son_Alarme_Active ?? null
        previousValues = {
          Nom_Lieu: current?.Nom_Lieu,
          Commentaire: current?.Commentaire,
          Observations_Info: current?.Observations_Info,
          Id_Site: current?.Id_Site,
          Sonde_Numero_Serie: current?.Sonde_Numero_Serie,
          Consigne: current?.Consigne,
          Frequence: current?.Frequence !== null && current?.Frequence !== undefined ? Number(current.Frequence) / 60 : current?.Frequence,
          Consigne_Sup: current?.Consigne_Sup,
          Consigne_Inf: current?.Consigne_Inf,
          Retard_Alarme_Haut: current?.Retard_Alarme_Haut,
          Retard_Alarme_Bas: current?.Retard_Alarme_Bas,
          Retard_Non_Reponse: current?.Retard_Non_Reponse,
          Retard_Alarme_Changement_Consigne: current?.Retard_Alarme_Changement_Consigne,
          Nb_Mesures_Temporisation_Redeclenchement: current?.Nb_Mesures_Temporisation_Redeclenchement,
          Erreur_Justesse: current?.Derniere_Erreur_Justesse,
          Incertitude: current?.Derniere_Incertitude,
          Derive: current?.Derive,
          Derniere_Date_Etalonnage: current?.Derniere_Date_Etalonnage,
        }

        if (validated.Nom_Lieu !== undefined) {
          const existingLocation = await findLocationNameConflict(tx, validated.Nom_Lieu, lieuId)
          if (existingLocation) {
            throw new Error("location_name_conflict")
          }
        }

        let nextEstLieuGso: boolean | undefined
        let nextAdresseSonde: string | null | undefined

        if (shouldArchive) {
          nextEstLieuGso = false
          nextAdresseSonde = null
        } else if (hasSondeNumeroSerie) {
          if (Sonde_Numero_Serie) {
            const sondeInfo = await tx.t_sonde.findUnique({
              where: { Sonde_Numero_Serie },
              select: { Est_Sonde_GSO: true, Adresse_Sonde: true },
            })

            const isGso = sondeInfo?.Est_Sonde_GSO ?? isGsoType(Sonde_Numero_Serie)
            nextEstLieuGso = isGso
            nextAdresseSonde = isGso
              ? (sondeInfo?.Adresse_Sonde?.trim() || current?.Adresse_Sonde || extractAddressFromSerial(Sonde_Numero_Serie))
              : null
          } else {
            nextEstLieuGso = false
            nextAdresseSonde = null
          }
        }

        const normalizedObservation =
          Object.prototype.hasOwnProperty.call(validated, "Observations_Info")
            ? validated.Observations_Info ?? null
            : Object.prototype.hasOwnProperty.call(validated, "Commentaire")
            ? validated.Commentaire ?? null
            : undefined

        if (normalizedObservation !== undefined) {
          lieuPatch.Commentaire = normalizedObservation
          lieuPatch.Observations_Info = normalizedObservation
        }

        const effectiveEstLieuGso = nextEstLieuGso ?? current?.Est_Lieu_GSO ?? false
        if (effectiveEstLieuGso) {
          lieuPatch.Frequence = GSO_FIXED_FREQUENCY_SECONDS
        }

        const effectiveSerial = hasSondeNumeroSerie
          ? (Sonde_Numero_Serie ?? null)
          : (current?.Sonde_Numero_Serie ?? null)
        const effectiveEstLieuGsp =
          !effectiveEstLieuGso &&
          !!effectiveSerial &&
          getSensorFamilyFromSerial(effectiveSerial) === "GSP"
        if (effectiveEstLieuGsp) {
          lieuPatch.Infos_Modifiees_Depuis_Derniere_Mesure = true
        }

        const effectiveLieuEtat = hasSondeNumeroSerie && !Sonde_Numero_Serie ? "D" : Lieu_Etat
        const shouldApplySurveillanceState = applyLieuEtat || (hasSondeNumeroSerie && !Sonde_Numero_Serie)
        const surveillanceStateHasChanged = shouldApplySurveillanceState && current?.Lieu_Etat !== effectiveLieuEtat

        const baseData = {
          ...lieuPatch,
          ...(shouldApplySurveillanceState
            ? {
                t_etat_surveillance: effectiveLieuEtat
                  ? { connect: { Surveillance_Etat: effectiveLieuEtat } }
                  : { disconnect: true },
                Date_Heure_Reactivation_Surveillance:
                  effectiveLieuEtat === "D" ? surveillanceReactivationAt : null,
                ...(surveillanceStateHasChanged
                  ? {
                      ...(effectiveLieuEtat === "S"
                        ? { Date_Heure_Derniere_Reponse: null }
                        : {}),
                      Date_Heure_Surveillance_On: effectiveLieuEtat === "S" ? surveillanceStateChangedAt : current?.Date_Heure_Surveillance_On,
                      Date_Heure_Surveillance_Off: effectiveLieuEtat === "D" ? surveillanceStateChangedAt : null,
                    }
                  : {}),
              }
            : {}),
          ...(shouldArchive
            ? {
                t_etat_surveillance: { connect: { Surveillance_Etat: "D" } },
                Date_Heure_Reactivation_Surveillance: null,
                t_sonde: { disconnect: true },
              }
            : {}),
          ...(hasIdSite
            ? Id_Site
              ? { t_site: { connect: { Id_Site } } }
              : { t_site: { disconnect: true } }
            : {}),
          ...(hasSondeNumeroSerie
            ? Sonde_Numero_Serie
              ? { t_sonde: { connect: { Sonde_Numero_Serie } } }
              : { t_sonde: { disconnect: true } }
            : {}),
        }

        const gsoData =
          nextEstLieuGso !== undefined
            ? { Est_Lieu_GSO: nextEstLieuGso, Adresse_Sonde: nextAdresseSonde ?? null }
            : {}

        let updated
        try {
          updated = await tx.t_lieu.update({
            where: { Id_Lieu: lieuId },
            data: {
              ...baseData,
              ...gsoData,
            },
          })
        } catch (error) {
          if (!isMissingLieuGsoColumnError(error)) {
            throw error
          }

          updated = await tx.t_lieu.update({
            where: { Id_Lieu: lieuId },
            data: baseData,
          })
        }

        if (shouldApplySurveillanceState) {
          const sondeNumeroSerie = hasSondeNumeroSerie
            ? (validated.Sonde_Numero_Serie ?? null)
            : (current?.Sonde_Numero_Serie ?? null)
          if (sondeNumeroSerie) {
            await tx.t_sonde.updateMany({
              where: { Sonde_Numero_Serie: sondeNumeroSerie },
              data: { Surveillance_Etat: updated.Lieu_Etat ?? "D" },
            })
          }
        }

        if (hasSondeNumeroSerie && !shouldArchive) {
          const currentSonde = current?.Sonde_Numero_Serie ?? null
          const nextSonde = validated.Sonde_Numero_Serie ?? null

          if (currentSonde && currentSonde !== nextSonde) {
            await tx.t_sonde.updateMany({
              where: { Sonde_Numero_Serie: currentSonde },
              data: { Surveillance_Etat: "D" },
            })
          }
        }

        if (shouldArchive) {
          const sondeNumeroSerie = current?.Sonde_Numero_Serie ?? null
          if (sondeNumeroSerie) {
            await tx.t_sonde.updateMany({
              where: { Sonde_Numero_Serie: sondeNumeroSerie },
              data: { Surveillance_Etat: "D" },
            })
          }
        }

        if (groupIds !== undefined) {
          await tx.t_lieu_groupe.deleteMany({ where: { Id_Lieu: lieuId } })
          if (groupIds.length > 0) {
            await tx.t_lieu_groupe.createMany({
              data: groupIds.map((Id_Groupe) => ({ Id_Lieu: lieuId, Id_Groupe })),
            })
          }
        }

        if (shouldUpdateMailingContacts) {
          await tx.t_lieu_mail_tel.deleteMany({ where: { Id_Lieu: lieuId } })
          if (mailingContacts.length > 0) {
            await tx.t_lieu_mail_tel.createMany({
              data: mailingContacts.map((contact) => ({
                Id_Lieu: lieuId,
                Ordre_Contact: contact.Numero_Ordre,
                Id_Utilisateur: contact.Id_Utilisateur,
                Est_Via_Telephone: contact.Est_Via_Telephone,
                Est_Via_Email: contact.Est_Via_Email,
              })),
            })
          }

          if (applyMailingToGroups) {
            const effectiveGroupIds = groupIds !== undefined
              ? groupIds
              : (await tx.t_lieu_groupe.findMany({
                  where: { Id_Lieu: lieuId },
                  select: { Id_Groupe: true },
                })).map((row) => row.Id_Groupe)

            if (effectiveGroupIds.length > 0) {
              const groupLocations = await tx.t_lieu_groupe.findMany({
                where: {
                  Id_Groupe: { in: effectiveGroupIds },
                  Id_Lieu: { not: lieuId },
                },
                select: { Id_Lieu: true },
              })
              mailingPropagationTargetIds = Array.from(new Set(groupLocations.map((row) => row.Id_Lieu)))

              if (mailingPropagationTargetIds.length > 0) {
                await tx.t_lieu_mail_tel.deleteMany({
                  where: { Id_Lieu: { in: mailingPropagationTargetIds } },
                })
                if (mailingContacts.length > 0) {
                  await tx.t_lieu_mail_tel.createMany({
                    data: mailingPropagationTargetIds.flatMap((targetLieuId) =>
                      mailingContacts.map((contact) => ({
                        Id_Lieu: targetLieuId,
                        Ordre_Contact: contact.Numero_Ordre,
                        Id_Utilisateur: contact.Id_Utilisateur,
                        Est_Via_Telephone: contact.Est_Via_Telephone,
                        Est_Via_Email: contact.Est_Via_Email,
                      })),
                    ),
                  })
                }
              }
            }
          }
        }

        if (hasIdModule) {
          const targetSondeNumeroSerie =
            hasSondeNumeroSerie
              ? (Sonde_Numero_Serie ?? null)
              : (current?.Sonde_Numero_Serie ?? null)

          if (targetSondeNumeroSerie) {
            let modulePortSerie: string | null = null
            if (Id_Module !== null && Id_Module !== undefined) {
              const moduleRecord = await tx.t_module.findUnique({
                where: { Id_Module },
                select: { Port_Serie: true },
              })
              if (!moduleRecord) {
                throw new Error("invalid_module")
              }
              modulePortSerie = moduleRecord.Port_Serie ?? null
            }

            await tx.t_sonde.updateMany({
              where: { Sonde_Numero_Serie: targetSondeNumeroSerie },
              data: {
                Id_Module: Id_Module ?? null,
                Port_Serie: modulePortSerie,
              },
            })
          }
        }

        return updated
      })

      const serialized = JSON.parse(
        JSON.stringify(lieu, (_, value) => (typeof value === "bigint" ? value.toString() : value)),
      ) as typeof lieu

      const normalized = {
        ...serialized,
        Commentaire: serialized?.Observations_Info ?? serialized?.Commentaire ?? null,
        EMT_Mode: emtModeFromDb(serialized?.EMT_Choix_Mode),
        EMT_Valeur: serialized?.EMT_Sonde ?? null,
        Corriger_Erreur_Justesse: serialized?.Est_Correction_Ej === 1,
        Prendre_En_Compte_Derive: serialized?.Est_Correction_derive ?? false,
        Erreur_Justesse: serialized?.Derniere_Erreur_Justesse ?? null,
        Incertitude: serialized?.Derniere_Incertitude ?? null,
        Frequence:
          serialized?.Frequence === null || serialized?.Frequence === undefined
            ? serialized?.Frequence
            : Number(serialized.Frequence) / 60,
        MailingContacts: shouldUpdateMailingContacts ? mailingContacts : undefined,
        Apply_Mailing_To_Groups: false,
      }

      if (mailingPropagationTargetIds.length > 0) {
        log.audit("CC", {
          user: user.username,
          userId: user.userId,
          userProfile: user.profile,
          ip,
          resource: `Lieu: ${lieuName ?? lieuId} (Mailing groupe)`,
          resourceId: lieuId,
          lieuId,
          changes: {
            action: "mailing_apply_to_groups",
            contactsCount: mailingContacts.length,
            affectedLocationsCount: mailingPropagationTargetIds.length,
            affectedLocationIds: mailingPropagationTargetIds,
          },
        })
      }

      if (hasLieuEtat && user && typeof Lieu_Etat === "string" && previousLieuEtat !== Lieu_Etat) {
        const baseReason =
          Lieu_Etat === "D"
            ? shouldScheduleSurveillanceReactivation
              ? `Désactivation ${surveillanceDurationMinutes} min`
              : "Désactivation manuelle"
            : "Réactivation manuelle"

        const reason = actionComment || baseReason

        log.audit(Lieu_Etat === "D" ? "DES" : "ACT", {
          user: user.username,
          userId: user.userId,
          ip,
          userProfile: user.profile,
          resource: `Lieu: ${lieuName ?? lieuId}`,
          resourceId: lieuId,
          lieuId,
          reason,
        })
      }

      // Log sound change
      const hasSoundField = Object.prototype.hasOwnProperty.call(validated, "Est_Son_Alarme_Active")
      if (hasSoundField && user && validated.Est_Son_Alarme_Active !== undefined && previousSoundActive !== validated.Est_Son_Alarme_Active) {
        if (validated.Est_Son_Alarme_Active) {
          log.lieu.soundOn(
            lieuName ?? String(lieuId),
            lieuId,
            user.username,
            user.userId,
            ip,
            actionComment || undefined,
          )
        } else {
          log.lieu.soundOff(
            lieuName ?? String(lieuId),
            lieuId,
            user.username,
            user.userId,
            ip,
            actionComment || undefined,
          )
        }
      }

      const hasCalibrationApplicationSignal =
        Object.prototype.hasOwnProperty.call(body, "Applied_Etalonnage_Id") &&
        Applied_Etalonnage_Id !== null &&
        Applied_Etalonnage_Id !== undefined

      if (user && hasCalibrationApplicationSignal) {
        log.audit("ETAP", {
          user: user.username,
          userId: user.userId,
          ip,
          userProfile: user.profile,
          resource: `Lieu: ${lieuName ?? lieuId}`,
          resourceId: lieuId,
          lieuId,
          reason: actionComment || "Application manuelle d'étalonnage",
          changes: {
            appliedCalibrationId,
            appliedCalibrationDate,
            unit: validated.Unite ?? null,
            accuracyError: validated.Erreur_Justesse ?? null,
            uncertainty: validated.Incertitude ?? null,
            drift: validated.Derive ?? null,
          },
        })
      }

      // Log field changes using existing audit codes where they have a specific meaning.
      if (user) {
        const changedFieldsEntries: ChangedFieldEntry[] = []

        const trackChange = (field: string, fromValue: unknown, toValue: unknown) => {
          if (fromValue !== toValue) {
            changedFieldsEntries.push({ field, from: fromValue, to: toValue })
          }
        }

        if (Object.prototype.hasOwnProperty.call(body, "Sonde_Numero_Serie")) {
          trackChange("Sonde_Numero_Serie", previousValues.Sonde_Numero_Serie, Sonde_Numero_Serie)
        }
        if (Object.prototype.hasOwnProperty.call(body, "Frequence")) {
          trackChange("Frequence", previousValues.Frequence, validated.Frequence)
        }
        if (Object.prototype.hasOwnProperty.call(body, "Retard_Alarme_Haut")) {
          trackChange("Retard_Alarme_Haut", previousValues.Retard_Alarme_Haut, validated.Retard_Alarme_Haut)
        }
        if (Object.prototype.hasOwnProperty.call(body, "Retard_Alarme_Bas")) {
          trackChange("Retard_Alarme_Bas", previousValues.Retard_Alarme_Bas, validated.Retard_Alarme_Bas)
        }
        if (Object.prototype.hasOwnProperty.call(body, "Retard_Non_Reponse")) {
          trackChange("Retard_Non_Reponse", previousValues.Retard_Non_Reponse, validated.Retard_Non_Reponse)
        }
        if (Object.prototype.hasOwnProperty.call(body, "Retard_Alarme_Changement_Consigne")) {
          trackChange(
            "Retard_Alarme_Changement_Consigne",
            previousValues.Retard_Alarme_Changement_Consigne,
            validated.Retard_Alarme_Changement_Consigne,
          )
        }

        const TRACKED_FIELDS = [
          "Nom_Lieu",
          "Commentaire",
          "Observations_Info",
          "Id_Site",
          "Consigne",
          "Consigne_Sup",
          "Consigne_Inf",
          "Retard_Non_Reponse",
          "Retard_Alarme_Changement_Consigne",
          "Nb_Mesures_Temporisation_Redeclenchement",
          "Erreur_Justesse",
          "Incertitude",
          "Derive",
          "Derniere_Date_Etalonnage",
        ] as const

        for (const field of TRACKED_FIELDS) {
          if (Object.prototype.hasOwnProperty.call(body, field) && previousValues[field] !== undefined) {
            const newValue = (validated as Record<string, unknown>)[field]
            trackChange(field, previousValues[field], newValue)
          }
        }

        if (changedFieldsEntries.length === 1) {
          const singleChange = changedFieldsEntries[0]

          if (singleChange.field === "Sonde_Numero_Serie") {
            log.config.changeSensor(
              lieuName ?? String(lieuId),
              lieuId,
              user.username,
              user.userId,
              ip,
              String(singleChange.from ?? ""),
              String(singleChange.to ?? ""),
            )
          } else if (singleChange.field === "Frequence") {
            log.config.changeFrequency(
              `Lieu: ${lieuName ?? lieuId}`,
              lieuId,
              user.username,
              user.userId,
              ip,
              singleChange.from,
              singleChange.to,
            )
          } else if (singleChange.field === "Retard_Alarme_Haut") {
            log.config.changeAlarmDelay(
              `Lieu: ${lieuName ?? lieuId} (Haut)`,
              lieuId,
              user.username,
              user.userId,
              ip,
              singleChange.from,
              singleChange.to,
            )
          } else if (singleChange.field === "Retard_Alarme_Bas") {
            log.config.changeAlarmDelay(
              `Lieu: ${lieuName ?? lieuId} (Bas)`,
              lieuId,
              user.username,
              user.userId,
              ip,
              singleChange.from,
              singleChange.to,
            )
          } else {
            log.audit("CC", {
              user: user.username,
              userId: user.userId,
              userProfile: user.profile,
              ip,
              resource: `Lieu: ${lieuName ?? lieuId} (Modification)`,
              changes: {
                action: "update",
                [singleChange.field]: {
                  from: singleChange.from,
                  to: singleChange.to,
                },
              },
              reason: actionComment || undefined,
              lieuId,
            })
          }
        } else if (changedFieldsEntries.length > 1) {
          const changedFields = changedFieldsEntries.reduce<Record<string, unknown>>((acc, entry) => {
            acc[entry.field] = { from: entry.from, to: entry.to }
            return acc
          }, {})

          log.audit("CC", {
            user: user.username,
            userId: user.userId,
            userProfile: user.profile,
            ip,
            resource: `Lieu: ${lieuName ?? lieuId} (Modification)`,
            changes: { action: "update", ...changedFields },
            reason: buildMultiFieldAuditReason(changedFieldsEntries, actionComment || undefined),
            lieuId,
          })
        }
      }

      // EMT cascade: recalculate tolerances for all active planning rules if EMT params changed
      const emtFieldsChanged =
        Object.prototype.hasOwnProperty.call(validated, "EMT_Mode") ||
        Object.prototype.hasOwnProperty.call(validated, "EMT_Valeur") ||
        Object.prototype.hasOwnProperty.call(validated, "Erreur_Justesse") ||
        Object.prototype.hasOwnProperty.call(validated, "Incertitude") ||
        Object.prototype.hasOwnProperty.call(validated, "Derive") ||
        Object.prototype.hasOwnProperty.call(validated, "Corriger_Erreur_Justesse") ||
        Object.prototype.hasOwnProperty.call(validated, "Prendre_En_Compte_Derive") ||
        Object.prototype.hasOwnProperty.call(validated, "Est_Consigne_Sup_Active") ||
        Object.prototype.hasOwnProperty.call(validated, "Est_Consigne_Inf_Active")

      if (emtFieldsChanged) {
        const planningRegles = await prisma.t_lieu_planning_regle.findMany({
          where: { Id_Lieu: lieuId, Actif: true },
        })
        if (planningRegles.length > 0) {
          // Reload updated lieu for current EMT params
          const updatedLieu = await prisma.t_lieu.findUnique({
            where: { Id_Lieu: lieuId },
            select: {
              EMT_Choix_Mode: true,
              EMT: true,
              Derniere_Erreur_Justesse: true,
              Derniere_Incertitude: true,
              Derive: true,
              Est_Correction_Ej: true,
              Est_Correction_derive: true,
              Est_Consigne_Sup_Active: true,
              Est_Consigne_Inf_Active: true,
            },
          })
          if (updatedLieu) {
            const emtMode = emtModeFromDb(updatedLieu.EMT_Choix_Mode)
            await Promise.all(
              planningRegles.map((regle) => {
                const emt = computeEmt({
                  mode: emtMode,
                  emtValue: updatedLieu.EMT,
                  consigne: regle.Consigne ?? null,
                  consigneSup: regle.Consigne_Sup,
                  consigneInf: regle.Consigne_Inf,
                  isConsigneSupActive: updatedLieu.Est_Consigne_Sup_Active ?? false,
                  isConsigneInfActive: updatedLieu.Est_Consigne_Inf_Active ?? false,
                  incertitude: updatedLieu.Derniere_Incertitude,
                  erreurJustesse: updatedLieu.Derniere_Erreur_Justesse,
                  derive: updatedLieu.Derive,
                  includeDeriveInUncertainty: updatedLieu.Est_Correction_derive ?? false,
                  correctAccuracyError: updatedLieu.Est_Correction_Ej === 1,
                })
                return prisma.t_lieu_planning_regle.update({
                  where: { Id_Regle: regle.Id_Regle },
                  data: {
                    Tolerance_Sup_Calc: emt.toleranceSup,
                    Tolerance_Inf_Calc: emt.toleranceInf,
                  },
                })
              }),
            )
          }
        }
      }

      try {
        await syncGspLocationConfiguration({
          source: "update",
          idLieu: lieuId,
          serial: normalized?.Sonde_Numero_Serie ?? null,
          highLimit: normalized?.Tolerance_Surveillance_Sup ?? null,
          lowLimit: normalized?.Tolerance_Surveillance_Inf ?? null,
          frequencySeconds:
            lieu?.Frequence === null || lieu?.Frequence === undefined
              ? null
              : Number(lieu.Frequence),
          highDelayMinutes: normalized?.Retard_Alarme_Haut ?? null,
          lowDelayMinutes: normalized?.Retard_Alarme_Bas ?? null,
        })
      } catch (error) {
        log.warn("lieux", "gsp_update_sync_failed", {
          lieuId,
          serial: normalized?.Sonde_Numero_Serie ?? null,
          error,
        })
      }

      clearLocationCache(lieuId)
      return apiOk(normalized)
    } catch (error) {
      if (error instanceof Error && error.message === "location_name_conflict") {
        return apiError(409, "location_name_conflict", "Un lieu avec le meme nom existe deja.")
      }
      if (error instanceof Error && error.message === "invalid_module") {
        return apiError(400, "invalid_module", "Module introuvable")
      }
      if (error instanceof Error && error.message === "invalid_calibration_date") {
        return apiError(400, "invalid_calibration_date", "Date d'étalonnage invalide")
      }
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Validation impossible", { issues: error.issues })
      }
      log.error("lieux", "lieu_update_error", { error: error });
      const errorDetail = error instanceof Error ? error.message : String(error)
      const extra = process.env.NODE_ENV === "production" ? { detail: errorDetail } : undefined
      return apiError(500, "lieu_update_failed", "Erreur lors de la modification du lieu", extra)
    }
  },
)
