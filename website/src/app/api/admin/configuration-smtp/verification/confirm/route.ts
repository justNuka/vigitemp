import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { withAuthorizationLogging, type HandlerContext } from "@/lib/api-wrappers"
import { log } from "@/lib/logger"
import { confirmSmtpVerification } from "@/lib/smtp-verification"

export const POST = withAuthorizationLogging(
  "PARAMETRES_GERER",
  async (req: NextRequest, ctx: HandlerContext) => {
    try {
      const body = (await req.json()) as { code?: string }
      const code = body.code?.trim() ?? ""

      if (!/^\d{6}$/.test(code)) {
        return apiError(
          400,
          "invalid_code_format",
          "Le code doit contenir 6 chiffres",
        )
      }

      const result = await confirmSmtpVerification(code)

      if (result.ok) {
        log.audit("CC", {
          user: ctx.user.username,
          userId: ctx.user.userId,
          resource: "Configuration SMTP",
          changes: {
            confirmed: true,
          },
        })
        return apiOk({ confirmed: true })
      }

      if (result.reason === "expired") {
        return apiError(
          410,
          "smtp_verification_expired",
          "Le code de validation SMTP a expiré",
        )
      }

      if (result.reason === "too_many_attempts") {
        return apiError(
          429,
          "smtp_verification_too_many_attempts",
          "Trop de tentatives. Demandez un nouveau code.",
        )
      }

      if (result.reason === "missing") {
        return apiError(
          409,
          "smtp_verification_missing",
          "Aucun code de validation SMTP n'est en attente",
        )
      }

      return apiError(
        400,
        "smtp_verification_invalid",
        result.attemptsLeft !== undefined
          ? `Code incorrect. ${result.attemptsLeft} tentative(s) restante(s).`
          : "Code incorrect",
      )
    } catch (error) {
      log.error("SMTP_VERIFICATION", "smtp_verification_confirm_failed", {
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(500, "internal_error", "Erreur serveur")
    }
  },
)
