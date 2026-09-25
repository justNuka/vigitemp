export type AlarmTypeCode =
  | "H"
  | "B"
  | "CH"
  | "CB"
  | "N"
  | "S"
  | "A"
  | "M"
  | "T"

export type AlarmCategory =
  | "high"
  | "low"
  | "no-response"
  | "sector"
  | "module"
  | "ended"
  | "temperature"

export function normalizeAlarmTypeCode(value: string | null | undefined): string {
  return (value ?? "").trim().toUpperCase()
}

export function isCriticalThresholdAlarmType(value: string | null | undefined) {
  const type = normalizeAlarmTypeCode(value)
  return type === "CH" || type === "CB"
}

export function isHighThresholdAlarmType(value: string | null | undefined) {
  const type = normalizeAlarmTypeCode(value)
  return type === "H" || type === "CH"
}

export function isLowThresholdAlarmType(value: string | null | undefined) {
  const type = normalizeAlarmTypeCode(value)
  return type === "B" || type === "CB"
}

export function isThresholdAlarmType(value: string | null | undefined) {
  return isHighThresholdAlarmType(value) || isLowThresholdAlarmType(value)
}

export function isTechnicalAlarmType(value: string | null | undefined) {
  const type = normalizeAlarmTypeCode(value)
  return type === "N" || type === "S" || type === "A" || type === "M"
}

export function mapAlarmTypeCategory(
  value: string | null | undefined,
): AlarmCategory | null {
  const type = normalizeAlarmTypeCode(value)
  if (type === "H" || type === "CH") return "high"
  if (type === "B" || type === "CB") return "low"
  if (type === "N") return "no-response"
  if (type === "S" || type === "A") return "sector"
  if (type === "M") return "module"
  if (type === "T") return "ended"
  return null
}
