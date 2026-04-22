import { NextRequest } from "next/server"

import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prismaMesure } from "@/lib/prisma"
import { log } from "@/lib/logger"
import { serializeDbDateTime } from "@/lib/date-display"

export const GET = withAuthLogging(async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams
    const limitParam = parseInt(searchParams.get("limit") || "100", 10)
    const limit = Math.min(limitParam, 125)

    const measurements = await prismaMesure.tm_mesures.findMany({
      take: limit,
      orderBy: { Date_Heure_Mesure: "desc" },
      select: {
        Id_Mesure: true,
        Id_Lieu: true,
        Date_Heure_Mesure: true,
        Valeur: true,
      },
    })

    const formatted = measurements.map((m) => ({
      id: String(m.Id_Mesure),
      sensorId: String(m.Id_Lieu),
      timestamp: serializeDbDateTime(m.Date_Heure_Mesure) || serializeDbDateTime(new Date()) || null,
      value: m.Valeur !== null ? parseFloat(m.Valeur.toString()) : 0,
    }))

    const response = apiOk(formatted)
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300")
    return response
  } catch (error) {
    log.error("tableau-de-bord/measurements", "get_tableau_de_bord_measurements_error", { error: error });
    return apiError(500, "internal_error", "Failed to fetch measurements")
  }
})

