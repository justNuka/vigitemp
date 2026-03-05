import { NextRequest } from "next/server"

import { withAdminLogging, type HandlerContext } from "@/lib/api-wrappers"
import { getRequestContext } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { decryptSmtpPassword, encryptSmtpPassword, isEncryptedSmtpPassword } from "@/lib/secret-crypto"
import { log } from "@/lib/logger"

type SMTPConfig = {
  host: string
  port: number
  user: string
  password: string
  sender: string
}

/**
 * GET/PUT /api/admin/configuration-smtp
 * Parametres SMTP (stockes dans t_parametre / SECURITE_EMAIL)
 */
export const GET = withAdminLogging(async (req: NextRequest, ctx: HandlerContext) => {
  try {
    const { ip } = getRequestContext(req)
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
          config.password = decryptSmtpPassword(param.Valeur || "")
          break
        case "SMTP_EXPEDITEUR":
          config.sender = param.Valeur || "noreply@vigitemp.fr"
          break
      }
    })

    log.info("SMTP_CONFIG", "SMTP configuration fetched", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      hostConfigured: !!config.host,
      userConfigured: !!config.user,
      passwordConfigured: !!config.password,
    })

    return apiOk(config)
  } catch (error) {
    log.error("SMTP_CONFIG", "Failed to fetch SMTP configuration", {
      error: error instanceof Error ? error.message : String(error),
    })
    return apiError(500, "internal_error", "Erreur serveur")
  }
})

export const PUT = withAdminLogging(async (req: NextRequest, ctx: HandlerContext) => {
  try {
    const { ip } = getRequestContext(req)
    const body = (await req.json()) as SMTPConfig

    if (!body.host || !body.port || !body.user || !body.password) {
      return apiError(400, "invalid_input", "Parametres SMTP incomplets")
    }

    const encryptedPassword = encryptSmtpPassword(body.password)

    const updates = [
      { Mot_Cle: "SMTP_SERVEUR", Valeur: body.host },
      { Mot_Cle: "SMTP_PORT", Valeur: body.port.toString() },
      { Mot_Cle: "SMTP_UTILISATEUR", Valeur: body.user },
      { Mot_Cle: "SMTP_MOT_DE_PASSE", Valeur: encryptedPassword },
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

    log.info("SMTP_CONFIG", "SMTP configuration updated", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      host: body.host,
      port: body.port,
      sender: body.sender,
      passwordEncrypted: isEncryptedSmtpPassword(encryptedPassword),
    })

    log.audit("CC", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      resource: "Configuration SMTP",
      changes: {
        host: body.host,
        port: body.port,
        user: body.user,
        sender: body.sender,
        passwordUpdated: true,
      },
    })

    return apiOk({ message: "Configuration SMTP mise a jour avec succes" })
  } catch (error) {
    log.error("SMTP_CONFIG", "Failed to update SMTP configuration", {
      error: error instanceof Error ? error.message : String(error),
    })
    return apiError(500, "internal_error", "Erreur serveur")
  }
})
