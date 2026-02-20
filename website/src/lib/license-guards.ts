import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";
import { validateLicense } from "@/lib/license-server";
import { isStandardOrExpert } from "@/lib/license-access";

export async function requireStandardOrExpertLicense(): Promise<NextResponse | null> {
  const license = await validateLicense();

  if (!license.ok) {
    return apiError(403, "license_invalid", "Licence invalide");
  }

  if (!isStandardOrExpert(license)) {
    return apiError(403, "license_forbidden", "Fonctionnalite reservee aux licences Standard et Expert");
  }

  return null;
}

export async function requireStandardOrExpertIfFieldsUsed(
  payload: Record<string, unknown>,
  fields: readonly string[],
): Promise<NextResponse | null> {
  const needsStandard = fields.some((field) => Object.prototype.hasOwnProperty.call(payload, field));
  if (!needsStandard) {
    return null;
  }

  return requireStandardOrExpertLicense();
}
