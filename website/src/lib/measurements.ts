export type MeasureData = {
  id: string
  Valeur: number
  Unite: string
  DateHeureMesure: string
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
  lastDateTime: string
}

export function getMeasureSummary(
  measures: MeasureData[],
  fallback?: Partial<Pick<MeasureSummary, "consigneSup" | "consigneInf" | "consigne" | "unite" | "frequence">>,
): MeasureSummary {
  const first = measures[0]
  const last = measures[measures.length - 1]

  const unite = first?.Unite || fallback?.unite || "°C"
  const frequence = first?.Frequence || fallback?.frequence || 15

  const lastMeasureText = last ? `${last.Valeur}${last.Unite || unite}` : ""
  const lastDateTime = last?.DateHeureMesure || ""

  return {
    consigneSup: first?.Consigne_Sup ?? fallback?.consigneSup ?? null,
    consigneInf: first?.Consigne_Inf ?? fallback?.consigneInf ?? null,
    consigne: first?.Consigne ?? fallback?.consigne ?? null,
    unite,
    frequence,
    lastMeasureText,
    lastDateTime,
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

