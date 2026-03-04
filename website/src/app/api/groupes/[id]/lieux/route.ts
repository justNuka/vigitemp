import { NextRequest } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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

      const { id: idParam } = await params
      const groupeId = parseInt(idParam)

      if (!groupeId) {
        return apiError(400, "invalid_id", "ID groupe invalide")
      }

      const lieux = await prisma.t_lieu.findMany({
        where: {
          Est_Archive: false,
          OR: [
            { t_lieu_groupe: { some: { Id_Groupe: groupeId } } },
            { Id_Groupe1: groupeId },
            { Id_Groupe2: groupeId },
          ],
        },
        select: {
          Id_Lieu: true,
          Nom_Lieu: true,
        },
        orderBy: {
          Nom_Lieu: "asc",
        },
      })

      return apiOk(lieux)
    } catch (error) {
      log.error("groupes/lieux", "lieux_fetch_error", { error: error });
      return apiError(500, "lieux_fetch_failed", "Erreur lors de la récupération des lieux")
    }
  },
)
