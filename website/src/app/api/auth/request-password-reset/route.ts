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

/**
 * POST /api/auth/request-password-reset
 * Demande de reinitialisation de mot de passe.
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

    const genericMessage = "Si un compte existe avec cet email, un lien de reinitialisation a ete envoye."

    if (!user) {
      log.warn("AUTH_RESET_REQUEST", "Password reset requested for unknown email", { ip, email })
      return apiOk({ message: genericMessage })
    }

    if (!(await isEmailEnabled())) {
      log.warn("AUTH_RESET_REQUEST", "Password reset blocked: smtp not configured", {
        ip,
        email,
        userId: user.Id_Utilisateur,
      })
      return apiError(503, "smtp_not_configured", "Le systeme d'envoi d'emails n'est pas configure.")
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

    await sendEmail({
      to: email,
      subject:
        mailLocale === "en"
          ? "Reset your VigiSensys password"
          : "Reinitialisation de votre mot de passe VigiSensys",
      react: PasswordResetEmail({
        resetUrl,
        firstName: user.Prenom || undefined,
        lastName: user.Nom || undefined,
        expiresIn: mailLocale === "en" ? "1 hour" : "1 heure",
        locale: mailLocale,
      }),
    })

    log.audit("MDP", {
      user: user.Login || email,
      userId: user.Id_Utilisateur,
      ip,
      resource: "Request password reset",
      changes: { email },
      success: true,
    })

    return apiOk({ message: genericMessage })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Donnees invalides", { details: error.issues })
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
    return apiError(500, "request_password_reset_failed", "Une erreur est survenue lors de la demande de reinitialisation.")
  }
})