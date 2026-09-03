import { NextRequest } from "next/server"

import { withAdminLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { getTelephonyConfig } from "@/lib/telephony/config"
import { TwilioVoiceProvider } from "@/lib/telephony/twilio-provider"

export const POST = withAdminLogging(async (_req: NextRequest) => {
  try {
    const config = await getTelephonyConfig()
    if (config.provider !== "twilio") {
      return apiError(400, "telephony_provider_invalid", "Le provider courant n'est pas Twilio")
    }

    const provider = new TwilioVoiceProvider(config)
    const validation = provider.validateConfig()
    if (!validation.ok) {
      return apiError(400, "telephony_config_invalid", `Champs requis manquants: ${validation.missing.join(", ")}`)
    }

    return apiOk(await provider.testConnection())
  } catch (error) {
    return apiError(500, "telephony_twilio_test_failed", error instanceof Error ? error.message : "Erreur serveur")
  }
})
