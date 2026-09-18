import { NextRequest } from "next/server"

import { summarizeTelephonyService } from "@/lib/admin-telephony-service-status"
import { withAdminLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { requireTelephonyLicense } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { getTelephonyConfig } from "@/lib/telephony/config"

export const GET = withAdminLogging(async (_req: NextRequest) => {
  const licenseError = await requireTelephonyLicense()
  if (licenseError) return licenseError

  try {
    const config = await getTelephonyConfig()
    return apiOk(summarizeTelephonyService(config))
  } catch (error) {
    log.error("TELEPHONY_STATUS", "telephony_status_fetch_failed", {
      error: error instanceof Error ? error.message : String(error),
    })
    return apiError(500, "telephony_status_fetch_failed", "Impossible de charger l'état de la téléphonie")
  }
})
