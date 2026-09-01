import { isPack } from "@/lib/license-access"
import { validateLicense, type LicenseResponse } from "@/lib/license-server"

const PACK_EMAIL_OPTION_KEYS = new Set([
  "mail",
  "email",
  "emails",
  "notification_mail",
  "notification_email",
  "notifications_mail",
  "notifications_email",
  "alarm_mail",
  "alarm_email",
])

function hasPackEmailOption(license: LicenseResponse) {
  return (license.options ?? []).some((option) =>
    PACK_EMAIL_OPTION_KEYS.has(String(option).trim().toLowerCase()),
  )
}

export async function canUseApplicationEmail(): Promise<{
  allowed: boolean
  reason: "ok" | "license_invalid" | "pack_mail_option_missing"
  license?: LicenseResponse
}> {
  const license = await validateLicense()
  if (!license.ok) {
    return { allowed: false, reason: "license_invalid", license }
  }

  if (isPack(license) && !hasPackEmailOption(license)) {
    return { allowed: false, reason: "pack_mail_option_missing", license }
  }

  return { allowed: true, reason: "ok", license }
}
