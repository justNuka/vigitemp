import { NextRequest } from "next/server"

import { withAdminLogging, type HandlerContext } from "@/lib/api-wrappers"
import { getRequestContext } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"
import {
  getTelephonyConfig,
  getTelephonyConfigMissingFields,
  saveTelephonyConfig,
  sanitizeTelephonyConfigForAudit,
  type TelephonyConfig,
} from "@/lib/telephony/config"

export const GET = withAdminLogging(async (_req: NextRequest) => {
  try {
    const config = await getTelephonyConfig()
    return apiOk(config)
  } catch (error) {
    return apiError(500, "telephony_config_fetch_failed", error instanceof Error ? error.message : "Erreur serveur")
  }
})

export const PUT = withAdminLogging(async (req: NextRequest, ctx: HandlerContext) => {
  try {
    const { ip } = getRequestContext(req)
    const config = (await req.json()) as TelephonyConfig
    const missing = getTelephonyConfigMissingFields(config)

    if (config.enabled && missing.length > 0) {
      return apiError(400, "telephony_config_invalid", `Champs requis manquants: ${missing.join(", ")}`)
    }

    await saveTelephonyConfig(config)

    log.audit("CC", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      resource: "Configuration telephonie",
      changes: sanitizeTelephonyConfigForAudit(config),
    })

    return apiOk({ saved: true })
  } catch (error) {
    log.error("TELEPHONY_CONFIG", "telephony_config_save_failed", {
      error: error instanceof Error ? error.message : String(error),
    })
    return apiError(500, "telephony_config_save_failed", error instanceof Error ? error.message : "Erreur serveur")
  }
})
