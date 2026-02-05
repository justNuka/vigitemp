export type MeasureData = {
  id: string
  Valeur: number
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

export function formatMeasureValue(
  value: number | null | undefined,
  decimals?: number | null,
  locale = "fr-FR",
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return ""

  if (decimals === null || decimals === undefined || Number.isNaN(decimals)) {
    return value.toString()
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

  const formattedValue = last ? formatMeasureValue(last.Valeur, decimals) : ""
  const lastMeasureText = last ? `${formattedValue}${last.Unite || unite}` : ""
  const lastDateTime = last?.DateHeureMesure || ""

  return {
    consigneSup: last?.Consigne_Sup ?? first?.Consigne_Sup ?? fallback?.consigneSup ?? null,
    consigneInf: last?.Consigne_Inf ?? first?.Consigne_Inf ?? fallback?.consigneInf ?? null,
    consigne: last?.Consigne ?? first?.Consigne ?? fallback?.consigne ?? null,
    unite,
    frequence,
    lastMeasureText,
    lastValue: last?.Valeur ?? null,
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

  const values = measures.map((d) => d.Valeur)
  const min = Math.min(...values, consigneInf ?? 0, consigne ?? 0)
  const max = Math.max(...values, consigneSup ?? 30, consigne ?? 30)
  const padding = (max - min) * 0.1

  return [Math.floor(min - padding), Math.ceil(max + padding)]
}

export function calculateYDomainFromMeasures(measures: MeasureData[]): [number, number] {
  if (measures.length === 0) return [0, 30]

  const values = measures.map((d) => d.Valeur)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const padding = (max - min) * 0.1

  return [Math.floor(min - padding), Math.ceil(max + padding)]
}


