import { NextRequest } from "next/server"

import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { applyAccessFilter, buildAlarmAccessFilter, buildLieuAccessFilter, getUserLocationScope } from "@/lib/location-access-scope"
import { log } from "@/lib/logger"

const NO_STORE_HEADERS: HeadersInit = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
}

export const GET = withAuthLogging(async (_req: NextRequest, ctx) => {
  try {
    const scope = await getUserLocationScope(ctx.user.userId)
    const lieuAccessFilter = buildLieuAccessFilter(scope)
    const alarmAccessFilter = buildAlarmAccessFilter(scope)

    const [activeLocations, disabledLocations, activeAlarms, alertSensors] = await Promise.all([
      prisma.t_lieu.count({ where: applyAccessFilter({ Est_Archive: false, Lieu_Etat: "S" }, lieuAccessFilter) }),
      prisma.t_lieu.count({ where: applyAccessFilter({ Est_Archive: false, Lieu_Etat: "D" }, lieuAccessFilter) }),
      prisma.t_alarme.count({ where: applyAccessFilter({ Est_Acquittee: false, Date_Heure_Fin: null }, alarmAccessFilter) }),
      prisma.t_lieu.count({
        where: applyAccessFilter(
          {
            Est_Archive: false,
            OR: [{ Est_Lieu_En_Alarme: 1 }, { Est_Lieu_En_Pre_Alarme: 1 }],
          },
          lieuAccessFilter,
        ),
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
    log.error("tableau-de-bord/stats", "tableau_de_bord_stats_error", { error: error });
    return apiError(500, "internal_error", "Failed to fetch dashboard stats")
  }
})
