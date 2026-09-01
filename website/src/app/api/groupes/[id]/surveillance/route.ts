import { NextRequest } from "next/server"
import { z } from "zod"

import { getClientIp } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { withAnyAuthorizationLogging } from "@/lib/api-wrappers"
import { isSurveillanceActionCommentRequired } from "@/lib/action-comment-policy"
import { log } from "@/lib/logger"
import { getPermissionAliases } from "@/lib/permissions"
import { prisma } from "@/lib/prisma"
import { getDbDatePlusMinutes, getDbNow } from "@/lib/sql-provider"
import { serializeDbDateTime } from "@/lib/date-display"

const surveillanceToggleSchema = z.object({
  disabled: z.boolean(),
  durationMinutes: z.number().int().positive().nullable().optional(),
  commentaireAction: z.string().trim().max(500).nullable().optional(),
})

export const PATCH = withAnyAuthorizationLogging(
  getPermissionAliases("LOCATION_DISABLE_ACCESS"),
  async (req: NextRequest, ctx, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: idParam } = await params
      const groupId = Number.parseInt(idParam, 10)

      if (!Number.isFinite(groupId) || groupId <= 0) {
        return apiError(400, "invalid_id", "ID groupe requis")
      }

      const payload = surveillanceToggleSchema.parse(await req.json())
      const actionComment = payload.commentaireAction?.trim() ?? ""
      const requireActionComment = await isSurveillanceActionCommentRequired()
      if (requireActionComment && actionComment.length === 0) {
        return apiError(400, "missing_action_comment", "Le commentaire est obligatoire pour cette action")
      }

      const durationMinutes =
        payload.disabled && payload.durationMinutes && payload.durationMinutes > 0
          ? payload.durationMinutes
          : null

      const reactivationAt =
        payload.disabled && durationMinutes
          ? await getDbDatePlusMinutes(prisma, durationMinutes)
          : null
      const changedAt = await getDbNow(prisma)
      const nextLieuEtat = payload.disabled ? "D" : "S"

      const lieux = await prisma.t_lieu.findMany({
        where: {
          Est_Archive: false,
          t_lieu_groupe: { some: { Id_Groupe: groupId } },
        },
        select: {
          Id_Lieu: true,
          Nom_Lieu: true,
          Sonde_Numero_Serie: true,
        },
      })

      const lieuIds = lieux.map((lieu) => lieu.Id_Lieu)
      const sensorSerials = lieux
        .map((lieu) => lieu.Sonde_Numero_Serie)
        .filter((serial): serial is string => Boolean(serial))

      if (lieuIds.length === 0) {
        return apiOk({ updated: 0, lieuIds: [], lieuEtat: nextLieuEtat })
      }

      const updatedLieux = await prisma.$transaction(async (tx) => {
        const lieuxResult = await tx.t_lieu.updateMany({
          where: { Id_Lieu: { in: lieuIds } },
          data: {
            Lieu_Etat: nextLieuEtat,
            ...(nextLieuEtat === "S" ? { Date_Heure_Derniere_Reponse: null } : {}),
            Date_Heure_Reactivation_Surveillance: payload.disabled ? reactivationAt : null,
            Date_Heure_Surveillance_On: payload.disabled ? null : changedAt,
            Date_Heure_Surveillance_Off: payload.disabled ? changedAt : null,
          },
        })

        if (sensorSerials.length > 0) {
          await tx.t_sonde.updateMany({
            where: { Sonde_Numero_Serie: { in: sensorSerials } },
            data: { Surveillance_Etat: nextLieuEtat },
          })
        }

        return lieuxResult
      })

      log.data.update("Surveillance groupe", groupId, ctx.user.username, ctx.user.userId, getClientIp(req), {
        disabled: payload.disabled,
        durationMinutes,
        reactivationAt: serializeDbDateTime(reactivationAt),
        updated: updatedLieux.count,
        lieuIds,
      }, actionComment || undefined)

      return apiOk({
        updated: updatedLieux.count,
        lieuIds,
        lieuEtat: nextLieuEtat,
        surveillanceDisabled: payload.disabled,
        surveillanceDisabledSince: payload.disabled ? serializeDbDateTime(changedAt) : null,
        surveillanceDisabledBy: payload.disabled ? ctx.user.username : null,
        surveillanceDisabledComment: payload.disabled ? actionComment || null : null,
        surveillanceDisabledUntil: serializeDbDateTime(reactivationAt),
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Invalid input", { issues: error.issues })
      }
      log.error("groupes/surveillance", "surveillance_update_error", { error })
      return apiError(500, "group_surveillance_toggle_failed", "Erreur lors de la mise à jour de la surveillance du groupe")
    }
  },
)
