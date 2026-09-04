import { NextRequest } from "next/server"

import { withAdminLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { requireTelephonyLicense } from "@/lib/license-guards"
import { getTelephonyConfig, saveTelephonyConfig } from "@/lib/telephony/config"
import { OvhVoipProvider } from "@/lib/telephony/ovh-provider"

export const GET = withAdminLogging(async (_req: NextRequest) => {
  const licenseError = await requireTelephonyLicense()
  if (licenseError) return licenseError

  try {
    const config = await getTelephonyConfig()
    if (config.provider !== "ovhcloud") {
      return apiOk([])
    }

    const provider = new OvhVoipProvider(config)
    const users = await provider.listClick2CallUsers()
    return apiOk(users)
  } catch (error) {
    return apiError(500, "telephony_ovh_click2call_users_failed", error instanceof Error ? error.message : "Erreur serveur")
  }
})

export const POST = withAdminLogging(async (_req: NextRequest) => {
  const licenseError = await requireTelephonyLicense()
  if (licenseError) return licenseError

  try {
    const config = await getTelephonyConfig()
    if (config.provider !== "ovhcloud") {
      return apiError(400, "telephony_provider_invalid", "Le provider courant n'est pas OVHcloud")
    }

    const provider = new OvhVoipProvider(config)
    const user = await provider.createClick2CallUser()

    await saveTelephonyConfig({
      ...config,
      ovhClick2CallUserId: String(user.id),
    })

    return apiOk(user)
  } catch (error) {
    return apiError(500, "telephony_ovh_click2call_create_failed", error instanceof Error ? error.message : "Erreur serveur")
  }
})
