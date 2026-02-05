import { NextRequest } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getClientIp, withLogging } from "@/lib/api-logger"
import { log } from "@/lib/logger"
import { z } from "zod"
import { apiError, apiOk } from "@/lib/api-response"
import { clearLocationCache } from "@/lib/measurement-cache"

const updateLieuSchema = z.object({
  Nom_Lieu: z.string().min(1, "Nom du lieu requis").max(50).optional(),
  Lieu_Etat: z.string().max(1).nullable().optional(),
  Commentaire: z.string().nullable().optional(),
  Id_Site: z.number().nullable().optional(),
  GroupIds: z.array(z.number()).optional(),
  Id_Groupe1: z.number().nullable().optional(),
  Id_Groupe2: z.number().nullable().optional(),
  Sonde_Numero_Serie: z.string().nullable().optional(),
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
})

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
        Id_Groupe1,
        Id_Groupe2,
        surveillanceDurationMinutes,
        ...lieuPatch
      } = validated as any
      if (Object.prototype.hasOwnProperty.call(validated, "Frequence")) {
        const value = validated.Frequence
        lieuPatch.Frequence =
          value === null || value === undefined ? value : Math.round(value * 60)
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
      const hasIdSite = Object.prototype.hasOwnProperty.call(validated, "Id_Site")
      const hasSondeNumeroSerie = Object.prototype.hasOwnProperty.call(validated, "Sonde_Numero_Serie")

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

        const updated = await tx.t_lieu.update({
          where: { Id_Lieu: lieuId },
          data: {
            ...lieuPatch,
            ...(applyLieuEtat
              ? {
                  Lieu_Etat,
                  Date_Heure_Reactivation_Surveillance:
                    Lieu_Etat === "D" ? surveillanceReactivationAt : null,
                }
              : {}),
            ...(shouldArchive
              ? {
                  Lieu_Etat: "D",
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
          },
        })

        if (hasLieuEtat) {
          const sondeNumeroSerie =
            validated.Sonde_Numero_Serie ?? current?.Sonde_Numero_Serie ?? null

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

        return updated
      })

      const serialized = JSON.parse(
        JSON.stringify(lieu, (_, value) => (typeof value === "bigint" ? value.toString() : value)),
      )

      const normalized = {
        ...serialized,
        Frequence:
          serialized?.Frequence === null || serialized?.Frequence === undefined
            ? serialized?.Frequence
            : Number(serialized.Frequence) / 60,
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
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Invalid input", { issues: error.issues })
      }
      console.error("[PATCH /api/lieux/[id]]", error)
      const errorDetail = error instanceof Error ? error.message : String(error)
      const extra =
        process.env.NODE_ENV === "production" ? { detail: errorDetail } : undefined
      return apiError(500, "lieu_update_failed", "Erreur lors de la modification du lieu", extra)
    }
  },
)
