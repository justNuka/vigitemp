import { hasApplicationEmailAccess } from "@/lib/license-access"
import { validateLicense, type LicenseResponse } from "@/lib/license-server"

export async function canUseApplicationEmail(): Promise<{
  allowed: boolean
  reason: "ok" | "license_invalid" | "pack_mail_option_missing"
  license?: LicenseResponse
}> {
  const license = await validateLicense()
  if (!license.ok) {
    return { allowed: false, reason: "license_invalid", license }
  }

  if (!hasApplicationEmailAccess(license)) {
    return { allowed: false, reason: "pack_mail_option_missing", license }
  }

  return { allowed: true, reason: "ok", license }
}
