import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import {
  withAnyAuthorizationLogging,
  withAuthorizationLogging,
  type ApiHandler,
} from "@/lib/api-wrappers";
import { hasLicenseOption, isOneOrHigher, isStandardOrExpert } from "@/lib/license-access";
import { validateLicense } from "@/lib/license-server";

export type { HandlerContext } from "@/lib/api-wrappers";

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

export async function requireOneOrHigherLicense(): Promise<NextResponse | null> {
  const license = await validateLicense();

  if (!license.ok) {
    return apiError(403, "license_invalid", "Licence invalide");
  }

  if (!isOneOrHigher(license)) {
    return apiError(403, "license_forbidden", "Fonctionnalite reservee aux licences One, Standard et Expert");
  }

  return null;
}

export async function requireLicenseOption(option: string): Promise<NextResponse | null> {
  const license = await validateLicense();

  if (!license.ok) {
    return apiError(403, "license_invalid", "Licence invalide");
  }

  if (!hasLicenseOption(license, option)) {
    return apiError(403, "license_option_forbidden", "Fonctionnalite non disponible avec votre licence");
  }

  return null;
}

export async function requireTelephonyLicense(): Promise<NextResponse | null> {
  return requireLicenseOption("telephonie");
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

export function withStandardOrExpertAuthorizationLogging(
  requiredCode: string,
  handler: ApiHandler,
  options?: { skipLogging?: boolean; label?: string },
) {
  return withAuthorizationLogging(
    requiredCode,
    async (req, ctx, ...args) => {
      const licenseError = await requireStandardOrExpertLicense();
      if (licenseError) return licenseError;
      return handler(req, ctx, ...args);
    },
    options,
  );
}

export function withStandardOrExpertAnyAuthorizationLogging(
  requiredCodes: readonly string[],
  handler: ApiHandler,
  options?: { skipLogging?: boolean; label?: string },
) {
  return withAnyAuthorizationLogging(
    requiredCodes,
    async (req, ctx, ...args) => {
      const licenseError = await requireStandardOrExpertLicense();
      if (licenseError) return licenseError;
      return handler(req, ctx, ...args);
    },
    options,
  );
}

export function withOneOrHigherAuthorizationLogging(
  requiredCode: string,
  handler: ApiHandler,
  options?: { skipLogging?: boolean; label?: string },
) {
  return withAuthorizationLogging(
    requiredCode,
    async (req, ctx, ...args) => {
      const licenseError = await requireOneOrHigherLicense();
      if (licenseError) return licenseError;
      return handler(req, ctx, ...args);
    },
    options,
  );
}

export function withOneOrHigherAnyAuthorizationLogging(
  requiredCodes: readonly string[],
  handler: ApiHandler,
  options?: { skipLogging?: boolean; label?: string },
) {
  return withAnyAuthorizationLogging(
    requiredCodes,
    async (req, ctx, ...args) => {
      const licenseError = await requireOneOrHigherLicense();
      if (licenseError) return licenseError;
      return handler(req, ctx, ...args);
    },
    options,
  );
}
