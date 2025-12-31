import { NextRequest } from "next/server"
import { withLogging } from "@/lib/api-logger"
import { getPasswordRulesFromDb } from "@/lib/password-rules"
import { apiError, apiOk } from "@/lib/api-response"

/**
 * GET /api/parametres/password-rules
 * Récupère les règles de validation des mots de passe depuis t_parametre.
 */
export const GET = withLogging(async (_req: NextRequest) => {
  try {
    const rules = await getPasswordRulesFromDb()
    return apiOk(rules)
  } catch (error) {
    console.error("Error fetching password rules:", error)
    return apiError(500, "password_rules_fetch_failed", "Erreur lors de la récupération des règles de mot de passe")
  }
})
