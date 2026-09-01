import { formatDbDateTime, parseDbDateTime } from "@/lib/date-display"

export type MeasureData = {
  id: string
  Valeur: number | null
  Unite: string
  Nb_Decimal?: number | null
  DateHeureMesure: string
  DateHeureMesureIso?: string
  DateHeureMesureXaxis: string
  Consigne: number | null
  Consigne_Sup: number | null
  Consigne_Inf: number | null
  SondeNumeroSerie: string
  Frequence: number
  Est_Valeur_Null?: boolean | number | null
  Est_Valeur_Memoire?: boolean | number | null
  Etat_Alarme: number
}

export type MeasureSummary = {
  consigneSup: number | null
  consigneInf: number | null
  consigne: number | null
  unite: string
  frequence: number
  lastMeasureText: string
  lastValue: number | null
  lastDateTime: string
  decimals: number | null
}

export function normalizeUnitLabel(unit: string | null | undefined): string {
  const normalized = (unit ?? "")
    .trim()
    .replace(/Ã‚Â°/g, "°")
    .replace(/Â°/g, "°")
    .replace(/â°C/g, "°C")
    .replace(/Â°C/g, "°C")

  if (!normalized || normalized.toUpperCase() === "C") return "°C"
  return normalized
}

export function getMeasureTimestamp(
  measure: Pick<MeasureData, "DateHeureMesureIso" | "DateHeureMesure">,
): number {
  const parsed = parseDbDateTime(measure.DateHeureMesureIso ?? measure.DateHeureMesure)
  return parsed ? parsed.getTime() : Number.NaN
}

export function sortMeasuresChronologically<T extends Pick<MeasureData, "DateHeureMesureIso" | "DateHeureMesure">>(
  measures: T[],
): T[] {
  if (measures.length <= 1) return measures
  return [...measures].sort((a, b) => getMeasureTimestamp(a) - getMeasureTimestamp(b))
}

export function formatMeasureValue(
  value: number | null | undefined,
  decimals?: number | null,
  locale = "fr-FR",
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return ""

  if (decimals === null || decimals === undefined || Number.isNaN(decimals)) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const fractionDigits = Math.max(0, Math.min(10, Math.trunc(decimals)))
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

export function normalizeMeasureNumber(
  value: number | null | undefined,
  decimals = 2,
): number | null {
  if (value === null || value === undefined || Number.isNaN(value) || !Number.isFinite(value)) {
    return null
  }

  const fractionDigits = Math.max(0, Math.min(10, Math.trunc(decimals)))
  return Number(value.toFixed(fractionDigits))
}

export function getMeasureSummary(
  measures: MeasureData[],
  fallback?: Partial<Pick<MeasureSummary, "consigneSup" | "consigneInf" | "consigne" | "unite" | "frequence">>,
): MeasureSummary {
  const first = measures[0]
  const last = measures[measures.length - 1]

  const unite = normalizeUnitLabel(last?.Unite || first?.Unite || fallback?.unite || "\u00B0C")
  const frequence = last?.Frequence || first?.Frequence || fallback?.frequence || 15
  const decimals = last?.Nb_Decimal ?? first?.Nb_Decimal ?? null

  const isLastNullMeasurement = Boolean(
    last && (typeof last.Est_Valeur_Null === "number" ? last.Est_Valeur_Null !== 0 : last.Est_Valeur_Null),
  )
  const lastWithValue = isLastNullMeasurement ? null : [...measures].reverse().find((item) => item.Valeur !== null)
  const formattedValue = lastWithValue ? formatMeasureValue(lastWithValue.Valeur, decimals) : ""
  const lastMeasureText = lastWithValue ? `${formattedValue}${normalizeUnitLabel(lastWithValue.Unite || unite)}` : "N/A"
  const lastDateTime = last
    ? formatDbDateTime(last.DateHeureMesureIso ?? last.DateHeureMesure, {
        withSeconds: false,
        fallback: "",
      })
    : ""

  return {
    consigneSup: normalizeMeasureNumber(last?.Consigne_Sup ?? first?.Consigne_Sup ?? fallback?.consigneSup ?? null),
    consigneInf: normalizeMeasureNumber(last?.Consigne_Inf ?? first?.Consigne_Inf ?? fallback?.consigneInf ?? null),
    consigne: normalizeMeasureNumber(last?.Consigne ?? first?.Consigne ?? fallback?.consigne ?? null),
    unite,
    frequence,
    lastMeasureText,
    lastValue: lastWithValue?.Valeur ?? null,
    lastDateTime,
    decimals,
  }
}

export function calculateYDomain(
  measures: MeasureData[],
  {
    consigneSup,
    consigneInf,
    consigne,
  }: {
    consigneSup: number | null
    consigneInf: number | null
    consigne: number | null
  },
): [number, number] {
  if (measures.length === 0) return [0, 30]

  const values = measures.map((d) => d.Valeur).filter((v): v is number => typeof v === "number")
  const thresholdValues = measures.flatMap((measure) =>
    [measure.Consigne_Inf, measure.Consigne, measure.Consigne_Sup].filter(
      (value): value is number => typeof value === "number",
    ),
  )
  if (values.length === 0) {
    const minFallback = Math.min(...thresholdValues, consigneInf ?? consigne ?? 0)
    const maxFallback = Math.max(...thresholdValues, consigneSup ?? consigne ?? 30)
    return [Math.floor(minFallback - 1), Math.ceil(maxFallback + 1)]
  }
  const min = Math.min(...values, ...thresholdValues, consigneInf ?? 0, consigne ?? 0)
  const max = Math.max(...values, ...thresholdValues, consigneSup ?? 30, consigne ?? 30)
  const padding = (max - min) * 0.1

  return [Math.floor(min - padding), Math.ceil(max + padding)]
}

export function calculateYDomainFromMeasures(measures: MeasureData[]): [number, number] {
  if (measures.length === 0) return [0, 30]

  const values = measures.map((d) => d.Valeur).filter((v): v is number => typeof v === "number")
  if (values.length === 0) return [0, 30]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const padding = (max - min) * 0.1

  return [Math.floor(min - padding), Math.ceil(max + padding)]
}


export function getTimeAxisSpanMs(
  measures: Array<Pick<MeasureData, "DateHeureMesureIso" | "DateHeureMesure">>,
): number {
  if (measures.length <= 1) return 0
  const first = getMeasureTimestamp(measures[0])
  const last = getMeasureTimestamp(measures[measures.length - 1])
  if (!Number.isFinite(first) || !Number.isFinite(last)) return 0
  return Math.max(0, last - first)
}

export function formatTimeAxisLabel(
  value: string | Date,
  locale = "fr-FR",
  spanMs = 0,
): string | string[] {
  const date = parseDbDateTime(value)
  if (!date) {
    return typeof value === "string" ? value : ""
  }

  if (spanMs >= 24 * 60 * 60 * 1000) {
    return [
      formatDbDateTime(date, { dateOnly: true, withYear: false, locale }),
      formatDbDateTime(date, { timeOnly: true, withSeconds: false, locale }),
    ]
  }

  return formatDbDateTime(date, { timeOnly: true, withSeconds: false, locale })
}
