import type { SensorWithLocation } from "@/lib/api"

export type GroupSection = {
  groupKey: string
  groupName: string
  sensors: SensorWithLocation[]
  alarmCount: number
}

export type SiteSection = {
  siteId: string
  siteName: string
  sensorsCount: number
  alarmCount: number
  groups: GroupSection[]
}

function countAlarms(sensors: SensorWithLocation[]) {
  return sensors.filter((s) => s.status !== "ok").length
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

  return Array.from(bySite.entries()).map(([siteId, site]) => {
    const groupSections: GroupSection[] = Array.from(site.groups.entries()).map(([groupName, groupSensors]) => ({
      groupKey: `${siteId}-${groupName}`,
      groupName,
      sensors: groupSensors,
      alarmCount: countAlarms(groupSensors),
    }))

    const allSensors = groupSections.flatMap((g) => g.sensors)

    return {
      siteId,
      siteName: site.siteName,
      sensorsCount: allSensors.length,
      alarmCount: countAlarms(allSensors),
      groups: groupSections,
    }
  })
}

