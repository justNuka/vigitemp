import { buildMetrologyLookupSerials } from "@/lib/sensor-naming"

export type ToolsSensorTestCatalogEntry = {
  id: number
  serialNumber: string
  address: string | null
  sensorType: string | null
  family: string
  location: string | null
  module: string | null
  modulePort: string | null
  surveillanceState: string | null
  frequencyMeasure: number | null
  frequencyRecovery: number | null
}

export type ToolsSensorTestMeasurementRow = {
  serialNumber: string | null
  address: string | null
  value: number | null
  rawValue: number | null
  unit: string | null
  rssi: string | null
  isNull: number
  measuredAt: string
}

export type ToolsSensorTestResult = {
  sensorId: number
  totalAttempts: number
  receivedAttempts: number
  responseRate: number | null
  lastValue: number | null
  lastRawValue: number | null
  unit: string | null
  rssi: string | null
  lastAttemptAt: string | null
  lastResponseAt: string | null
}

function normalizeLookupValue(value: string | null | undefined) {
  const normalized = value?.trim().toUpperCase()
  return normalized || null
}

function addCandidate(map: Map<string, Set<number>>, value: string | null | undefined, sensorId: number) {
  const normalized = normalizeLookupValue(value)
  if (!normalized) return
  const current = map.get(normalized) ?? new Set<number>()
  current.add(sensorId)
  map.set(normalized, current)
}

function getUniqueCandidate(map: Map<string, Set<number>>, value: string | null | undefined) {
  const normalized = normalizeLookupValue(value)
  if (!normalized) return null
  const candidates = map.get(normalized)
  if (!candidates || candidates.size !== 1) return null
  return candidates.values().next().value as number
}

export function buildToolsSensorTestLookupValues(sensors: ToolsSensorTestCatalogEntry[]) {
  const values = new Set<string>()
  for (const sensor of sensors) {
    const variants = [sensor.serialNumber, sensor.address, ...buildMetrologyLookupSerials(sensor.serialNumber)]
    for (const value of variants) {
      const normalized = normalizeLookupValue(value)
      if (normalized) values.add(normalized)
    }
  }
  return Array.from(values)
}

export function aggregateToolsSensorTestMeasurements(
  sensors: ToolsSensorTestCatalogEntry[],
  rows: ToolsSensorTestMeasurementRow[],
): ToolsSensorTestResult[] {
  const exactSerials = new Map<string, Set<number>>()
  const exactAddresses = new Map<string, Set<number>>()
  const variants = new Map<string, Set<number>>()

  for (const sensor of sensors) {
    addCandidate(exactSerials, sensor.serialNumber, sensor.id)
    addCandidate(exactAddresses, sensor.address, sensor.id)
    for (const value of buildMetrologyLookupSerials(sensor.serialNumber)) {
      addCandidate(variants, value, sensor.id)
    }
  }

  const results = new Map<number, ToolsSensorTestResult>()
  for (const sensor of sensors) {
    results.set(sensor.id, {
      sensorId: sensor.id,
      totalAttempts: 0,
      receivedAttempts: 0,
      responseRate: null,
      lastValue: null,
      lastRawValue: null,
      unit: null,
      rssi: null,
      lastAttemptAt: null,
      lastResponseAt: null,
    })
  }

  for (const row of rows) {
    const sensorId =
      getUniqueCandidate(exactSerials, row.serialNumber) ??
      getUniqueCandidate(exactAddresses, row.address) ??
      getUniqueCandidate(variants, row.serialNumber) ??
      getUniqueCandidate(variants, row.address)
    if (sensorId == null) continue

    const result = results.get(sensorId)
    if (!result) continue

    result.totalAttempts += 1
    const received = row.isNull !== 1 && (row.value != null || row.rawValue != null)
    if (received) result.receivedAttempts += 1

    if (!result.lastAttemptAt || row.measuredAt > result.lastAttemptAt) {
      result.lastAttemptAt = row.measuredAt
    }

    if (received && (!result.lastResponseAt || row.measuredAt > result.lastResponseAt)) {
      result.lastResponseAt = row.measuredAt
      result.lastValue = row.value
      result.lastRawValue = row.rawValue
      result.unit = row.unit
      result.rssi = row.rssi
    }
  }

  return Array.from(results.values()).map((result) => ({
    ...result,
    responseRate:
      result.totalAttempts > 0
        ? Math.round((result.receivedAttempts / result.totalAttempts) * 1000) / 10
        : null,
  }))
}
