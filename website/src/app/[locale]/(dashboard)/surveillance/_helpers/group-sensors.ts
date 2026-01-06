import type { SensorWithLocation } from "@/lib/api"

export type GroupSection = {
  groupKey: string
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
  const bySite = new Map<string, { siteName: string; groups: Map<string, SensorWithLocation[]> }>()

  for (const sensor of sensors) {
    const siteId = String(sensor.location.siteId || "no-site")
    const siteName = sensor.location.site || `Site ${siteId}`
    const groupName = sensor.location.groupName1 || "Sans groupe"

    let siteEntry = bySite.get(siteId)
    if (!siteEntry) {
      siteEntry = { siteName, groups: new Map() }
      bySite.set(siteId, siteEntry)
    }

    const groupSensors = siteEntry.groups.get(groupName) ?? []
    groupSensors.push(sensor)
    siteEntry.groups.set(groupName, groupSensors)
  }

  const siteSections: SiteSection[] = Array.from(bySite.entries()).map(([siteId, site]) => {
    const groupSections: GroupSection[] = Array.from(site.groups.entries()).map(([groupName, groupSensors]) => {
      const criticalCount = countCritical(groupSensors)
      const warningCount = countWarning(groupSensors)
      return {
        groupKey: `${siteId}-${groupName}`,
        groupName,
        sensors: groupSensors,
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

    const allSensors = groupSections.flatMap((g) => g.sensors)

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
