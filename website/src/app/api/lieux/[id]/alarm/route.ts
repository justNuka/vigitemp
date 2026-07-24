import { NextRequest } from "next/server"
import { z } from "zod"

import { getClientIp } from "@/lib/api-logger"
import { prisma } from "@/lib/prisma"
import { apiError, apiOk } from "@/lib/api-response"
import { withAnyAuthorizationLogging } from "@/lib/api-wrappers"
import { log } from "@/lib/logger"
import { isSurveillanceActionCommentRequired } from "@/lib/action-comment-policy"
import { getPermissionAliases } from "@/lib/permissions"
import { getDbDatePlusMinutes } from "@/lib/sql-provider"
import { serializeDbDateTime } from "@/lib/date-display"

const alarmToggleSchema = z.object({
  disabled: z.boolean(),
  durationMinutes: z.number().int().positive().nullable().optional(),
  commentaireAction: z.string().trim().max(500).nullable().optional(),
})

const LOCATION_DISABLE_CODES = getPermissionAliases("LOCATION_DISABLE_ACCESS")

export const PATCH = withAnyAuthorizationLogging(
  LOCATION_DISABLE_CODES,
  async (req: NextRequest, { user }, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: idParam } = await params
      const lieuId = Number.parseInt(idParam, 10)

      if (!Number.isFinite(lieuId) || lieuId <= 0) {
        return apiError(400, "invalid_id", "ID lieu requis")
      }

      const payload = alarmToggleSchema.parse(await req.json())
      const actionComment = typeof payload.commentaireAction === "string" ? payload.commentaireAction.trim() : ""
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

      const updated = await prisma.t_lieu.update({
        where: { Id_Lieu: lieuId },
        data: {
          Notification_Active: payload.disabled ? false : true,
          Date_Heure_Reactivation_Alarme: payload.disabled ? reactivationAt : null,
        },
      })

      log.data.update("Notifications d'alarme", lieuId, user.username, user.userId, getClientIp(req), {
        disabled: { from: !payload.disabled, to: payload.disabled },
        durationMinutes: { from: null, to: durationMinutes },
        reactivationAt: { from: null, to: serializeDbDateTime(reactivationAt) },
      }, actionComment || undefined)

      return apiOk({
        id: updated.Id_Lieu,
        Notification_Active: updated.Notification_Active,
        Date_Heure_Reactivation_Alarme: serializeDbDateTime(updated.Date_Heure_Reactivation_Alarme),
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Invalid input", { issues: error.issues })
      }
      log.error("lieux/alarm", "alarm_update_error", { error: error });
      return apiError(500, "alarm_toggle_failed", "Erreur lors de la mise à jour de l'alarme")
    }
  },
)
