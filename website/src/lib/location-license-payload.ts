import type { LicenseLike } from "@/lib/license-access"
import { isStandardOrExpert } from "@/lib/license-access"

export const STANDARD_METROLOGY_LOCATION_FIELDS = [
  "EMT_Mode",
  "EMT_Valeur",
  "Corriger_Erreur_Justesse",
  "Prendre_En_Compte_Derive",
  "Derniere_Date_Etalonnage",
  "Applied_Etalonnage_Id",
  "Unite",
  "Erreur_Justesse",
  "Incertitude",
  "Derive",
] as const

export function stripRestrictedLocationMetrologyFields<T extends Record<string, unknown>>(
  payload: T,
): T {
  const next = { ...payload }

  for (const field of STANDARD_METROLOGY_LOCATION_FIELDS) {
    delete next[field]
  }

  return next
}

export function prepareLocationPayloadForLicense<T extends Record<string, unknown>>(
  payload: T,
  license: LicenseLike,
): T {
  return isStandardOrExpert(license)
    ? payload
    : stripRestrictedLocationMetrologyFields(payload)
}
