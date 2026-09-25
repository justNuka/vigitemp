import type { TelephonyServiceStatus } from "@/lib/admin-service-status"
import {
  getTelephonyConfigMissingFields,
  type TelephonyConfig,
} from "@/lib/telephony/config"

// Server-side helper by import topology. Do not import this file from Client Components:
// telephony/config.ts depends on Prisma and database drivers. The browser-safe contract lives
// in admin-service-status.ts and the production build validates this boundary.
export function summarizeTelephonyService(
  config: TelephonyConfig,
): TelephonyServiceStatus {
  if (config.provider === "none") {
    return {
      enabled: config.enabled,
      provider: config.provider,
      configured: false,
    }
  }

  const missingFields = getTelephonyConfigMissingFields({
    ...config,
    enabled: true,
  })

  return {
    enabled: config.enabled,
    provider: config.provider,
    configured: missingFields.length === 0,
  }
}
