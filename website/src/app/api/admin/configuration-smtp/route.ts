import { NextRequest } from "next/server"

import { withAdminLogging, type HandlerContext } from "@/lib/api-wrappers"
import { getRequestContext } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { encryptSmtpPassword, isEncryptedSmtpPassword } from "@/lib/secret-crypto"
import { log } from "@/lib/logger"

type SMTPConfig = {
  enabled: boolean
  host: string
  port: number
  user: string
  password: string
  sender: string
  passwordConfigured?: boolean
}

function parseBoolean(value: string | null | undefined) {
  const normalized = (value ?? "").trim().toLowerCase()
  return ["1", "true", "yes", "on"].includes(normalized)
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
      enabled: false,
      host: "",
      port: 587,
      user: "",
      password: "",
      sender: "noreply@vigitemp.fr",
      passwordConfigured: false,
    }

    params.forEach((param) => {
      switch (param.Mot_Cle) {
        case "SMTP_ACTIVATION":
          config.enabled = parseBoolean(param.Valeur)
          break
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
          config.passwordConfigured = Boolean((param.Valeur || "").trim())
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
      enabled: config.enabled,
      hostConfigured: !!config.host,
      userConfigured: !!config.user,
      passwordConfigured: !!config.passwordConfigured,
    })

    return apiOk({ ...config, password: "" })
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

    if (typeof body.enabled !== "boolean" || !body.host || !body.port || !body.user) {
      return apiError(400, "invalid_input", "Parametres SMTP incomplets")
    }

    const nextPassword = (body.password || "").trim()
    const existingPasswordParam = await prisma.t_parametre.findUnique({
      where: {
        Section_Mot_Cle: {
          Section: "SECURITE_EMAIL",
          Mot_Cle: "SMTP_MOT_DE_PASSE",
        },
      },
      select: { Valeur: true },
    })
    const existingEncryptedPassword = existingPasswordParam?.Valeur || ""
    const passwordValueToStore = nextPassword
      ? encryptSmtpPassword(nextPassword)
      : existingEncryptedPassword

    if (!passwordValueToStore) {
      return apiError(400, "invalid_input", "Le mot de passe SMTP est requis pour la premiere configuration")
    }

    const updates = [
      { Mot_Cle: "SMTP_ACTIVATION", Valeur: body.enabled ? "true" : "false" },
      { Mot_Cle: "SMTP_SERVEUR", Valeur: body.host },
      { Mot_Cle: "SMTP_PORT", Valeur: body.port.toString() },
      { Mot_Cle: "SMTP_UTILISATEUR", Valeur: body.user },
      { Mot_Cle: "SMTP_MOT_DE_PASSE", Valeur: passwordValueToStore },
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
      enabled: body.enabled,
      host: body.host,
      port: body.port,
      sender: body.sender,
      passwordEncrypted: isEncryptedSmtpPassword(passwordValueToStore),
      passwordUpdated: !!nextPassword,
    })

    log.audit("CC", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      resource: "Configuration SMTP",
      changes: {
        enabled: body.enabled,
        host: body.host,
        port: body.port,
        user: body.user,
        sender: body.sender,
        passwordUpdated: !!nextPassword,
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
