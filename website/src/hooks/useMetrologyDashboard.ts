import { useQuery } from "@tanstack/react-query"

import { getJson, isUnauthorizedError } from "@/lib/http"

export type MetrologyDashboardRow = {
  id: number
  nomLieu: string
  sondeAssociee: string
  conformity: "na" | "ok" | "alert"
  toleranceInf: number | null
  consigne: number | null
  toleranceSup: number | null
  dateEtalonnage: string | null
  erreurJustesse: number | null
  incertitudeEtalonnage: number | null
  correctionErreurJustesseActive: boolean
  correctionDeriveActive: boolean
  derive: number | null
  incertitudeMesure: number | null
  dateProchainEtalonnage: string | null
}

async function fetchMetrologyDashboard() {
  return getJson<MetrologyDashboardRow[]>("/api/metrologie/dashboard")
}

export function useMetrologyDashboard() {
  return useQuery({
    queryKey: ["metrology-dashboard"],
    queryFn: fetchMetrologyDashboard,
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 60000),
  })
}
