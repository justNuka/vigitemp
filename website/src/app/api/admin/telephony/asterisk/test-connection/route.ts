import { NextRequest } from "next/server"

import { withAdminLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { AsteriskAriProvider } from "@/lib/telephony/asterisk-provider"
import { getTelephonyConfig } from "@/lib/telephony/config"

export const POST = withAdminLogging(async (_req: NextRequest) => {
  try {
    const config = await getTelephonyConfig()
    if (config.provider !== "asterisk") {
      return apiError(400, "telephony_provider_invalid", "Le provider courant n'est pas Asterisk")
    }

    const provider = new AsteriskAriProvider(config)
    const validation = provider.validateConfig()
    if (!validation.ok) {
      return apiError(400, "telephony_config_invalid", `Champs requis manquants: ${validation.missing.join(", ")}`)
    }

    const result = await provider.testConnection()
    return apiOk(result)
  } catch (error) {
    return apiError(500, "telephony_asterisk_test_failed", error instanceof Error ? error.message : "Erreur serveur")
  }
})
