import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { isEmailEnabled, sendEmail } from "@/lib/email"
import PasswordResetEmail from "../../../../../emails/password-reset"
import crypto from "crypto"
import { z } from "zod"
import { withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"

const requestResetSchema = z.object({
  email: z.string().email("Email invalide"),
})

/**
 * POST /api/auth/request-password-reset
 * Demande de réinitialisation de mot de passe.
 */
export const POST = withLogging(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { email } = requestResetSchema.parse(body)

    const user = await prisma.t_utilisateur.findFirst({
      where: { Adresse_Email: email, Est_Archive: false },
    })

    const genericMessage = "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."

    if (!user) {
      return apiOk({ message: genericMessage })
    }

    if (!(await isEmailEnabled())) {
      return apiError(503, "smtp_not_configured", "Le système d'envoi d'emails n'est pas configuré.")
    }

    const resetToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.t_utilisateur.update({
      where: { Id_Utilisateur: user.Id_Utilisateur },
      data: { Reset_Password_Token: hashedToken, Reset_Password_Expires: expiresAt },
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

    await sendEmail({
      to: email,
      subject: "Réinitialisation de votre mot de passe Vigitemp",
      react: PasswordResetEmail({
        resetUrl,
        firstName: user.Prenom || undefined,
        lastName: user.Nom || undefined,
        expiresIn: "1 heure",
      }),
    })

    return apiOk({ message: genericMessage })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Données invalides", { details: error.issues })
    }

    console.error("Request password reset error:", error)
    return apiError(500, "request_password_reset_failed", "Une erreur est survenue lors de la demande de réinitialisation.")
  }
})
