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
      const groupId = Number.parseInt(idParam, 10)

      if (!Number.isFinite(groupId) || groupId <= 0) {
        return apiError(400, "invalid_id", "ID groupe requis")
      }

      const payload = alarmToggleSchema.parse(await req.json())
      const durationMinutes =
        payload.disabled && payload.durationMinutes && payload.durationMinutes > 0
          ? payload.durationMinutes
          : null
      const reactivationAt =
        payload.disabled && durationMinutes ? new Date(Date.now() + durationMinutes * 60 * 1000) : null

      const lieux = await prisma.t_lieu.findMany({
        where: {
          Est_Archive: false,
          OR: [
            { t_lieu_groupe: { some: { Id_Groupe: groupId } } },
            { Id_Groupe1: groupId },
            { Id_Groupe2: groupId },
          ],
        },
        select: { Id_Lieu: true },
      })

      const lieuIds = lieux.map((lieu) => lieu.Id_Lieu)
      if (lieuIds.length === 0) {
        return apiOk({ updated: 0 })
      }

      const result = await prisma.t_lieu.updateMany({
        where: { Id_Lieu: { in: lieuIds } },
        data: {
          Notification_Active: payload.disabled ? false : true,
          Date_Heure_Reactivation_Alarme: payload.disabled ? reactivationAt : null,
        },
      })

      log.audit(payload.disabled ? "alarm_disabled" : "alarm_enabled", {
        user: user.username,
        userId: user.userId,
        userProfile: user.profile,
        resource: "groupe",
        resourceId: groupId,
        changes: {
          disabled: payload.disabled,
          durationMinutes,
          reactivationAt: reactivationAt?.toISOString() ?? null,
          updated: result.count,
        },
      })

      return apiOk({
        updated: result.count,
        lieuIds,
        alarmDisabled: payload.disabled,
        alarmDisabledUntil: reactivationAt,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Invalid input", { issues: error.issues })
      }
      log.error("groupes/alarm", "alarm_update_error", { error: error });
      return apiError(500, "alarm_toggle_failed", "Erreur lors de la mise à jour des alarmes")
    }
  },
)
