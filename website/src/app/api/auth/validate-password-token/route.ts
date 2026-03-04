import { NextRequest } from "next/server"
import { getRequestContext, withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"

/**
 * Valide le token temporaire de changement de mot de passe forcé.
 * Retourne le username si le token est valide.
 */
export const POST = withLogging(
  async (req: NextRequest) => {
    try {
      const { ip } = getRequestContext(req)
      const token = req.cookies.get("force-password-token")?.value
      const username = req.cookies.get("force-password-username")?.value

      if (!token || !username) {
        return apiError(401, "invalid_or_expired_token", "Token expiré ou invalide")
      }

      try {
        const decodedToken = Buffer.from(token, "base64").toString("utf-8")
        const [tokenUsername, timestamp] = decodedToken.split(":")

        if (tokenUsername !== username) {
          log.warn("AUTH_FORCE_PASSWORD", "Temp token validation failed: username mismatch", { ip, username })
          return apiError(401, "invalid_token", "Token invalide")
        }

        const tokenTime = parseInt(timestamp, 10)
        const nowTime = Date.now()
        const ageMinutes = (nowTime - tokenTime) / (1000 * 60)

        if (ageMinutes > 30) {
          log.warn("AUTH_FORCE_PASSWORD", "Temp token validation failed: token expired", { ip, username, ageMinutes })
          const response = apiError(401, "expired_token", "Token expiré")
          response.cookies.delete({ name: "force-password-token", path: "/" })
          response.cookies.delete({ name: "force-password-username", path: "/" })
          return response
        }

        log.info("AUTH_FORCE_PASSWORD", "Temp token validated", { ip, username })
        return apiOk({ success: true, username }, { status: 200 })
      } catch {
        log.warn("AUTH_FORCE_PASSWORD", "Temp token validation failed: malformed token", { ip, username })
        return apiError(401, "invalid_token", "Token invalide")
      }
    } catch (error) {
      const { ip } = getRequestContext(req)
      log.error("AUTH_FORCE_PASSWORD", "Temp token validation error", { ip, error: error instanceof Error ? error.message : String(error) })
      log.error("auth/validate-password-token", "auth_token_validation_error", { error: error });
      return apiError(500, "token_validation_failed", "Erreur serveur")
    }
  },
  { skipLogging: true },
)
