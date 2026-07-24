import { NextRequest } from "next/server"

import { withAuthLogging, type HandlerContext } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"
import { getDbNow } from "@/lib/sql-provider"
import { serializeDbDateTime } from "@/lib/date-display"

export const POST = withAuthLogging(async (request: NextRequest, ctx: HandlerContext) => {
  try {
    const { ip } = getRequestContext(request)
    const reactivatedAt = await getDbNow(prisma)

    const result = await prisma.$transaction(async (tx) => {
      const alarmSnoozesToReactivate = await tx.t_lieu.findMany({
        where: {
          Est_Archive: false,
          Notification_Active: false,
          Date_Heure_Reactivation_Alarme: { lte: reactivatedAt },
        },
        select: {
          Id_Lieu: true,
          Nom_Lieu: true,
          Date_Heure_Reactivation_Alarme: true,
        },
      })

      const alarmResult = await tx.t_lieu.updateMany({
        where: {
          Est_Archive: false,
          Notification_Active: false,
          Date_Heure_Reactivation_Alarme: { lte: reactivatedAt },
        },
        data: {
          Notification_Active: true,
          Date_Heure_Reactivation_Alarme: null,
        },
      })

      const lieuxToReactivate = await tx.t_lieu.findMany({
        where: {
          Est_Archive: false,
          Lieu_Etat: "D",
          Date_Heure_Reactivation_Surveillance: { lte: reactivatedAt },
        },
        select: {
          Id_Lieu: true,
          Nom_Lieu: true,
          Sonde_Numero_Serie: true,
          Date_Heure_Reactivation_Surveillance: true,
        },
      })

      let reactivatedSensors = 0

      if (lieuxToReactivate.length > 0) {
        const ids = lieuxToReactivate.map((lieu) => lieu.Id_Lieu)
        await tx.t_lieu.updateMany({
          where: { Id_Lieu: { in: ids } },
          data: {
            Lieu_Etat: "S",
            Date_Heure_Derniere_Reponse: null,
            Date_Heure_Reactivation_Surveillance: null,
            Date_Heure_Surveillance_On: reactivatedAt,
            Date_Heure_Surveillance_Off: null,
          },
        })

        const sondes = lieuxToReactivate
          .map((lieu) => lieu.Sonde_Numero_Serie)
          .filter((serie): serie is string => typeof serie === "string" && serie.length > 0)

        if (sondes.length > 0) {
          const sensorResult = await tx.t_sonde.updateMany({
            where: { Sonde_Numero_Serie: { in: sondes } },
            data: { Surveillance_Etat: "S" },
          })
          reactivatedSensors = sensorResult.count
        }
      }

      return {
        reactivatedAlarms: alarmResult.count,
        reactivatedSurveillance: lieuxToReactivate.length,
        reactivatedSensors,
        alarmSnoozesToReactivate,
        lieuxToReactivate,
      }
    })

    for (const lieu of result.lieuxToReactivate) {
      log.audit("ACT", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        userProfile: ctx.user.profile,
        ip,
        resource: `Lieu: ${lieu.Nom_Lieu || "Sans nom"}`,
        resourceId: lieu.Id_Lieu,
        lieuId: lieu.Id_Lieu,
        changes: {
          action: "reactivate_surveillance",
          scheduledAt: serializeDbDateTime(lieu.Date_Heure_Reactivation_Surveillance),
          reactivatedAt: serializeDbDateTime(reactivatedAt),
          sensorSerial: lieu.Sonde_Numero_Serie ?? null,
        },
      })
    }

    for (const lieu of result.alarmSnoozesToReactivate) {
      log.audit("ACT", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        userProfile: ctx.user.profile,
        ip,
        resource: `Notifications alarme: ${lieu.Nom_Lieu || "Sans nom"}`,
        resourceId: lieu.Id_Lieu,
        lieuId: lieu.Id_Lieu,
        changes: {
          action: "reactivate_alarm_notifications",
          scheduledAt: serializeDbDateTime(lieu.Date_Heure_Reactivation_Alarme),
          reactivatedAt: serializeDbDateTime(reactivatedAt),
        },
      })
    }

    return apiOk({
      reactivatedAlarms: result.reactivatedAlarms,
      reactivatedSurveillance: result.reactivatedSurveillance,
      reactivatedSensors: result.reactivatedSensors,
    })
  } catch (error) {
    log.error("capteurs/reactivate", "reactivate_snooze_error", { error })
    return apiError(500, "internal_error", "Erreur lors de la reactivation des snooze")
  }
})
