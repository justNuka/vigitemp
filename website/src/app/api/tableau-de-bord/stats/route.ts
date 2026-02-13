import { NextRequest } from "next/server"

import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

const NO_STORE_HEADERS: HeadersInit = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
}

export const GET = withAuthLogging(async (_req: NextRequest) => {
  try {
    const [activeLocations, disabledLocations, activeAlarms, alertSensors] = await Promise.all([
      prisma.t_lieu.count({ where: { Est_Archive: false, Lieu_Etat: "S" } }),
      prisma.t_lieu.count({ where: { Est_Archive: false, Lieu_Etat: "D" } }),
      prisma.t_alarme.count({ where: { Est_Acquittee: false } }),
      prisma.t_lieu.count({
        where: {
          Est_Archive: false,
          OR: [{ Est_Lieu_En_Alarme: 1 }, { Est_Lieu_En_Pre_Alarme: 1 }],
        },
      }),
    ])

    return apiOk(
      {
        activeLocations,
        disabledLocations,
        totalLocations: activeLocations + disabledLocations,
        activeAlarms,
        alertSensors,
      },
      { headers: NO_STORE_HEADERS }
    )
  } catch (error) {
    console.error("Tableau de bord stats error:", error)
    return apiError(500, "internal_error", "Failed to fetch dashboard stats")
  }
})
