export const DEFAULT_CALIBRATION_WARNING_DAYS = 15
export const MAX_CALIBRATION_WARNING_DAYS = 365

export function normalizeCalibrationWarningDays(
  value: unknown,
  fallback: number = DEFAULT_CALIBRATION_WARNING_DAYS,
): number {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.trim())
        : Number.NaN

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return Math.min(Math.max(Math.trunc(fallback), 1), MAX_CALIBRATION_WARNING_DAYS)
  }

  return Math.min(Math.max(Math.trunc(numeric), 1), MAX_CALIBRATION_WARNING_DAYS)
}

export function getCalibrationWarningParameterCandidates() {
  return [
    { Section: "dashboard", Mot_Cle: "etalonnage_warning_days" },
    { Section: "DASHBOARD", Mot_Cle: "ETALONNAGE_WARNING_DAYS" },
    { Section: "dashboard", Mot_Cle: "ETALONNAGE_WARNING_DAYS" },
    { Section: "DASHBOARD", Mot_Cle: "etalonnage_warning_days" },
  ] as const
}
