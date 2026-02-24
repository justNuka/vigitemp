import { NextRequest } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getClientIp, withLogging } from "@/lib/api-logger"
import { log } from "@/lib/logger"
import { z } from "zod"
import { apiError, apiOk } from "@/lib/api-response"
import { clearLocationCache } from "@/lib/measurement-cache"
import { extractAddressFromSerial, isGsoType } from "@/lib/sensor-naming"
import { computeEmt, emtModeFromDb, emtModeToDb } from "@/lib/emt"
import { requireStandardOrExpertIfFieldsUsed } from "@/lib/license-guards"

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
  "Erreur_Justesse",
  "Incertitude",
  "Derive",
] as const


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
}

const updateLieuSchema = z.object({
  Nom_Lieu: z.string().min(1, "Nom du lieu requis").max(50).optional(),
  Lieu_Etat: z.string().max(1).nullable().optional(),
  Commentaire: z.string().nullable().optional(),
  Observations_Info: z.string().nullable().optional(),
  Id_Site: z.number().nullable().optional(),
  GroupIds: z.array(z.number()).optional(),
  Id_Groupe1: z.number().nullable().optional(),
  Id_Groupe2: z.number().nullable().optional(),
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
  Est_Archive: z.boolean().optional(),
  surveillanceDurationMinutes: z.number().int().positive().nullable().optional(),
  EMT_Mode: z.string().nullable().optional(),
  EMT_Valeur: z.number().nullable().optional(),
  Corriger_Erreur_Justesse: z.boolean().optional(),
  Prendre_En_Compte_Derive: z.boolean().optional(),
  Erreur_Justesse: z.number().nullable().optional(),
  Incertitude: z.number().nullable().optional(),
  Derive: z.number().nullable().optional(),
  MailingContacts: z.array(mailingContactSchema).optional(),
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

export const PATCH = withLogging(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = getAuthenticatedUser(req)
    if (!user) return apiError(401, "unauthenticated", "Non authentifié")

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

      const shouldUpdateGroups =
        Object.prototype.hasOwnProperty.call(body, "GroupIds") ||
        Object.prototype.hasOwnProperty.call(body, "Id_Groupe1") ||
        Object.prototype.hasOwnProperty.call(body, "Id_Groupe2")

      const shouldArchive = validated.Est_Archive === true
      const groupIds = shouldUpdateGroups
        ? Array.from(
            new Set(
              [
                ...(validated.GroupIds ?? []),
                validated.Id_Groupe1 ?? undefined,
                validated.Id_Groupe2 ?? undefined,
              ].filter((v): v is number => typeof v === "number" && !Number.isNaN(v)),
            ),
          )
        : undefined

      const {
        GroupIds,
        Lieu_Etat,
        Id_Site,
        Sonde_Numero_Serie,
        Id_Module,
        Id_Groupe1,
        Id_Groupe2,
        surveillanceDurationMinutes,
        MailingContacts,
        EMT_Mode,
        EMT_Valeur,
        Corriger_Erreur_Justesse,
        Prendre_En_Compte_Derive,
        Erreur_Justesse,
        Incertitude,
        Derive,
        ...lieuPatch
      } = validated as any

      if (Object.prototype.hasOwnProperty.call(validated, "Frequence")) {
        const value = validated.Frequence
        lieuPatch.Frequence = value === null || value === undefined ? value : Math.round(value * 60)
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
        lieuPatch.Tolerance_Surveillance_Inf = emt.toleranceInf
      } else if (validated.EMT_Mode === "sans-objet") {
        lieuPatch.Tolerance_Surveillance_Sup = (validated.Est_Consigne_Sup_Active ?? false) ? validated.Consigne_Sup : null
        lieuPatch.Tolerance_Surveillance_Inf = (validated.Est_Consigne_Inf_Active ?? false) ? validated.Consigne_Inf : null
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
        ? new Date(Date.now() + surveillanceDurationMinutes * 60 * 1000)
        : null

      const shouldUpdateMailingContacts = Object.prototype.hasOwnProperty.call(body, "MailingContacts")
      const mailingContacts = shouldUpdateMailingContacts ? normalizeMailingContacts(MailingContacts) : []

      const hasIdSite = Object.prototype.hasOwnProperty.call(validated, "Id_Site")
      const hasSondeNumeroSerie = Object.prototype.hasOwnProperty.call(validated, "Sonde_Numero_Serie")
      const hasIdModule = Object.prototype.hasOwnProperty.call(validated, "Id_Module")

      const ip = getClientIp(req)
      let previousLieuEtat: string | null = null
      let lieuName: string | null = null

      const lieu = await prisma.$transaction(async (tx) => {
        const current = await tx.t_lieu.findUnique({
          where: { Id_Lieu: lieuId },
          select: { Sonde_Numero_Serie: true, Lieu_Etat: true, Nom_Lieu: true },
        })

        previousLieuEtat = current?.Lieu_Etat ?? null
        lieuName = current?.Nom_Lieu ?? null

        const group1Id = groupIds?.[0] ?? null
        const group2Id = groupIds?.[1] ?? null

        let nextEstLieuGso: boolean | undefined
        let nextAdresseSonde: string | null | undefined

        if (shouldArchive) {
          nextEstLieuGso = false
          nextAdresseSonde = null
        } else if (hasSondeNumeroSerie) {
          if (Sonde_Numero_Serie) {
            const isGso = isGsoType(Sonde_Numero_Serie)
            nextEstLieuGso = isGso
            nextAdresseSonde = isGso ? extractAddressFromSerial(Sonde_Numero_Serie) : null
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
          ;(lieuPatch as any).Commentaire = normalizedObservation
          ;(lieuPatch as any).Observations_Info = normalizedObservation
        }

        const baseData = {
          ...lieuPatch,
          ...(applyLieuEtat
            ? {
                t_etat_surveillance: Lieu_Etat
                  ? { connect: { Surveillance_Etat: Lieu_Etat } }
                  : { disconnect: true },
                Date_Heure_Reactivation_Surveillance:
                  Lieu_Etat === "D" ? surveillanceReactivationAt : null,
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
          ...(groupIds !== undefined
            ? {
                t_groupe1: group1Id
                  ? { connect: { Id_Groupe: group1Id } }
                  : { disconnect: true },
                t_groupe2: group2Id
                  ? { connect: { Id_Groupe: group2Id } }
                  : { disconnect: true },
              }
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

        if (hasLieuEtat) {
          const sondeNumeroSerie = validated.Sonde_Numero_Serie ?? current?.Sonde_Numero_Serie ?? null
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
              skipDuplicates: true,
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
        }

        if (hasIdModule) {
          const targetSondeNumeroSerie =
            hasSondeNumeroSerie
              ? (Sonde_Numero_Serie ?? null)
              : (current?.Sonde_Numero_Serie ?? null)

          if (targetSondeNumeroSerie) {
            let modulePortSerie: string | null = null
            if (Id_Module !== null && Id_Module !== undefined) {
              const module = await tx.t_module.findUnique({
                where: { Id_Module },
                select: { Port_Serie: true },
              })
              if (!module) {
                throw new Error("invalid_module")
              }
              modulePortSerie = module.Port_Serie ?? null
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
      )

      const normalized = {
        ...serialized,
        Commentaire: (serialized as any)?.Observations_Info ?? serialized?.Commentaire ?? null,
        EMT_Mode: emtModeFromDb((serialized as any)?.EMT_Choix_Mode),
        EMT_Valeur: (serialized as any)?.EMT_Sonde ?? null,
        Corriger_Erreur_Justesse: (serialized as any)?.Est_Correction_Ej === 1,
        Prendre_En_Compte_Derive: (serialized as any)?.Est_Correction_derive ?? false,
        Erreur_Justesse: (serialized as any)?.Derniere_Erreur_Justesse ?? null,
        Incertitude: (serialized as any)?.Derniere_Incertitude ?? null,
        Frequence:
          serialized?.Frequence === null || serialized?.Frequence === undefined
            ? serialized?.Frequence
            : Number(serialized.Frequence) / 60,
        MailingContacts: shouldUpdateMailingContacts ? mailingContacts : undefined,
      }

      if (hasLieuEtat && user && typeof Lieu_Etat === "string" && previousLieuEtat !== Lieu_Etat) {
        const reason =
          Lieu_Etat === "D"
            ? shouldScheduleSurveillanceReactivation
              ? `Désactivation ${surveillanceDurationMinutes} min`
              : "Désactivation manuelle"
            : "Réactivation manuelle"

        log.audit(Lieu_Etat === "D" ? "DES" : "ACT", {
          user: user.username,
          userId: user.userId,
          ip,
          userProfile: user.profile,
          resource: `Lieu: ${lieuName ?? lieuId}`,
          resourceId: lieuId,
          reason,
        })
      }

      clearLocationCache(lieuId)
      return apiOk(normalized)
    } catch (error) {
      if (error instanceof Error && error.message === "invalid_module") {
        return apiError(400, "invalid_module", "Module introuvable")
      }
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Invalid input", { issues: error.issues })
      }
      console.error("[PATCH /api/lieux/[id]]", error)
      const errorDetail = error instanceof Error ? error.message : String(error)
      const extra = process.env.NODE_ENV === "production" ? { detail: errorDetail } : undefined
      return apiError(500, "lieu_update_failed", "Erreur lors de la modification du lieu", extra)
    }
  },
)
