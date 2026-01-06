"use client"

import { Building2, ChevronDown, Users } from "lucide-react"

import MonitoringCard from "@/components/monitoring-card"
import type { SensorWithLocation } from "@/lib/api"
import { countStatus } from "@/lib/surveillance-status"

import { SurveillanceEmptyState } from "./_components/monitoring-empty-state"
import { SurveillanceTreeStatsBadges } from "./_components/monitoring-tree-stats-badges"
import { groupSensorsBySiteAndGroup } from "./_helpers/group-sensors"
import { sortSensorsByStatus } from "./_helpers/monitoring-derived"
import { formatAlarmes, formatGroupes, formatPreAlarmes, formatSondes } from "./_helpers/monitoring-labels"
import { usePersistentStringSet } from "./_hooks/use-persistent-string-set"

interface MonitoringCardsGridProps {
  sensors: SensorWithLocation[]
  onSurveillanceToggle?: (idLieu: number, newState: boolean) => void
}

export function MonitoringCardsGrid({ sensors, onSurveillanceToggle }: MonitoringCardsGridProps) {
  const { value: expandedSites, toggle: toggleSite } = usePersistentStringSet(
    "surveillance-expanded-sites",
  )
  const { value: expandedGroups, toggle: toggleGroup } = usePersistentStringSet(
    "surveillance-expanded-groups",
  )

  if (sensors.length === 0) {
    return <SurveillanceEmptyState title="Aucune sonde" />
  }

  const grouped = groupSensorsBySiteAndGroup(sensors)

  return (
    <div className="p-4 md:p-6 space-y-8 animate-fade-in">
      {grouped.map(({ siteId, siteName, sensorsCount, groups }) => {
        const isSiteExpanded = expandedSites.has(siteId)
        const siteSensors = groups.flatMap((g) => g.sensors)
        const siteStats = countStatus(siteSensors)

        return (
          <div key={siteId} className="space-y-6">
            <button
              onClick={() => toggleSite(siteId)}
              className="w-full flex items-center gap-3 border-b border-gray-200 dark:border-slate-700 pb-3 hover:bg-gray-50 dark:hover:bg-slate-900/50 px-2 py-1 rounded transition-colors"
            >
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                  isSiteExpanded ? "rotate-0" : "-rotate-90"
                }`}
              />
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold">{siteName}</h2>
              <span className="ml-auto flex items-center gap-3 text-sm text-gray-500">
                <span>
                  {formatSondes(sensorsCount)} · {formatGroupes(groups.length)}
                  {siteStats.critical > 0 ? ` · ${formatAlarmes(siteStats.critical)}` : ""}
                  {siteStats.warning > 0 ? ` · ${formatPreAlarmes(siteStats.warning)}` : ""}
                </span>
                <SurveillanceTreeStatsBadges stats={siteStats} compact />
              </span>
            </button>

            {isSiteExpanded && (
              <div className="space-y-4 animate-fade-in">
                {groups.map(({ groupKey, groupName, sensors: groupSensors }) => {
                  const isGroupExpanded = expandedGroups.has(groupKey)
                  const sortedGroupSensors = sortSensorsByStatus(groupSensors)
                  const groupStats = countStatus(groupSensors)

                  return (
                    <div key={groupKey} className="space-y-3">
                      <button
                        onClick={() => toggleGroup(groupKey)}
                        className="w-full flex items-center gap-2 px-2 py-1 hover:bg-gray-50 dark:hover:bg-slate-900/50 rounded transition-colors"
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                            isGroupExpanded ? "rotate-0" : "-rotate-90"
                          }`}
                        />
                        <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <h3 className="text-lg font-semibold">{groupName}</h3>
                        <span className="ml-auto flex items-center gap-3 text-xs text-gray-500">
                          <span>
                            {formatSondes(groupSensors.length)}
                            {groupStats.critical > 0 ? ` · ${formatAlarmes(groupStats.critical)}` : ""}
                            {groupStats.warning > 0 ? ` · ${formatPreAlarmes(groupStats.warning)}` : ""}
                          </span>
                          <SurveillanceTreeStatsBadges stats={groupStats} compact />
                        </span>
                      </button>

                      {isGroupExpanded && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 animate-fade-in">
                          {sortedGroupSensors.map((sensor) => (
                            <MonitoringCard
                              key={sensor.id}
                              idLieu={Number(sensor.id)}
                              nomLieu={sensor.name}
                              lieuType={sensor.lieuType || null}
                              siteName={siteName}
                              groupName={groupName}
                              onSurveillanceToggle={onSurveillanceToggle}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
