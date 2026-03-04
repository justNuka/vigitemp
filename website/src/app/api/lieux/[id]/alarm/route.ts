import { NextRequest } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { apiError, apiOk } from "@/lib/api-response"
import { withAuthLogging } from "@/lib/api-wrappers"
import { log } from "@/lib/logger"

const alarmToggleSchema = z.object({
  disabled: z.boolean(),
  durationMinutes: z.number().int().positive().nullable().optional(),
})

export const PATCH = withAuthLogging(
  async (req: NextRequest, { user }, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: idParam } = await params
      const lieuId = Number.parseInt(idParam, 10)

      if (!Number.isFinite(lieuId) || lieuId <= 0) {
        return apiError(400, "invalid_id", "ID lieu requis")
      }

      const payload = alarmToggleSchema.parse(await req.json())
      const durationMinutes =
        payload.disabled && payload.durationMinutes && payload.durationMinutes > 0
          ? payload.durationMinutes
          : null
      const reactivationAt =
        payload.disabled && durationMinutes ? new Date(Date.now() + durationMinutes * 60 * 1000) : null

      const updated = await prisma.t_lieu.update({
        where: { Id_Lieu: lieuId },
        data: {
          Notification_Active: payload.disabled ? false : true,
          Date_Heure_Reactivation_Alarme: payload.disabled ? reactivationAt : null,
        },
      })

      log.audit(payload.disabled ? "DESA" : "ACTA", {
        user: user.username,
        userId: user.userId,
        userProfile: user.profile,
        resource: "lieu",
        resourceId: lieuId,
        lieuId,
        changes: {
          disabled: payload.disabled,
          durationMinutes,
          reactivationAt: reactivationAt?.toISOString() ?? null,
        },
      })

      return apiOk({
        id: updated.Id_Lieu,
        Notification_Active: updated.Notification_Active,
        Date_Heure_Reactivation_Alarme: updated.Date_Heure_Reactivation_Alarme,
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
