import { NextRequest } from "next/server"

import { withAdminLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { getTelephonyConfig } from "@/lib/telephony/config"
import { TwilioVoiceProvider } from "@/lib/telephony/twilio-provider"

export const POST = withAdminLogging(async (req: NextRequest) => {
  try {
    const body = (await req.json()) as { to?: string }
    const to = body.to?.trim() || ""

    if (!to) {
      return apiError(400, "telephony_test_number_missing", "Numero de test requis")
    }

    const config = await getTelephonyConfig()
    if (config.provider !== "twilio") {
      return apiError(400, "telephony_provider_invalid", "Le provider courant n'est pas Twilio")
    }

    const provider = new TwilioVoiceProvider(config)
    const validation = provider.validateConfig()
    if (!validation.ok) {
      return apiError(400, "telephony_config_invalid", `Champs requis manquants: ${validation.missing.join(", ")}`)
    }

    return apiOk(await provider.triggerTestCall(to))
  } catch (error) {
    return apiError(500, "telephony_twilio_test_call_failed", error instanceof Error ? error.message : "Erreur serveur")
  }
})
