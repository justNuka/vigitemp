import { NextRequest } from "next/server"

import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { log } from "@/lib/logger"

export const POST = withAuthLogging(async (_request: NextRequest) => {
  try {
    const [dbNowRow] = await prisma.$queryRaw<Array<{ nowAt: Date }>>`SELECT NOW() AS nowAt`
    const reactivatedAt = dbNowRow?.nowAt ?? new Date()

    const result = await prisma.$transaction(async (tx) => {
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
          Sonde_Numero_Serie: true,
        },
      })

      let reactivatedSensors = 0

      if (lieuxToReactivate.length > 0) {
        const ids = lieuxToReactivate.map((lieu) => lieu.Id_Lieu)
        await tx.t_lieu.updateMany({
          where: { Id_Lieu: { in: ids } },
          data: {
            Lieu_Etat: "S",
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
      }
    })

    return apiOk(result)
  } catch (error) {
    log.error("capteurs/reactivate", "reactivate_snooze_error", { error })
    return apiError(500, "internal_error", "Erreur lors de la reactivation des snooze")
  }
})
