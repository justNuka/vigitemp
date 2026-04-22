import { parseDbDateTime } from "@/lib/date-display"

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

export function getMeasureSummary(
  measures: MeasureData[],
  fallback?: Partial<Pick<MeasureSummary, "consigneSup" | "consigneInf" | "consigne" | "unite" | "frequence">>,
): MeasureSummary {
  const first = measures[0]
  const last = measures[measures.length - 1]

  const unite = last?.Unite || first?.Unite || fallback?.unite || "\u00B0C"
  const frequence = last?.Frequence || first?.Frequence || fallback?.frequence || 15
  const decimals = last?.Nb_Decimal ?? first?.Nb_Decimal ?? null

  const lastWithValue = [...measures].reverse().find((item) => item.Valeur !== null)
  const formattedValue = lastWithValue ? formatMeasureValue(lastWithValue.Valeur, decimals) : ""
  const lastMeasureText = lastWithValue ? `${formattedValue}${lastWithValue.Unite || unite}` : ""
  const lastDateTime = last?.DateHeureMesure || ""

  return {
    consigneSup: last?.Consigne_Sup ?? first?.Consigne_Sup ?? fallback?.consigneSup ?? null,
    consigneInf: last?.Consigne_Inf ?? first?.Consigne_Inf ?? fallback?.consigneInf ?? null,
    consigne: last?.Consigne ?? first?.Consigne ?? fallback?.consigne ?? null,
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
      new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "2-digit",
      }).format(date),
      new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date),
    ]
  }

  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}
