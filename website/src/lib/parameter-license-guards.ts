import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { isStandardOrExpert } from "@/lib/license-access";
import { validateLicense } from "@/lib/license-server";

export type ParameterIdentity = {
  section: string | null;
  motCle: string | null;
};

const STANDARD_ONLY_SECTIONS = new Set(["CFR21", "STATISTICS_MONTHLY_REPORT"]);

const STANDARD_ONLY_KEYS = new Set([
  "DASHBOARD:SURVEILLANCE_REFRESH",
]);

function normalizePart(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase();
}

export function isStandardOnlyParameter(section: string | null | undefined, motCle: string | null | undefined) {
  const normalizedSection = normalizePart(section);
  const normalizedMotCle = normalizePart(motCle);
  if (!normalizedSection || !normalizedMotCle) return false;

  return (
    STANDARD_ONLY_SECTIONS.has(normalizedSection) ||
    STANDARD_ONLY_KEYS.has(`${normalizedSection}:${normalizedMotCle}`)
  );
}

export async function requireParameterLicense(
  section: string | null | undefined,
  motCle: string | null | undefined,
): Promise<NextResponse | null> {
  if (!isStandardOnlyParameter(section, motCle)) {
    return null;
  }

  const license = await validateLicense();
  if (!license.ok) {
    return apiError(403, "license_invalid", "Licence invalide");
  }

  if (!isStandardOrExpert(license)) {
    return apiError(403, "license_forbidden", "Parametre reserve aux licences Standard et Expert");
  }

  return null;
}

export async function filterParametersForLicense<T extends ParameterIdentity>(settings: T[]): Promise<T[]> {
  const restricted = settings.some((setting) => isStandardOnlyParameter(setting.section, setting.motCle));
  if (!restricted) return settings;

  const license = await validateLicense();
  if (!license.ok || !isStandardOrExpert(license)) {
    return settings.filter((setting) => !isStandardOnlyParameter(setting.section, setting.motCle));
  }

  return settings;
}
