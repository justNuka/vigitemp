import type { SensorWithLocation } from "@/lib/api"

export type GroupSection = {
  groupKey: string
  groupId: number | null
  groupName: string
  sensors: SensorWithLocation[]
  criticalCount: number
  warningCount: number
  alarmCount: number
}

export type SiteSection = {
  siteId: string
  siteName: string
  sensorsCount: number
  criticalCount: number
  warningCount: number
  alarmCount: number
  groups: GroupSection[]
}

function countCritical(sensors: SensorWithLocation[]) {
  return sensors.filter((s) => s.isActive && s.status === "critical").length
}

function countWarning(sensors: SensorWithLocation[]) {
  return sensors.filter((s) => s.isActive && s.status === "warning").length
}

function countAlarms(sensors: SensorWithLocation[]) {
  return countCritical(sensors) + countWarning(sensors)
}

export function groupSensorsBySiteAndGroup(sensors: SensorWithLocation[]): SiteSection[] {
  const bySite = new Map<
    string,
    { siteName: string; groups: Map<string, { groupId: number | null; groupName: string; sensors: SensorWithLocation[] }> }
  >()

  for (const sensor of sensors) {
    const siteId = String(sensor.location.siteId || "no-site")
    const siteName = sensor.location.site || `Site ${siteId}`
    const groupEntries: Array<{ id: number | null; name: string }> = []

    if (sensor.location.groupIds && sensor.location.groupIds.length > 0) {
      sensor.location.groupIds.forEach((id, index) => {
        if (typeof id !== "number" || Number.isNaN(id)) return
        const name = sensor.location.groupNames?.[index] ?? `Groupe ${id}`
        groupEntries.push({ id, name })
      })
    }

    if (groupEntries.length === 0) {
      const fallback = [
        { id: sensor.location.groupId1 ?? null, name: sensor.location.groupName1 ?? null },
        { id: sensor.location.groupId2 ?? null, name: sensor.location.groupName2 ?? null },
      ]
      fallback.forEach((entry) => {
        if (typeof entry.id === "number" && !Number.isNaN(entry.id)) {
          groupEntries.push({ id: entry.id, name: entry.name || `Groupe ${entry.id}` })
        }
      })
    }

    if (groupEntries.length === 0) {
      groupEntries.push({ id: null, name: "Sans groupe" })
    }

    let siteEntry = bySite.get(siteId)
    if (!siteEntry) {
      siteEntry = { siteName, groups: new Map() }
      bySite.set(siteId, siteEntry)
    }

    const deduped = new Map<string, { id: number | null; name: string }>()
    for (const entry of groupEntries) {
      deduped.set(`${entry.id ?? "none"}:${entry.name}`, entry)
    }

    for (const entry of deduped.values()) {
      const groupKey = `${entry.id ?? "none"}:${entry.name}`
      const group = siteEntry.groups.get(groupKey) ?? {
        groupId: entry.id,
        groupName: entry.name,
        sensors: [],
      }
      group.sensors.push(sensor)
      siteEntry.groups.set(groupKey, group)
    }
  }

  const siteSections: SiteSection[] = Array.from(bySite.entries()).map(([siteId, site]) => {
    const groupSections: GroupSection[] = Array.from(site.groups.entries()).map(([groupKey, group]) => {
      const criticalCount = countCritical(group.sensors)
      const warningCount = countWarning(group.sensors)
      return {
        groupKey: `${siteId}-${groupKey}`,
        groupId: group.groupId,
        groupName: group.groupName,
        sensors: group.sensors,
        criticalCount,
        warningCount,
        alarmCount: criticalCount + warningCount,
      }
    })

    groupSections.sort((a, b) => {
      if (a.criticalCount !== b.criticalCount) return b.criticalCount - a.criticalCount
      if (a.warningCount !== b.warningCount) return b.warningCount - a.warningCount
      return a.groupName.localeCompare(b.groupName, "fr", { sensitivity: "base" })
    })

    const allSensorsMap = new Map<string, SensorWithLocation>()
    for (const sensor of groupSections.flatMap((g) => g.sensors)) {
      allSensorsMap.set(sensor.id, sensor)
    }
    const allSensors = Array.from(allSensorsMap.values())

    const criticalCount = countCritical(allSensors)
    const warningCount = countWarning(allSensors)

    return {
      siteId,
      siteName: site.siteName,
      sensorsCount: allSensors.length,
      criticalCount,
      warningCount,
      alarmCount: criticalCount + warningCount,
      groups: groupSections,
    }
  })

  siteSections.sort((a, b) => {
    if (a.criticalCount !== b.criticalCount) return b.criticalCount - a.criticalCount
    if (a.warningCount !== b.warningCount) return b.warningCount - a.warningCount
    return a.siteName.localeCompare(b.siteName, "fr", { sensitivity: "base" })
  })

  return siteSections
}
