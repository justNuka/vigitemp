import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { getHardwareCatalog, getHardwareOrderCapabilities } from "@/lib/hardware-order"
import { log } from "@/lib/logger"

export const GET = withAuthLogging(async () => {
  try {
    const [catalog, capabilities] = await Promise.all([
      getHardwareCatalog(),
      getHardwareOrderCapabilities(),
    ])

    return apiOk({
      catalog,
      commercialEmail: capabilities.commercialEmail,
      smtpReady: capabilities.smtpReady,
      emailLicenseSkipped: capabilities.emailLicenseSkipped,
    })
  } catch (error) {
    log.error("services/hardware/catalog", "catalog_fetch_failed", { error })
    return apiError(500, "catalog_fetch_failed", "Erreur lors du chargement du catalogue")
  }
})
