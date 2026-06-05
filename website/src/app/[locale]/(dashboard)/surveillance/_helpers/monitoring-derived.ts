import type { SensorWithLocation } from "@/lib/api"

export type SurveillanceSortMode = "status" | "alphabetical"

export type FilterState = {
  siteIds: number[]
  groupIds: number[]
  searchTerm: string
  sortMode: SurveillanceSortMode
}

export type Stats = {
  total: number
  ok: number
  warning: number
  critical: number
  activeAlarms: number
}

function compareByLocationName(a: SensorWithLocation, b: SensorWithLocation) {
  const nameA = (a.location.name || a.name || "").trim()
  const nameB = (b.location.name || b.name || "").trim()
  return nameA.localeCompare(nameB, "fr", { sensitivity: "base", numeric: true })
}

const statusPriority: Record<SensorWithLocation["status"], number> = {
  critical: 0,
  technical: 1,
  warning: 2,
  ended: 3,
  ok: 4,
}

export function dedupeSensorsByLocation(sensors: SensorWithLocation[]) {
  const byLocation = new Map<number | string, SensorWithLocation>()

  for (const sensor of sensors) {
    const numericLocationId = Number(sensor.location.id ?? sensor.id)
    const key = Number.isFinite(numericLocationId) ? numericLocationId : sensor.location.id ?? sensor.id
    const current = byLocation.get(key)

    if (!current) {
      byLocation.set(key, sensor)
      continue
    }

    const currentActive = !current.location.surveillanceDisabled
    const nextActive = !sensor.location.surveillanceDisabled
    if (currentActive !== nextActive) {
      if (nextActive) byLocation.set(key, sensor)
      continue
    }

    if (statusPriority[sensor.status] < statusPriority[current.status]) {
      byLocation.set(key, sensor)
    }
  }

  return Array.from(byLocation.values())
}

export function applySurveillanceFilters(sensors: SensorWithLocation[], filters: FilterState) {
  let result = sensors

  const normalizedSearch = filters.searchTerm.trim().toLocaleLowerCase("fr")
  if (normalizedSearch) {
    result = result.filter((s) => {
      const haystacks = [s.location.name, s.name, s.location.sondeNumeroSerie]
        .filter((value): value is string => typeof value === "string" && value.length > 0)
        .map((value) => value.toLocaleLowerCase("fr"))

      return haystacks.some((value) => value.includes(normalizedSearch))
    })
  }

  if (filters.siteIds.length > 0) {
    result = result.filter((s) => s.location.siteId && filters.siteIds.includes(s.location.siteId))
  }

  if (filters.groupIds.length > 0) {
    result = result.filter((s) => {
      const locationGroupIds =
        s.location.groupIds && s.location.groupIds.length > 0
          ? s.location.groupIds
          : [s.location.groupId1, s.location.groupId2].filter(
              (id): id is number => typeof id === "number" && !Number.isNaN(id),
            )

      return locationGroupIds.some((id) => filters.groupIds.includes(id))
    })
  }

  if (filters.sortMode === "alphabetical") {
    return [...result].sort(compareByLocationName)
  }

  return result
}

export function computeSurveillanceStats({
  sensors,
  total,
  activeAlarms,
}: {
  sensors: SensorWithLocation[]
  total: number
  activeAlarms: number
}): Stats {
  const locationStates = new Map<number, { isActive: boolean; status: SensorWithLocation["status"] }>()

  for (const sensor of sensors) {
    const locationId = Number(sensor.location.id ?? sensor.id)
    if (!Number.isFinite(locationId)) continue

    const nextState = {
      isActive: !sensor.location.surveillanceDisabled,
      status: sensor.status,
    }
    const current = locationStates.get(locationId)

    if (!current) {
      locationStates.set(locationId, nextState)
      continue
    }

    if (current.isActive !== nextState.isActive) {
      if (nextState.isActive) {
        locationStates.set(locationId, nextState)
      }
      continue
    }

    if (statusPriority[nextState.status] < statusPriority[current.status]) {
      locationStates.set(locationId, nextState)
    }
  }

  const locations = Array.from(locationStates.values())
  const activeLocations = locations.filter((location) => location.isActive)
  const ok = activeLocations.filter((location) => location.status === "ok").length
  const warning = activeLocations.filter((location) => location.status === "warning").length
  const critical = activeLocations.filter((location) => location.status === "critical" || location.status === "technical").length

  return { total, ok, warning, critical, activeAlarms }
}

export function sortSensorsByStatus(sensors: SensorWithLocation[]) {
  return [...sensors].sort((a, b) => statusPriority[a.status] - statusPriority[b.status])
}

export function sortSensors(sensors: SensorWithLocation[], sortMode: SurveillanceSortMode) {
  return sortMode === "alphabetical" ? [...sensors].sort(compareByLocationName) : sortSensorsByStatus(sensors)
}

