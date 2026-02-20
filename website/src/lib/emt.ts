export type EmtMode = "quart" | "manuel" | "uncertainties" | "sans-objet"

export type EmtInput = {
  mode?: string | null
  emtValue?: number | null
  consigne?: number | null
  consigneSup?: number | null
  consigneInf?: number | null
  isConsigneSupActive?: boolean | null
  isConsigneInfActive?: boolean | null
  incertitude?: number | null
  erreurJustesse?: number | null
  derive?: number | null
  includeDeriveInUncertainty?: boolean | null
  correctAccuracyError?: boolean | null
}

export type EmtComputation = {
  mode: EmtMode
  emtSonde: number | null
  toleranceSup: number | null
  toleranceInf: number | null
}

const MODE_TO_DB: Record<EmtMode, number> = {
  quart: 1,
  manuel: 2,
  uncertainties: 3,
  "sans-objet": 4,
}

const DB_TO_MODE: Record<number, EmtMode> = {
  1: "quart",
  2: "manuel",
  3: "uncertainties",
  4: "sans-objet",
}

function toNumber(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null
  if (!Number.isFinite(value)) return null
  return value
}

function normalizeMode(mode?: string | null): EmtMode {
  if (mode === "quart" || mode === "manuel" || mode === "uncertainties" || mode === "sans-objet") {
    return mode
  }
  return "sans-objet"
}

function computeQuartEmt(input: EmtInput): number | null {
  const consigne = toNumber(input.consigne)
  if (consigne === null) return null

  const gaps: number[] = []

  if (input.isConsigneSupActive) {
    const sup = toNumber(input.consigneSup)
    if (sup !== null && sup > consigne) gaps.push(sup - consigne)
  }

  if (input.isConsigneInfActive) {
    const inf = toNumber(input.consigneInf)
    if (inf !== null && inf < consigne) gaps.push(consigne - inf)
  }

  if (gaps.length === 0) return null
  return Math.min(...gaps) / 4
}

function computeUncertaintyEmt(input: EmtInput): number | null {
  const incertitude = Math.abs(toNumber(input.incertitude) ?? 0)
  const erreurJustesse = Math.abs(toNumber(input.erreurJustesse) ?? 0)
  const derive = Math.abs(toNumber(input.derive) ?? 0)
  const shouldCorrectAccuracy = input.correctAccuracyError === true

  const ejContribution = shouldCorrectAccuracy ? 0 : erreurJustesse

  if (!input.includeDeriveInUncertainty) {
    const imes = ejContribution + incertitude
    return imes > 0 ? imes : null
  }

  const withDerive = 2 * Math.sqrt(Math.pow(incertitude / 2, 2) + Math.pow(derive / Math.sqrt(3), 2))
  const imes = ejContribution + withDerive
  return imes > 0 ? imes : null
}

export function computeEmt(input: EmtInput): EmtComputation {
  const mode = normalizeMode(input.mode)
  let emtSonde: number | null = null

  if (mode === "quart") {
    emtSonde = computeQuartEmt(input)
  } else if (mode === "manuel") {
    emtSonde = toNumber(input.emtValue)
  } else if (mode === "uncertainties") {
    emtSonde = computeUncertaintyEmt(input)
  }

  const sup = toNumber(input.consigneSup)
  const inf = toNumber(input.consigneInf)

  const toleranceSup =
    input.isConsigneSupActive && sup !== null
      ? emtSonde !== null
        ? sup - emtSonde
        : sup
      : null

  const toleranceInf =
    input.isConsigneInfActive && inf !== null
      ? emtSonde !== null
        ? inf + emtSonde
        : inf
      : null

  return { mode, emtSonde, toleranceSup, toleranceInf }
}

export function emtModeToDb(mode?: string | null): number {
  return MODE_TO_DB[normalizeMode(mode)]
}

export function emtModeFromDb(value?: number | null): EmtMode {
  if (!value) return "sans-objet"
  return DB_TO_MODE[value] ?? "sans-objet"
}
