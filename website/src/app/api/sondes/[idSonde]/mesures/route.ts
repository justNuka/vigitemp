import { NextRequest } from "next/server"

import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prismaMesure } from "@/lib/prisma"
import { log } from "@/lib/logger"

/**
 * GET /api/sondes/[idSonde]/mesures
 *
 * Récupère les 125 dernières mesures pour une sonde depuis tm_graphique.
 */
export const GET = withAuthLogging(
  async (
    request: NextRequest,
    _ctx: any,
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
        mesures.length > 0 ? mesures[0].Date_Heure_Mesure.toISOString() : new Date().toISOString()

      mesures.reverse()

      const response = apiOk({ mesures, derniereMaj })
      response.headers.set("Cache-Control", "public, max-age=30")
      return response
    } catch (error) {
      log.error("sondes/mesures", "get_api_sondes_idsonde_mesures_error", { error: error });
      return apiError(500, "internal_error", "Internal server error")
    }
  },
)

