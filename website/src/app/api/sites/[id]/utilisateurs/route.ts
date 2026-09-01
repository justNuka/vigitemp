import { NextRequest } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"

export const GET = withLogging(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const user = getAuthenticatedUser(req)
    if (!user) {
      return apiError(401, "unauthenticated", "Non authentifi?")
    }

    const { id: idParam } = await params
    const siteId = parseInt(idParam, 10)
    if (!siteId) {
      return apiError(400, "invalid_id", "ID site invalide")
    }

    const liaisons = await prisma.t_liaison_utilisateur_site.findMany({
      where: { Id_Site: siteId },
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
      .filter((liaison) => liaison.t_utilisateur && !liaison.t_utilisateur.Est_Archive)
      .map((liaison) => ({
        Id_Utilisateur: liaison.t_utilisateur!.Id_Utilisateur,
        Nom: liaison.t_utilisateur!.Nom,
        Prenom: liaison.t_utilisateur!.Prenom,
        Login: liaison.t_utilisateur!.Login,
      }))
      .sort((a, b) => `${a.Prenom || ""} ${a.Nom || ""}`.localeCompare(`${b.Prenom || ""} ${b.Nom || ""}`))

    return apiOk(utilisateurs)
  } catch (error) {
    log.error("sites/utilisateurs", "utilisateurs_fetch_error", { error })
    return apiError(500, "utilisateurs_fetch_failed", "Erreur lors de la r?cup?ration des utilisateurs")
  }
})
