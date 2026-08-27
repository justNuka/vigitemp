import { useQuery } from "@tanstack/react-query"

import { getJson, isUnauthorizedError } from "@/lib/http"

export type AdjustmentSensorRow = {
  id: number
  serialNumber: string
  locationId: number | null
  locationName: string | null
  unit: string | null
  moduleId: number | null
  moduleName: string | null
  modulePort: string | null
  currentCalibrationValue: number
  isGso: boolean
  coeffA: number
  coeffB: number
  coeffC: number
}

async function fetchAdjustmentSensors() {
  return getJson<AdjustmentSensorRow[]>("/api/metrologie/ajustage/sondes")
}

export function useAdjustmentSensors() {
  return useQuery({
    queryKey: ["metrology-adjustment-sensors"],
    queryFn: fetchAdjustmentSensors,
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 60000),
  })
}
