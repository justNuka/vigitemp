import { NextRequest } from "next/server"
import { withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"

/**
 * Valide le token temporaire de changement de mot de passe forcé.
 * Retourne le username si le token est valide.
 */
export const POST = withLogging(
  async (req: NextRequest) => {
    try {
      const token = req.cookies.get("force-password-token")?.value
      const username = req.cookies.get("force-password-username")?.value

      if (!token || !username) {
        return apiError(401, "invalid_or_expired_token", "Token expiré ou invalide")
      }

      try {
        const decodedToken = Buffer.from(token, "base64").toString("utf-8")
        const [tokenUsername, timestamp] = decodedToken.split(":")

        if (tokenUsername !== username) {
          return apiError(401, "invalid_token", "Token invalide")
        }

        const tokenTime = parseInt(timestamp, 10)
        const nowTime = Date.now()
        const ageMinutes = (nowTime - tokenTime) / (1000 * 60)

        if (ageMinutes > 30) {
          const response = apiError(401, "expired_token", "Token expiré")
          response.cookies.delete({ name: "force-password-token", path: "/" })
          response.cookies.delete({ name: "force-password-username", path: "/" })
          return response
        }

        return apiOk({ success: true, username }, { status: 200 })
      } catch {
        return apiError(401, "invalid_token", "Token invalide")
      }
    } catch (error) {
      console.error("[AUTH] Token validation error:", error)
      return apiError(500, "token_validation_failed", "Erreur serveur")
    }
  },
  { skipLogging: true },
)
