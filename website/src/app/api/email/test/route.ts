import { NextRequest } from "next/server"
import { isEmailEnabled, sendEmail } from "@/lib/email"
import { withAuthorizationLogging } from "@/lib/api-wrappers"
import PasswordResetEmail from "../../../../../emails/password-reset"
import { apiError, apiOk } from "@/lib/api-response"
import { getGlobalAppLanguage } from "@/lib/app-language"
import { log } from "@/lib/logger"

/**
 * POST /api/email/test
 * Envoie un email de test pour valider la configuration SMTP.
 */
export const POST = withAuthorizationLogging("GERER_PROFIL", async (req: NextRequest) => {
  try {
    const body = await req.json()
    const toEmail = body?.toEmail as string | undefined

    if (!toEmail) {
      return apiError(400, "missing_fields", "Email destinataire requis")
    }

    const emailEnabled = await isEmailEnabled()
    if (!emailEnabled) {
      return apiError(503, "smtp_not_configured", "Le système d'envoi d'emails n'est pas configuré")
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const mailLocale = await getGlobalAppLanguage()

    const result = await sendEmail({
      to: toEmail,
      subject: mailLocale === "en" ? "Vigitemp - Email configuration test" : "Vigitemp - Test configuration email",
      react: PasswordResetEmail({
        resetUrl: `${baseUrl}/reset-password?token=test-token-12345`,
        firstName: "Admin",
        expiresIn: mailLocale === "en" ? "1 hour" : "1 heure",
        locale: mailLocale,
      }),
    })

    if (!result.success) {
      return apiError(500, "email_send_failed", result.error || "Failed to send test email")
    }

    return apiOk({
      message: "Test email sent successfully",
      email: toEmail,
    })
  } catch (error) {
    log.error("email/test", "test_email_error", { error: error });
    return apiError(500, "email_send_failed", error instanceof Error ? error.message : "Failed to send test email")
  }
})
