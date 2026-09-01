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

      const liaisons = await prisma.t_liaison_utilisateur_groupe.findMany({
        where: {
          Id_Groupe: groupeId,
        },
        select: {
          t_utilisateur: {
            select: {
              Id_Utilisateur: true,
              Nom: true,
              Prenom: true,
              Login: true,
              Est_Archive: true,
            },
          },
        },
      })

      const utilisateurs = liaisons
        .filter((l) => l.t_utilisateur && !l.t_utilisateur.Est_Archive)
        .map((l) => ({
          Id_Utilisateur: l.t_utilisateur!.Id_Utilisateur,
          Nom: l.t_utilisateur!.Nom,
          Prenom: l.t_utilisateur!.Prenom,
          Login: l.t_utilisateur!.Login,
        }))
        .sort((a, b) => (a.Nom || "").localeCompare(b.Nom || ""))

      return apiOk(utilisateurs)
    } catch (error) {
      log.error("groupes/utilisateurs", "utilisateurs_fetch_error", { error: error });
      return apiError(500, "utilisateurs_fetch_failed", "Erreur lors de la récupération des utilisateurs")
    }
  },
)
