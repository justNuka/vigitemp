import { NextRequest } from "next/server"

import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

export const GET = withAuthLogging(async (_req: NextRequest) => {
  try {
    const totalLocations = await prisma.t_lieu.count({
      where: { Est_Archive: false },
    })

    const activeAlarms = await prisma.t_alarme.count({
      where: { Est_Acquittee: false },
    })

    const locations = await prisma.t_lieu.findMany({
      where: { Est_Archive: false },
      select: { Lieu_Etat: true },
    })

    const okSensors = locations.filter((l) => l.Lieu_Etat === "O").length
    const warningSensors = locations.filter((l) => l.Lieu_Etat === "P").length
    const criticalSensors = locations.filter((l) => l.Lieu_Etat === "A").length
    const alertSensors = warningSensors + criticalSensors

    return apiOk({
      totalLocations,
      activeAlarms,
      okSensors,
      alertSensors,
      warningSensors,
      criticalSensors,
    })
  } catch (error) {
    console.error("Tableau de bord stats error:", error)
    return apiError(500, "internal_error", "Failed to fetch dashboard stats")
  }
})

