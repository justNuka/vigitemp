import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth"
import { withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"

export const GET = withLogging(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const user = getAuthenticatedUser(req)
      if (!user) {
        return apiError(401, "unauthenticated", "Non authentifié")
      }

      const { id } = await params
      const moduleId = parseInt(id)

      if (isNaN(moduleId)) {
        return apiError(400, "invalid_id", "ID du module invalide")
      }

      const sondes = await prisma.t_sonde.findMany({
        where: {
          Id_Module: moduleId,
        },
        select: {
          Id_Sonde: true,
          Sonde_Numero_Serie: true,
          Adresse_Sonde: true,
          Port_Serie: true,
          Surveillance_Etat: true,
        },
        orderBy: {
          Sonde_Numero_Serie: "asc",
        },
      })

      return apiOk(sondes)
    } catch (error) {
      log.error("modules/sondes", "sondes_fetch_error", { error: error });
      return apiError(500, "sondes_fetch_failed", "Erreur lors de la récupération des sondes")
    }
  },
)
