import { NextRequest } from "next/server"

import { getRequestContext } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { withAdminLogging, type HandlerContext } from "@/lib/api-wrappers"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { encryptSmtpPassword, isEncryptedSmtpPassword } from "@/lib/secret-crypto"
import {
  clearSmtpVerificationChallenge,
  getSmtpConfigState,
  setSmtpConfirmed,
  SMTP_KEYS,
  SMTP_SECTION,
  upsertSmtpParameter,
} from "@/lib/smtp-config"

type SMTPConfigUpdate = {
  host: string
  port: number
  user: string
  password?: string
  sender: string
}

type SMTPActivationUpdate = {
  enabled: boolean
}

function normalize(value: string | null | undefined) {
  return (value ?? "").trim()
}

/**
 * GET/PUT/PATCH /api/admin/configuration-smtp
 * Paramètres SMTP stockés dans t_parametre / SECURITE_EMAIL.
 *
 * PATCH ne modifie que l'activation globale.
 * PUT modifie les paramètres techniques et invalide leur confirmation
 * lorsqu'une valeur réellement utilisée change.
 */
export const GET = withAdminLogging(
  async (req: NextRequest, ctx: HandlerContext) => {
    try {
      const { ip } = getRequestContext(req)
      const config = await getSmtpConfigState()

      log.info("SMTP_CONFIG", "SMTP configuration fetched", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        ip,
        enabled: config.enabled,
        configured: config.configured,
        confirmed: config.confirmed,
        hostConfigured: Boolean(config.host),
        userConfigured: Boolean(config.user),
        passwordConfigured: config.passwordConfigured,
      })

      return apiOk({
        enabled: config.enabled,
        host: config.host,
        port: config.port,
        user: config.user,
        password: "",
        sender: config.sender,
        passwordConfigured: config.passwordConfigured,
        configured: config.configured,
        confirmed: config.confirmed,
      })
    } catch (error) {
      log.error("SMTP_CONFIG", "Failed to fetch SMTP configuration", {
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(500, "internal_error", "Erreur serveur")
    }
  },
)

export const PATCH = withAdminLogging(
  async (req: NextRequest, ctx: HandlerContext) => {
    try {
      const { ip } = getRequestContext(req)
      const body = (await req.json()) as SMTPActivationUpdate

      if (typeof body.enabled !== "boolean") {
        return apiError(
          400,
          "invalid_input",
          "État d'activation SMTP invalide",
        )
      }

      await upsertSmtpParameter(
        SMTP_KEYS.enabled,
        body.enabled ? "true" : "false",
        "Activer l'envoi d'emails",
      )

      if (!body.enabled) {
        await clearSmtpVerificationChallenge()
      }

      log.audit("CC", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        ip,
        resource: "Activation SMTP",
        changes: {
          enabled: body.enabled,
        },
      })

      return apiOk({ enabled: body.enabled })
    } catch (error) {
      log.error("SMTP_CONFIG", "Failed to update SMTP activation", {
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(500, "internal_error", "Erreur serveur")
    }
  },
)

export const PUT = withAdminLogging(
  async (req: NextRequest, ctx: HandlerContext) => {
    try {
      const { ip } = getRequestContext(req)
      const body = (await req.json()) as SMTPConfigUpdate

      const host = normalize(body.host)
      const user = normalize(body.user)
      const sender = normalize(body.sender)
      const port = Number(body.port)

      if (
        !host ||
        !user ||
        !sender ||
        !Number.isInteger(port) ||
        port < 1 ||
        port > 65535
      ) {
        return apiError(
          400,
          "invalid_input",
          "Paramètres SMTP incomplets",
        )
      }

      const existing = await getSmtpConfigState({ includePassword: true })
      const submittedPassword = normalize(body.password)
      const nextPassword = submittedPassword || existing.password

      if (!nextPassword) {
        return apiError(
          400,
          "invalid_input",
          "Le mot de passe SMTP est requis pour la première configuration",
        )
      }

      const existingPasswordParam = await prisma.t_parametre.findUnique({
        where: {
          Section_Mot_Cle: {
            Section: SMTP_SECTION,
            Mot_Cle: SMTP_KEYS.password,
          },
        },
        select: { Valeur: true },
      })

      const passwordChanged =
        Boolean(submittedPassword) && submittedPassword !== existing.password
      const passwordValueToStore = passwordChanged
        ? encryptSmtpPassword(submittedPassword)
        : existingPasswordParam?.Valeur || encryptSmtpPassword(nextPassword)

      const changed =
        host !== existing.host.trim() ||
        port !== existing.port ||
        user !== existing.user.trim() ||
        sender !== existing.sender.trim() ||
        passwordChanged

      const updates = [
        {
          key: SMTP_KEYS.host,
          value: host,
          comment: "Serveur SMTP pour l'envoi d'emails",
        },
        {
          key: SMTP_KEYS.port,
          value: String(port),
          comment: "Port SMTP",
        },
        {
          key: SMTP_KEYS.user,
          value: user,
          comment: "Utilisateur SMTP",
        },
        {
          key: SMTP_KEYS.password,
          value: passwordValueToStore,
          comment: "Mot de passe SMTP chiffré",
        },
        {
          key: SMTP_KEYS.sender,
          value: sender,
          comment: "Adresse email expéditeur",
        },
      ]

      for (const update of updates) {
        await upsertSmtpParameter(
          update.key,
          update.value,
          update.comment,
        )
      }

      if (changed) {
        await setSmtpConfirmed(false)
        await clearSmtpVerificationChallenge()
      }

      const confirmed = changed ? false : existing.confirmed

      log.info("SMTP_CONFIG", "SMTP configuration updated", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        ip,
        host,
        port,
        sender,
        passwordEncrypted: isEncryptedSmtpPassword(passwordValueToStore),
        passwordUpdated: passwordChanged,
        changed,
        confirmed,
      })

      log.audit("CC", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        ip,
        resource: "Configuration SMTP",
        changes: {
          host,
          port,
          user,
          sender,
          passwordUpdated: passwordChanged,
          confirmationInvalidated: changed,
        },
      })

      return apiOk({
        message: "Configuration SMTP enregistrée",
        changed,
        confirmed,
        verificationRequired: changed || !confirmed,
      })
    } catch (error) {
      log.error("SMTP_CONFIG", "Failed to update SMTP configuration", {
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(500, "internal_error", "Erreur serveur")
    }
  },
)
