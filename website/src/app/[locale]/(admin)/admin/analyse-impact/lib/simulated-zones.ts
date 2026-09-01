import type { MeasureData } from "@/lib/measurements"

export interface SimulatedZone {
  start: string
  end: string
}

export function computeSimulatedZones(
  measurements: MeasureData[],
  newSup: number,
  newInf: number,
  actualSup: number | null,
  actualInf: number | null,
): SimulatedZone[] {
  if (measurements.length === 0) return []

  const zones: SimulatedZone[] = []
  let zoneStart: string | null = null

  for (const m of measurements) {
    const value = m.Valeur
    if (value === null) {
      if (zoneStart !== null) {
        zones.push({ start: zoneStart, end: m.DateHeureMesureIso ?? m.DateHeureMesure })
        zoneStart = null
      }
      continue
    }

    const isOutsideNew = value > newSup || value < newInf
    const isInsideActual =
      (actualSup === null || value <= actualSup) &&
      (actualInf === null || value >= actualInf)

    const isSimulatedAlarm = isOutsideNew && isInsideActual

    if (isSimulatedAlarm) {
      if (zoneStart === null) {
        zoneStart = m.DateHeureMesureIso ?? m.DateHeureMesure
      }
    } else {
      if (zoneStart !== null) {
        zones.push({ start: zoneStart, end: m.DateHeureMesureIso ?? m.DateHeureMesure })
        zoneStart = null
      }
    }
  }

  if (zoneStart !== null && measurements.length > 0) {
    const last = measurements[measurements.length - 1]
    zones.push({
      start: zoneStart,
      end: last.DateHeureMesureIso ?? last.DateHeureMesure,
    })
  }

  return zones
}
