import bcrypt from "bcryptjs"
import { z } from "zod"
import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { getRequestContext, withLogging } from "@/lib/api-logger"
import { prisma } from "@/lib/prisma"
import { getPasswordRulesFromDb } from "@/lib/password-rules"
import { validatePassword } from "@/lib/password-validation"
import { checkPasswordHistory } from "@/lib/password-history"
import {
  ACCESS_COOKIE_MAX_AGE_SECONDS,
  REFRESH_COOKIE_MAX_AGE_SECONDS,
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/jwt"
import { log } from "@/lib/logger"
import { shouldUseSecureCookies } from "@/lib/cookie-security"

const forcePasswordChangeSchema = z.object({
  username: z.string().min(1, "Username requis"),
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z.string().min(1, "Nouveau mot de passe requis"),
  confirmPassword: z.string().min(1, "Confirmation requise"),
})

function validateForceToken(token: string, username: string) {
  const decodedToken = Buffer.from(token, "base64").toString("utf-8")
  const [tokenUsername, timestamp] = decodedToken.split(":")

  if (!tokenUsername || !timestamp) {
    return { ok: false as const, error: "invalid_token" }
  }

  if (tokenUsername !== username) {
    return { ok: false as const, error: "invalid_token" }
  }

  const tokenTime = parseInt(timestamp, 10)
  if (!Number.isFinite(tokenTime)) {
    return { ok: false as const, error: "invalid_token" }
  }

  const ageMinutes = (Date.now() - tokenTime) / (1000 * 60)
  if (ageMinutes > 30) {
    return { ok: false as const, error: "expired_token" }
  }

  return { ok: true as const }
}

/**
 * POST /api/auth/force-password-change
 * Permet de changer un mot de passe expiré/temporaire sans session auth,
 * en s'appuyant sur le cookie temporaire `force-password-token`.
 */
export const POST = withLogging(
  async (req: NextRequest) => {
    const { ip } = getRequestContext(req)

    try {
      const token = req.cookies.get("force-password-token")?.value
      const tokenUsername = req.cookies.get("force-password-username")?.value

      if (!token || !tokenUsername) {
        return apiError(401, "invalid_or_expired_token", "Token expiré ou invalide")
      }

      const body = await req.json()
      const { username, currentPassword, newPassword, confirmPassword } =
        forcePasswordChangeSchema.parse(body)

      if (username !== tokenUsername) {
        return apiError(401, "invalid_token", "Token invalide")
      }

      const tokenValidation = validateForceToken(token, username)
      if (!tokenValidation.ok) {
        const response = apiError(401, tokenValidation.error, "Token expiré ou invalide")
        response.cookies.delete({ name: "force-password-token", path: "/" })
        response.cookies.delete({ name: "force-password-username", path: "/" })
        return response
      }

      if (newPassword !== confirmPassword) {
        return apiError(400, "password_mismatch", "Les mots de passe ne correspondent pas")
      }

      const user = await prisma.t_utilisateur.findFirst({
        where: { Login: username, Est_Archive: false },
        include: {
          t_ancien_mot_de_passe: {
            orderBy: { Id_Ancien_Mot_De_Passe: "desc" },
          },
        },
      })

      if (!user?.Mot_De_Passe) {
        log.auth.passwordChange(username, user?.Id_Utilisateur ?? 0, ip, true)
        return apiError(404, "not_found", "Utilisateur non trouvé")
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.Mot_De_Passe as string)
      if (!isCurrentPasswordValid) {
        log.auth.passwordChange(username, user.Id_Utilisateur, ip, true)
        return apiError(400, "invalid_old_password", "Le mot de passe actuel est incorrect")
      }

      const rules = await getPasswordRulesFromDb()
      const validation = validatePassword(newPassword, rules)
      if (!validation.isValid) {
        return apiError(400, "password_rules_failed", "Le mot de passe ne respecte pas les règles de sécurité", {
          details: validation.errors,
        })
      }

      const historyCheck = await checkPasswordHistory(user.Id_Utilisateur, newPassword)
      if (historyCheck.isReused) {
        return apiError(400, "password_reused", "Vous ne pouvez pas réutiliser un ancien mot de passe")
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      const isFirstPasswordChange = user.Est_Mot_De_Passe_Temporaire === true

      await prisma.t_ancien_mot_de_passe.create({
        data: {
          Id_Utilisateur: user.Id_Utilisateur,
          Mot_De_Passe: user.Mot_De_Passe as string,
          Est_Premiere_Connexion: isFirstPasswordChange,
        },
      })

      await prisma.t_utilisateur.update({
        where: { Id_Utilisateur: user.Id_Utilisateur },
        data: {
          Mot_De_Passe: hashedPassword,
          Date_Derniere_Modification_MDP: new Date(),
          Est_Mot_De_Passe_Temporaire: false,
          Reset_Password_Token: null,
          Reset_Password_Expires: null,
        },
      })

      const authorizations: string[] = []
      const authToken = generateAccessToken({
        userId: user.Id_Utilisateur,
        username: user.Login || "user",
        profile: user.Profil_Utilisateur || "user",
        authorizations,
      })

      const response = apiOk({
        message: "Mot de passe changé avec succès",
        isFirstPasswordChange,
      })

      response.cookies.set("auth-token", authToken, {
        httpOnly: true,
        secure: shouldUseSecureCookies(req),
        sameSite: "lax",
        maxAge: ACCESS_COOKIE_MAX_AGE_SECONDS,
        path: "/",
      })

      const refreshToken = generateRefreshToken({
        userId: user.Id_Utilisateur,
        username: user.Login || "user",
        profile: user.Profil_Utilisateur || "user",
      })
      response.cookies.set("refresh-token", refreshToken, {
        httpOnly: true,
        secure: shouldUseSecureCookies(req),
        sameSite: "lax",
        maxAge: REFRESH_COOKIE_MAX_AGE_SECONDS,
        path: "/",
      })

      response.cookies.delete({ name: "force-password-token", path: "/" })
      response.cookies.delete({ name: "force-password-username", path: "/" })

      log.auth.passwordChange(username, user.Id_Utilisateur, ip, true)

      return response
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Données invalides", { details: error.issues })
      }

      console.error("[AUTH] Force password change error:", error)
      return apiError(500, "force_password_change_failed", "Erreur serveur")
    }
  },
  { skipLogging: true },
)
