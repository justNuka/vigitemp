import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"

/**
 * Génère un token temporaire sécurisé pour le changement de mot de passe forcé.
 * Stocké en cookie httpOnly.
 */
export const POST = withLogging(async (req: NextRequest) => {
  try {
    const { username } = await req.json()

    if (!username) {
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

    return response
  } catch (error) {
    console.error("[AUTH] Token generation error:", error)
    return apiError(500, "token_generation_failed", "Erreur serveur")
  }
})
