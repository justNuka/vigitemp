import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { z } from "zod"
import { getRequestContext, withLogging } from "@/lib/api-logger"
import { getPasswordRulesFromDb } from "@/lib/password-rules"
import { validatePassword } from "@/lib/password-validation"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token requis"),
  newPassword: z.string().min(1, "Le nouveau mot de passe est requis"),
})

/**
 * POST /api/auth/reset-password
 * Réinitialise le mot de passe avec un token valide.
 */
export const POST = withLogging(async (req: NextRequest) => {
  const { ip } = getRequestContext(req)
  try {
    const body = await req.json()
    const { token, newPassword } = resetPasswordSchema.parse(body)

    log.info("AUTH_RESET_PASSWORD", "Password reset attempt", { ip, tokenLength: token.length })

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    const user = await prisma.t_utilisateur.findFirst({
      where: {
        Reset_Password_Token: hashedToken,
        Reset_Password_Expires: { gte: new Date() },
        Est_Archive: false,
      },
      include: {
        t_ancien_mot_de_passe: {
          orderBy: { Id_Ancien_Mot_De_Passe: "desc" },
        },
      },
    })

    if (!user) {
      return apiError(400, "invalid_or_expired_token", "Token invalide ou expiré. Veuillez refaire une demande.")
    }

    if (user.Mot_De_Passe) {
      const isSameAsCurrent = await bcrypt.compare(newPassword, user.Mot_De_Passe as string)
      if (isSameAsCurrent) {
        return apiError(
          400,
          "password_reused",
          "Le nouveau mot de passe ne peut pas être identique au mot de passe actuel.",
        )
      }
    }

    for (const oldPassword of user.t_ancien_mot_de_passe) {
      if (!oldPassword.Mot_De_Passe) continue
      const isSameAsOld = await bcrypt.compare(newPassword, oldPassword.Mot_De_Passe as string)
      if (isSameAsOld) {
        return apiError(400, "password_reused", "Ce mot de passe a déjà été utilisé. Veuillez en choisir un nouveau.")
      }
    }

    const rules = await getPasswordRulesFromDb()
    const validation = validatePassword(newPassword, rules)
    if (!validation.isValid) {
      return apiError(400, "password_rules_failed", "Le mot de passe ne respecte pas les règles de sécurité", {
        details: validation.errors,
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    if (user.Mot_De_Passe) {
      await prisma.t_ancien_mot_de_passe.create({
        data: {
          Id_Utilisateur: user.Id_Utilisateur,
          Mot_De_Passe: user.Mot_De_Passe as string,
        },
      })
    }

    await prisma.t_utilisateur.update({
      where: { Id_Utilisateur: user.Id_Utilisateur },
      data: {
        Mot_De_Passe: hashedPassword,
        Date_Derniere_Modification_MDP: new Date(),
        Reset_Password_Token: null,
        Reset_Password_Expires: null,
        Est_Mot_De_Passe_Temporaire: false,
      },
    })

    return apiOk({
      message: "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Données invalides", { details: error.issues })
    }

    log.error("AUTH_RESET_PASSWORD", "Password reset failed", { ip, error: error instanceof Error ? error.message : String(error) })
    log.audit("MDP", { user: "ANONYMOUS", userId: 0, ip, resource: "Reset password", success: false, reason: error instanceof Error ? error.message : String(error) })
    log.error("auth/reset-password", "reset_password_error", { error: error });
    return apiError(500, "reset_password_failed", "Une erreur est survenue lors de la réinitialisation.")
  }
})
