import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { isEmailEnabled, sendEmail } from "@/lib/email"
import PasswordResetEmail from "../../../../../emails/password-reset"
import crypto from "crypto"
import { z } from "zod"
import { getClientIp, getRequestContext, withLogging } from "@/lib/api-logger"
import { getGlobalAppLanguage } from "@/lib/app-language"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"
import { checkRateLimit } from "@/lib/rate-limiter"

const requestResetSchema = z.object({
  email: z.string().email("Email invalide"),
})

const GENERIC_RESET_MESSAGE =
  "Si un compte existe avec cet email et que le service d'envoi est disponible, un lien de réinitialisation vous sera envoyé."

/**
 * POST /api/auth/request-password-reset
 * Demande de réinitialisation de mot de passe.
 *
 * La réponse publique reste volontairement identique pour un compte existant
 * ou inexistant, y compris lorsque SMTP est indisponible. Les détails de
 * livraison restent uniquement dans les logs/audits serveur.
 */
export const POST = withLogging(async (req: NextRequest) => {
  const { ip } = getRequestContext(req)
  let requestedEmail: string | undefined

  const rateLimit = checkRateLimit(`pwd_reset:${getClientIp(req)}`, 5, 60 * 60_000)
  if (!rateLimit.allowed) {
    return apiError(429, "too_many_requests", "Trop de tentatives. Réessayez plus tard.")
  }

  try {
    const body = await req.json()
    const { email } = requestResetSchema.parse(body)
    requestedEmail = email

    log.info("AUTH_RESET_REQUEST", "Password reset requested", { ip, email })

    const user = await prisma.t_utilisateur.findFirst({
      where: { Adresse_Email: email, Est_Archive: false },
    })

    if (!user) {
      log.warn("AUTH_RESET_REQUEST", "Password reset requested for unknown email", { ip, email })
      return apiOk({ message: GENERIC_RESET_MESSAGE })
    }

    if (!(await isEmailEnabled())) {
      log.warn("AUTH_RESET_REQUEST", "Password reset email unavailable: smtp not configured", {
        ip,
        email,
        userId: user.Id_Utilisateur,
      })
      log.audit("MDP", {
        user: user.Login || email,
        userId: user.Id_Utilisateur,
        ip,
        resource: "Request password reset",
        success: false,
        reason: "smtp_not_configured",
      })
      return apiOk({ message: GENERIC_RESET_MESSAGE })
    }

    const resetToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.t_utilisateur.update({
      where: { Id_Utilisateur: user.Id_Utilisateur },
      data: { Reset_Password_Token: hashedToken, Reset_Password_Expires: expiresAt },
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!baseUrl) {
      log.warn("AUTH_RESET_REQUEST", "NEXT_PUBLIC_APP_URL not set, password reset links will use localhost", { ip })
    }
    const resetUrl = `${baseUrl ?? "http://localhost:3000"}/reset-password?token=${resetToken}`
    const mailLocale = await getGlobalAppLanguage()

    const delivery = await sendEmail({
      to: email,
      subject:
        mailLocale === "en"
          ? "Reset your VigiSensys password"
          : "Réinitialisation de votre mot de passe VigiSensys",
      react: PasswordResetEmail({
        resetUrl,
        firstName: user.Prenom || undefined,
        lastName: user.Nom || undefined,
        expiresIn: mailLocale === "en" ? "1 hour" : "1 heure",
        locale: mailLocale,
      }),
    })

    if (!delivery.success) {
      log.warn("AUTH_RESET_REQUEST", "Password reset email delivery failed", {
        ip,
        email,
        userId: user.Id_Utilisateur,
        error: delivery.error ?? "unknown_email_delivery_error",
      })

      try {
        await prisma.t_utilisateur.update({
          where: { Id_Utilisateur: user.Id_Utilisateur },
          data: { Reset_Password_Token: null, Reset_Password_Expires: null },
        })
      } catch (cleanupError) {
        log.error("AUTH_RESET_REQUEST", "Failed to clear undelivered password reset token", {
          ip,
          email,
          userId: user.Id_Utilisateur,
          error: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
        })
      }

      log.audit("MDP", {
        user: user.Login || email,
        userId: user.Id_Utilisateur,
        ip,
        resource: "Request password reset",
        changes: { email },
        success: false,
        reason: delivery.error ?? "password_reset_email_delivery_failed",
      })

      return apiOk({ message: GENERIC_RESET_MESSAGE })
    }

    log.audit("MDP", {
      user: user.Login || email,
      userId: user.Id_Utilisateur,
      ip,
      resource: "Request password reset",
      changes: { email },
      success: true,
    })

    return apiOk({ message: GENERIC_RESET_MESSAGE })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Données invalides", { details: error.issues })
    }

    log.error("AUTH_RESET_REQUEST", "Password reset request failed", {
      ip,
      email: requestedEmail,
      error: error instanceof Error ? error.message : String(error),
    })
    log.audit("MDP", {
      user: "ANONYMOUS",
      userId: 0,
      ip,
      resource: "Request password reset",
      success: false,
      reason: error instanceof Error ? error.message : String(error),
    })
    return apiError(500, "request_password_reset_failed", "Une erreur est survenue lors de la demande de réinitialisation.")
  }
})