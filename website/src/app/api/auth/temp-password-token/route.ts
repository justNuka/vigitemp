import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRequestContext, withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"

/**
 * Génère un token temporaire sécurisé pour le changement de mot de passe forcé.
 * Stocké en cookie httpOnly.
 */
export const POST = withLogging(async (req: NextRequest) => {
  const { ip } = getRequestContext(req)
  try {
    const { username } = await req.json()

    if (!username) {
      log.warn("AUTH_FORCE_PASSWORD", "Temp token generation rejected: missing username", { ip })
      return apiError(400, "missing_fields", "Username requis")
    }

    const user = await prisma.t_utilisateur.findUnique({
      where: { Login: username },
    })

    if (!user) {
      return apiError(404, "not_found", "Utilisateur non trouvé")
    }

    const tempToken = Buffer.from(`${username}:${Date.now()}:${Math.random().toString(36).slice(2, 11)}`).toString(
      "base64",
    )

    const response = apiOk({ success: true }, { status: 200 })

    response.cookies.set("force-password-token", tempToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 60,
      path: "/",
    })

    response.cookies.set("force-password-username", username, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 60,
      path: "/",
    })

    log.audit("MDP", { user: username, userId: user.Id_Utilisateur, ip, resource: "Force password token generated", success: true })
    return response
  } catch (error) {
    log.error("AUTH_FORCE_PASSWORD", "Temp token generation failed", { ip, error: error instanceof Error ? error.message : String(error) })
    log.audit("MDP", { user: "ANONYMOUS", userId: 0, ip, resource: "Force password token generated", success: false, reason: error instanceof Error ? error.message : String(error) })
    log.error("auth/temp-password-token", "auth_token_generation_error", { error: error });
    return apiError(500, "token_generation_failed", "Erreur serveur")
  }
})
