import type { SensorWithLocation } from "@/lib/api"

export type FilterState = {
  siteIds: number[]
  groupIds: number[]
}

export type Stats = {
  total: number
  ok: number
  warning: number
  critical: number
  activeAlarms: number
}

export function applySurveillanceFilters(sensors: SensorWithLocation[], filters: FilterState) {
  let result = sensors

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
  const ok = sensors.filter((s) => s.status === "ok" || s.status === "minmax").length
  const warning = sensors.filter((s) => s.status === "warning" || s.status === "ended").length
  const critical = sensors.filter((s) => s.status === "critical" || s.status === "technical").length

  return { total, ok, warning, critical, activeAlarms }
}

export function sortSensorsByStatus(sensors: SensorWithLocation[]) {
  const statusPriority: Record<SensorWithLocation["status"], number> = {
    critical: 0,
    technical: 1,
    warning: 2,
    ended: 3,
    minmax: 4,
    ok: 5,
  }
  return [...sensors].sort((a, b) => statusPriority[a.status] - statusPriority[b.status])
}
