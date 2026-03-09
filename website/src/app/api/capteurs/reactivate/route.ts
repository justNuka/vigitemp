import { NextRequest } from "next/server"

import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { log } from "@/lib/logger"

export const POST = withAuthLogging(async (_request: NextRequest) => {
  try {
    // 1. Reactivate snoozed alarms whose snooze period has expired.
    const alarmResult = await prisma.t_lieu.updateMany({
      where: {
        Est_Archive: false,
        Notification_Active: false,
        Date_Heure_Reactivation_Alarme: { lt: new Date() },
      },
      data: {
        Notification_Active: true,
        Date_Heure_Reactivation_Alarme: null,
      },
    })

    // 2. Reactivate snoozed surveillance whose snooze period has expired.
    const [dbNowRow] = await prisma.$queryRaw<Array<{ nowAt: Date }>>`SELECT NOW() AS nowAt`
    const surveillanceReactivatedAt = dbNowRow?.nowAt ?? new Date()

    const lieuxToReactivate = await prisma.t_lieu.findMany({
      where: {
        Est_Archive: false,
        Lieu_Etat: "D",
        Date_Heure_Reactivation_Surveillance: { lt: new Date() },
      },
      select: {
        Id_Lieu: true,
        Sonde_Numero_Serie: true,
      },
    })

    let reactivatedSurveillance = 0

    if (lieuxToReactivate.length > 0) {
      const ids = lieuxToReactivate.map((lieu) => lieu.Id_Lieu)
      await prisma.t_lieu.updateMany({
        where: { Id_Lieu: { in: ids } },
        data: {
          Lieu_Etat: "S",
          Date_Heure_Reactivation_Surveillance: null,
          Date_Heure_Surveillance_On: surveillanceReactivatedAt,
          Date_Heure_Surveillance_Off: null,
        },
      })

      const sondes = lieuxToReactivate
        .map((lieu) => lieu.Sonde_Numero_Serie)
        .filter((serie): serie is string => typeof serie === "string" && serie.length > 0)

      if (sondes.length > 0) {
        await prisma.t_sonde.updateMany({
          where: { Sonde_Numero_Serie: { in: sondes } },
          data: { Surveillance_Etat: "S" },
        })
      }

      reactivatedSurveillance = lieuxToReactivate.length
    }

    return apiOk({
      reactivatedAlarms: alarmResult.count,
      reactivatedSurveillance,
    })
  } catch (error) {
    log.error("capteurs/reactivate", "reactivate_snooze_error", { error })
    return apiError(500, "internal_error", "Erreur lors de la réactivation des snooze")
  }
})
