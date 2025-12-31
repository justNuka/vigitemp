import { NextRequest } from "next/server"

import { withAdminLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

type SMTPConfig = {
  host: string
  port: number
  user: string
  password: string
  sender: string
}

/**
 * GET/PUT /api/admin/configuration-smtp
 * Paramètres SMTP (stockés dans t_parametre / SECURITE_EMAIL)
 */
export const GET = withAdminLogging(async (_req: NextRequest) => {
  try {
    const params = await prisma.t_parametre.findMany({
      where: { Section: "SECURITE_EMAIL" },
    })

    const config: SMTPConfig = {
      host: "",
      port: 587,
      user: "",
      password: "",
      sender: "noreply@vigitemp.fr",
    }

    params.forEach((param) => {
      switch (param.Mot_Cle) {
        case "SMTP_SERVEUR":
          config.host = param.Valeur || ""
          break
        case "SMTP_PORT":
          config.port = parseInt(param.Valeur || "587")
          break
        case "SMTP_UTILISATEUR":
          config.user = param.Valeur || ""
          break
        case "SMTP_MOT_DE_PASSE":
          config.password = param.Valeur || ""
          break
        case "SMTP_EXPEDITEUR":
          config.sender = param.Valeur || "noreply@vigitemp.fr"
          break
      }
    })

    return apiOk(config)
  } catch (error) {
    console.error("Erreur lors de la récupération de la config SMTP:", error)
    return apiError(500, "internal_error", "Erreur serveur")
  }
})

export const PUT = withAdminLogging(async (req: NextRequest) => {
  try {
    const body = (await req.json()) as SMTPConfig

    if (!body.host || !body.port || !body.user || !body.password) {
      return apiError(400, "invalid_input", "Paramètres SMTP incomplets")
    }

    const updates = [
      { Mot_Cle: "SMTP_SERVEUR", Valeur: body.host },
      { Mot_Cle: "SMTP_PORT", Valeur: body.port.toString() },
      { Mot_Cle: "SMTP_UTILISATEUR", Valeur: body.user },
      { Mot_Cle: "SMTP_MOT_DE_PASSE", Valeur: body.password },
      { Mot_Cle: "SMTP_EXPEDITEUR", Valeur: body.sender },
    ]

    for (const update of updates) {
      await prisma.t_parametre.upsert({
        where: {
          Section_Mot_Cle: {
            Section: "SECURITE_EMAIL",
            Mot_Cle: update.Mot_Cle,
          },
        },
        update: { Valeur: update.Valeur },
        create: {
          Section: "SECURITE_EMAIL",
          Mot_Cle: update.Mot_Cle,
          Valeur: update.Valeur,
        },
      })
    }

    return apiOk({ message: "Configuration SMTP mise à jour avec succès" })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la config SMTP:", error)
    return apiError(500, "internal_error", "Erreur serveur")
  }
})
