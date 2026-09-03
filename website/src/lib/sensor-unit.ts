import { normalizeUnitLabel } from "@/lib/measurements"

type SensorUnitSources = {
  adjustmentUnit?: string | null
  sensorTypeUnit?: string | null
  calibrationUnit?: string | null
  locationUnit?: string | null
  measurementUnit?: string | null
}

export function resolveSensorDisplayUnit(sources: SensorUnitSources): string {
  return normalizeUnitLabel(
    sources.adjustmentUnit?.trim() ||
      sources.sensorTypeUnit?.trim() ||
      sources.calibrationUnit?.trim() ||
      sources.locationUnit?.trim() ||
      sources.measurementUnit?.trim() ||
      "°C",
  )
}
