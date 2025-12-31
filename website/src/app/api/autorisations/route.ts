import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuthorizationLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"

/**
 * GET /api/autorisations
 * Récupère la liste de toutes les autorisations disponibles.
 */
export const GET = withAuthorizationLogging("GERER_PROFIL", async (_req: NextRequest) => {
  try {
    const authorizations = await prisma.t_autorisation.findMany({
      orderBy: { Code_Autorisation: "asc" },
    })

    const formatted = authorizations.map((auth) => ({
      id: auth.Id_Autorisation,
      code: auth.Code_Autorisation,
      label: auth.Libelle_Autorisation,
      description: auth.Commentaire,
      fenAdmin: auth.A_Acces_Admin,
      fenMetrologie: auth.A_Acces_Metrologie,
      fenSurveillance: auth.A_Acces_Surveillance,
      fenVigiLog: auth.A_Acces_VigiLog,
    }))

    return apiOk(formatted)
  } catch (error) {
    console.error("Get authorizations error:", error)
    return apiError(500, "authorizations_fetch_failed", "Echec de recuperation des autorisations")
  }
})
