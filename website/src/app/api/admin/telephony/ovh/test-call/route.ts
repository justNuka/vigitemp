import { NextRequest } from "next/server"

import { withAdminLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { getTelephonyConfig } from "@/lib/telephony/config"
import { OvhVoipProvider } from "@/lib/telephony/ovh-provider"

export const POST = withAdminLogging(async (req: NextRequest) => {
  try {
    const body = (await req.json()) as { to?: string }
    const to = body.to?.trim() || ""

    if (!to) {
      return apiError(400, "telephony_test_number_missing", "Numero de test requis")
    }

    const config = await getTelephonyConfig()
    if (config.provider !== "ovhcloud") {
      return apiError(400, "telephony_provider_invalid", "Le provider courant n'est pas OVHcloud")
    }

    const provider = new OvhVoipProvider(config)
    const result = await provider.triggerCall(to)
    return apiOk({ called: to, result })
  } catch (error) {
    return apiError(500, "telephony_test_call_failed", error instanceof Error ? error.message : "Erreur serveur")
  }
})
