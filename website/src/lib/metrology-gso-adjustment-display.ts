const COEFFICIENT_EPSILON = 1e-12

type GsoAdjustmentCoefficients = {
  coeffA: number
  coeffB: number
  coeffC: number
}

type GsoAdjustmentReading = {
  value: number | null
  rawValue: string | null
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

export function calculateGsoAdjustmentDisplayValue(
  rawValue: number,
  coefficients: GsoAdjustmentCoefficients,
) {
  const { coeffA, coeffB, coeffC } = coefficients
  if (![rawValue, coeffA, coeffB, coeffC].every(Number.isFinite)) return null

  const usesThreeCoefficients = Math.abs(coeffC) > COEFFICIENT_EPSILON
  const adjustedValue = usesThreeCoefficients
    ? coeffA * rawValue ** 2 + coeffB * rawValue + coeffC
    : coeffA * rawValue + coeffB

  return Number.isFinite(adjustedValue) ? adjustedValue : null
}

export function withGsoAdjustmentDisplayValue<T extends GsoAdjustmentReading>(
  reading: T,
  coefficients: GsoAdjustmentCoefficients,
): T {
  // During an adjustment, GSO database triggers deliberately persist the raw
  // signal in tm_mesures_ajustage. Keep that raw signal available for the
  // adjustment calculation, but expose a coefficient-corrected value to the UI.
  const rawValue = asFiniteNumber(reading.rawValue) ?? asFiniteNumber(reading.value)
  if (rawValue == null) return reading

  const adjustedValue = calculateGsoAdjustmentDisplayValue(rawValue, coefficients)
  if (adjustedValue == null) return reading

  return {
    ...reading,
    value: adjustedValue,
    rawValue: reading.rawValue ?? String(rawValue),
  }
}
