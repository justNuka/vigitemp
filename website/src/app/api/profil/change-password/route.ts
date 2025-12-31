import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { validatePassword, checkPasswordHistory } from "@/lib/password-validation"
import { getPasswordRulesFromDb } from "@/lib/password-rules"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "L'ancien mot de passe est requis"),
  newPassword: z.string().min(1, "Le nouveau mot de passe est requis"),
  confirmPassword: z.string().min(1, "La confirmation est requise"),
})

/**
 * POST /api/profil/change-password
 * Change le mot de passe de l'utilisateur authentifié.
 */
export const POST = withAuthLogging(async (req: NextRequest, ctx: any) => {
  try {
    const body = await req.json()
    const { oldPassword, newPassword, confirmPassword } = changePasswordSchema.parse(body)

    if (newPassword !== confirmPassword) {
      return apiError(400, "password_mismatch", "Les mots de passe ne correspondent pas")
    }

    const dbUser = await prisma.t_utilisateur.findUnique({
      where: { Id_Utilisateur: ctx.user.userId },
      select: {
        Id_Utilisateur: true,
        Mot_De_Passe: true,
        Est_Mot_De_Passe_Temporaire: true,
      },
    })

    if (!dbUser?.Mot_De_Passe) {
      return apiError(404, "not_found", "Utilisateur non trouvé")
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, dbUser.Mot_De_Passe as string)
    if (!isOldPasswordValid) {
      return apiError(400, "invalid_old_password", "L'ancien mot de passe est incorrect")
    }

    const rules = await getPasswordRulesFromDb()

    const validation = validatePassword(newPassword, rules)
    if (!validation.isValid) {
      return apiError(400, "password_rules_failed", "Le mot de passe ne respecte pas les règles de sécurité", {
        details: validation.errors,
      })
    }

    const historyCheck = await checkPasswordHistory(ctx.user.userId, newPassword)
    if (historyCheck.isReused) {
      return apiError(400, "password_reused", "Vous ne pouvez pas réutiliser un ancien mot de passe")
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    const isFirstPasswordChange = dbUser.Est_Mot_De_Passe_Temporaire === true

    await prisma.t_ancien_mot_de_passe.create({
      data: {
        Id_Utilisateur: ctx.user.userId,
        Mot_De_Passe: dbUser.Mot_De_Passe as string,
        Est_Premiere_Connexion: isFirstPasswordChange,
      },
    })

    await prisma.t_utilisateur.update({
      where: { Id_Utilisateur: ctx.user.userId },
      data: {
        Mot_De_Passe: hashedPassword,
        Date_Derniere_Modification_MDP: new Date(),
        Est_Mot_De_Passe_Temporaire: false,
      },
    })

    const { ip } = getRequestContext(req)
    log.auth.passwordChange(ctx.user.username, ctx.user.userId, ip, false)

    return apiOk({
      message: "Mot de passe changé avec succès",
      isFirstPasswordChange,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Données invalides", { details: error.issues })
    }

    console.error("Error changing password:", error)
    return apiError(500, "password_change_failed", "Erreur lors du changement de mot de passe")
  }
})
