import { LicenseInfo } from "@/components/license/license-provider";

export function formatLicenseLabel(
  license: LicenseInfo | null,
  tCommon: (key: string) => string
) {
  if (!license) {
    return tCommon("license_unknown");
  }
  if (!license.ok) {
    return tCommon("license_invalid");
  }
  const edition = (license.edition || "light").trim();
  if (!edition) {
    return tCommon("license_unknown");
  }
  const formatted = edition.charAt(0).toUpperCase() + edition.slice(1);
  return `${tCommon("license_prefix")} ${formatted}`;
}
