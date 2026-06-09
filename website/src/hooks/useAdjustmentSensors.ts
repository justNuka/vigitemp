import { useQuery } from "@tanstack/react-query"

import { getJson, isUnauthorizedError } from "@/lib/http"

export type AdjustmentSensorRow = {
  id: number
  serialNumber: string
  locationId: number | null
  locationName: string | null
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
