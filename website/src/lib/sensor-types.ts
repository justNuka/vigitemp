export type SensorFamily = "CLASSIC" | "GSO" | "GSP"

export const CLASSIC_SENSOR_TYPE_CODES = ["E", "G", "H", "I", "R", "V"] as const

export const GSO_SENSOR_TYPE_CODES = ["SOIT", "SOIH", "SOET", "SOEH"] as const

export const GSP_SENSOR_TYPE_CODES = [
  "SPNB",
  "SPNG",
  "SPPS",
  "SPAL",
  "SPPC",
  "SPAU",
  "SPCF",
  "SPMI",
  "SPCO",
  "SPHY",
  "SPTH",
  "SPDI",
  "SPAT",
  "SPLU",
  "SP01",
  "SP42",
  "SPOF",
  "SPXB",
  "SPXG",
  "SPXP",
  "SPFB",
  "SPFG",
  "SPFP",
] as const

// Legacy aggregate types kept only for compatibility while old rows still exist.
export const LEGACY_GENERIC_SENSOR_TYPE_CODES = ["GSO", "GSP"] as const
export const KNOWN_SENSOR_TYPE_CODES = [
  ...CLASSIC_SENSOR_TYPE_CODES,
  ...GSO_SENSOR_TYPE_CODES,
  ...GSP_SENSOR_TYPE_CODES,
  ...LEGACY_GENERIC_SENSOR_TYPE_CODES,
] as const

export const CLASSIC_SENSOR_TYPE_CODE_SET = new Set<string>(CLASSIC_SENSOR_TYPE_CODES)
export const GSO_SENSOR_TYPE_CODE_SET = new Set<string>(GSO_SENSOR_TYPE_CODES)
export const GSP_SENSOR_TYPE_CODE_SET = new Set<string>(GSP_SENSOR_TYPE_CODES)
export const LEGACY_GENERIC_SENSOR_TYPE_CODE_SET = new Set<string>(LEGACY_GENERIC_SENSOR_TYPE_CODES)

export const SENSOR_TYPE_FAMILY_BY_CODE = new Map<string, SensorFamily>([
  ...CLASSIC_SENSOR_TYPE_CODES.map((code) => [code, "CLASSIC"] as const),
  ...GSO_SENSOR_TYPE_CODES.map((code) => [code, "GSO"] as const),
  ...GSP_SENSOR_TYPE_CODES.map((code) => [code, "GSP"] as const),
  ["GSO", "GSO"],
  ["GSP", "GSP"],
])

export function normalizeSensorTypeCode(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase().replace(/-+$/g, "")
}

export function getKnownSensorFamilyFromTypeCode(value: string | null | undefined): SensorFamily {
  const normalized = normalizeSensorTypeCode(value)
  return SENSOR_TYPE_FAMILY_BY_CODE.get(normalized) ?? "CLASSIC"
}

export function isLegacyGenericSensorTypeCode(value: string | null | undefined) {
  return LEGACY_GENERIC_SENSOR_TYPE_CODE_SET.has(normalizeSensorTypeCode(value))
}
