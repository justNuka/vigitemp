const COEFFICIENT_EPSILON = 1e-12

export type GspPhysicalCoefficients = {
  coeffA: number
  coeffB: number
  coeffC: number
  multipoint: boolean
}

export type GspStoredCoefficients = {
  coeffX2: number
  coeffX: number
  coeffConstant: number
}

function parseNumber(value: string | null | undefined) {
  if (!value) return null
  const parsed = Number(value.trim().replace(",", "."))
  return Number.isFinite(parsed) ? parsed : null
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function readNamedNumber(raw: string, names: string[]) {
  for (const name of names) {
    const escaped = escapeRegExp(name)
    const match = new RegExp(
      `(?:^|[\\r\\n;])\\s*${escaped}\\s*=\\s*([-+]?\\d+(?:[.,]\\d+)?(?:[eE][-+]?\\d+)?)`,
      "i",
    ).exec(raw)
    const value = parseNumber(match?.[1])
    if (value != null) return value
  }
  return null
}

function readCompactNumber(raw: string, marker: "a" | "b" | "c") {
  const match = new RegExp(
    `([-+]?\\d+(?:[.,]\\d+)?(?:[eE][-+]?\\d+)?)${marker}(?=[-+]?\\d|\\s|$)`,
    "i",
  ).exec(raw)
  return parseNumber(match?.[1])
}

function readMultipoint(raw: string) {
  const named = readNamedNumber(raw, ["Multi", "Multipoint", "M"])
  if (named != null) return Math.round(named) === 1

  const compact = /(?:^|[^A-Za-z0-9])([01])m(?:[^A-Za-z0-9]|$)/i.exec(raw)
  if (compact) return compact[1] === "1"
  return null
}

export function parseGspCoefficientResponse(rawValue: string | null | undefined): GspPhysicalCoefficients | null {
  const raw = rawValue?.trim() ?? ""
  if (!raw) return null

  const coeffA = readNamedNumber(raw, ["A", "CoeffA", "Coeff_A"]) ?? readCompactNumber(raw, "a")
  const coeffB = readNamedNumber(raw, ["B", "CoeffB", "Coeff_B"]) ?? readCompactNumber(raw, "b")
  const coeffC = readNamedNumber(raw, ["C", "CoeffC", "Coeff_C", "Etalonnage"]) ?? readCompactNumber(raw, "c")

  if (coeffA == null || coeffB == null) return null

  const normalizedC = coeffC ?? 0
  const explicitMultipoint = readMultipoint(raw)
  return {
    coeffA,
    coeffB,
    coeffC: normalizedC,
    multipoint: explicitMultipoint ?? Math.abs(normalizedC) > COEFFICIENT_EPSILON,
  }
}

export function mapGspPhysicalCoefficientsToStorage(
  coefficients: GspPhysicalCoefficients,
): GspStoredCoefficients {
  if (coefficients.multipoint) {
    return {
      coeffX2: coefficients.coeffA,
      coeffX: coefficients.coeffB,
      coeffConstant: coefficients.coeffC,
    }
  }

  return {
    coeffX2: 0,
    coeffX: coefficients.coeffA,
    coeffConstant: coefficients.coeffB,
  }
}
