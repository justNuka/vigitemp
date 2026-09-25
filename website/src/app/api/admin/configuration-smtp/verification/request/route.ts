import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { withAuthorizationLogging } from "@/lib/api-wrappers"
import { canUseApplicationEmail } from "@/lib/license-email"
import { log } from "@/lib/logger"
import { requestSmtpVerification } from "@/lib/smtp-verification"

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export const POST = withAuthorizationLogging(
  "PARAMETRES_GERER",
  async (req: NextRequest) => {
    try {
      const body = (await req.json()) as { toEmail?: string }
      const toEmail = body.toEmail?.trim() ?? ""

      if (!toEmail || !isEmail(toEmail)) {
        return apiError(
          400,
          "invalid_email",
          "Adresse email de validation invalide",
        )
      }

      const emailLicense = await canUseApplicationEmail()
      if (!emailLicense.allowed) {
        return apiError(
          403,
          emailLicense.reason,
          "L'envoi d'emails n'est pas autorisé par la licence",
        )
      }

      try {
        const challenge = await requestSmtpVerification(toEmail)
        return apiOk(challenge)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)

        if (message === "smtp_disabled") {
          return apiError(
            409,
            "smtp_disabled",
            "Activez l'envoi d'emails avant de valider la configuration SMTP",
          )
        }

        if (message === "smtp_configuration_incomplete") {
          return apiError(
            400,
            "smtp_configuration_incomplete",
            "La configuration SMTP est incomplète",
          )
        }

        log.error("SMTP_VERIFICATION", "smtp_verification_send_failed", {
          error: message,
        })
        return apiError(
          502,
          "smtp_verification_send_failed",
          "Impossible d'envoyer le code avec cette configuration SMTP",
        )
      }
    } catch (error) {
      log.error("SMTP_VERIFICATION", "smtp_verification_request_failed", {
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(500, "internal_error", "Erreur serveur")
    }
  },
)
