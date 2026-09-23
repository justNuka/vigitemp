import { NextRequest } from "next/server"

import { withAuthLogging, type HandlerContext } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prismaMesure } from "@/lib/prisma"
import { log } from "@/lib/logger"
import { serializePrismaStoredDbDateTime } from "@/lib/sql-provider"
import { serializeDbDateTime } from "@/lib/date-display"

/**
 * GET /api/sondes/[idSonde]/mesures
 *
 * Récupère les 125 dernières mesures pour une sonde depuis tm_graphique.
 */
export const GET = withAuthLogging(
  async (
    request: NextRequest,
    _ctx: HandlerContext,
    { params }: { params: Promise<{ idSonde: string }> },
  ) => {
    try {
      const { idSonde } = await params
      const sondeId = parseInt(idSonde, 10)

      if (Number.isNaN(sondeId)) {
        return apiError(400, "invalid_input", "Invalid sonde ID")
      }

      const mesures = await prismaMesure.tm_graphique.findMany({
        where: { Id_Sonde: sondeId },
        select: {
          Date_Heure_Mesure: true,
          Valeur: true,
          Unite: true,
          Consigne: true,
          Consigne_Sup: true,
          Consigne_Inf: true,
          Frequence: true,
          Id_Lieu: true,
          Est_Etat_Alarme: true,
        },
        orderBy: { Date_Heure_Mesure: "desc" },
        take: 125,
      })

      const derniereMaj =
        serializePrismaStoredDbDateTime(mesures[0]?.Date_Heure_Mesure) ?? serializeDbDateTime(new Date())

      mesures.reverse()

      const response = apiOk({
        mesures: mesures.map((mesure) => ({
          ...mesure,
          Date_Heure_Mesure: serializePrismaStoredDbDateTime(mesure.Date_Heure_Mesure),
        })),
        derniereMaj,
      })
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
      return response
    } catch (error) {
      log.error("sondes/mesures", "sonde_mesures_fetch_error", { error: error });
      return apiError(500, "internal_error", "Internal server error")
    }
  },
)

