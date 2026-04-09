import { Building2, ChevronDown, Users } from "lucide-react"
import { LazyMotion, domAnimation, m } from "motion/react"

import MonitoringCard from "@/components/monitoring-card"
import { countStatus } from "@/lib/surveillance-status"
import type { SensorWithLocation } from "@/lib/api"

import { type SiteSection } from "../_helpers/group-sensors"
import { staggerContainer } from "@/lib/motion-variants"
import { sortSensors, type SurveillanceSortMode } from "../_helpers/monitoring-derived"
import { formatAlarmes, formatGroupes, formatPreAlarmes, formatSondes } from "../_helpers/monitoring-labels"
import { SurveillanceTreeStatsBadges } from "./monitoring-tree-stats-badges"
import { buildMonitoringCardProps } from "./monitoring-card-props"

type Translate = (key: string, values?: Record<string, string>) => string

type MonitoringSiteSectionProps = {
  site: SiteSection
  siteKey: string
  disabledView?: boolean
  expandedSites: Set<string>
  expandedGroups: Set<string>
  toggleSite: (key: string) => void
  toggleGroup: (key: string) => void
  locale: string
  timezone?: string
  t: Translate
  onSurveillanceToggle?: (
    idLieu: number,
    action: "surveillance" | "alarms",
    newState: boolean,
    durationMinutes?: number | null,
  ) => void
  onEditLocation?: (idLieu: number) => void
  showNullNonResponse: boolean
  sortMode: SurveillanceSortMode
}

function formatDisabledLabel(
  disabledUntil: Date | string | null,
  locale: string,
  timezone: string | undefined,
  t: Translate,
) {
  if (!disabledUntil) return t("grid.disabled_badge")
  const date = new Date(disabledUntil)
  if (Number.isNaN(date.getTime())) return t("grid.disabled_badge")
  const formatted = new Intl.DateTimeFormat(locale, {
    ...(timezone ? { timeZone: timezone } : {}),
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
  return t("grid.disabled_until", { date: formatted })
}

function getLatestDisabledUntil(sensors: SensorWithLocation[]) {
  return sensors
    .map((sensor) => sensor.location.alarmDisabledUntil)
    .filter((value) => value !== null && value !== undefined)
    .map((value) => new Date(value as string | number | Date))
    .filter((date) => !Number.isNaN(date.getTime()))
    .reduce<Date | null>((latest, current) => {
      if (!latest) return current
      return current > latest ? current : latest
    }, null)
}

export function MonitoringSiteSection({
  site,
  siteKey,
  disabledView = false,
  expandedSites,
  expandedGroups,
  toggleSite,
  toggleGroup,
  locale,
  timezone,
  t,
  onSurveillanceToggle,
  onEditLocation,
  showNullNonResponse,
  sortMode,
}: MonitoringSiteSectionProps) {
  const isSiteExpanded = expandedSites.has(siteKey)
  const handleSurveillanceToggle =
    onSurveillanceToggle ??
    ((_: number, __: "surveillance" | "alarms", ___: boolean, ____?: number | null) => {})
  const siteSensors = site.groups.flatMap((group) => group.sensors)
  const siteStats = countStatus(siteSensors)

  return (
    <LazyMotion features={domAnimation}>
    <div className={disabledView ? "space-y-4" : "space-y-6"}>
      <button
        onClick={() => toggleSite(siteKey)}
        className="w-full flex items-center gap-3 border-b border-gray-200 dark:border-slate-700 pb-3 hover:bg-gray-50 dark:hover:bg-slate-900/50 px-2 py-1 rounded transition-colors"
      >
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isSiteExpanded ? "rotate-0" : "-rotate-90"
          }`}
        />
        <Building2 className={`w-5 h-5 ${disabledView ? "text-slate-500" : "text-blue-600 dark:text-blue-400"}`} />
        <h2 className={disabledView ? "text-xl font-semibold" : "text-xl font-bold"}>{site.siteName}</h2>
        <span
          className={disabledView
            ? "ml-auto text-xs text-gray-500"
            : "ml-auto flex items-center gap-3 text-base font-semibold text-gray-600 dark:text-slate-300"}
        >
          <span>
            {formatSondes(site.sensorsCount)} - {formatGroupes(site.groups.length)}
            {!disabledView && siteStats.critical > 0 ? ` - ${formatAlarmes(siteStats.critical)}` : ""}
            {!disabledView && siteStats.warning > 0 ? ` - ${formatPreAlarmes(siteStats.warning)}` : ""}
          </span>
          {!disabledView ? <SurveillanceTreeStatsBadges stats={siteStats} compact /> : null}
        </span>
      </button>

      {isSiteExpanded ? (
        <div className="space-y-3">
          {site.groups.map((group) => {
            const groupStats = countStatus(group.sensors)
            const sortedGroupSensors = sortSensors(group.sensors, sortMode)
            const isGroupExpanded = disabledView ? true : expandedGroups.has(group.groupKey)
            const groupDisabled =
              group.groupId !== null &&
              group.sensors.length > 0 &&
              group.sensors.every((sensor) => sensor.location.surveillanceDisabled)
            const groupDisabledUntil = groupDisabled ? getLatestDisabledUntil(group.sensors) : null

            return (
              <div key={`${siteKey}-${group.groupKey}`} className="space-y-3">
                {disabledView ? (
                  <div className="flex items-center gap-2 px-2 py-1 text-base font-semibold text-gray-600 dark:text-slate-300">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{group.groupName}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => toggleGroup(group.groupKey)}
                    className="w-full flex items-center gap-2 px-2 py-1 hover:bg-gray-50 dark:hover:bg-slate-900/50 rounded transition-colors"
                  >
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isGroupExpanded ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                    <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <h3 className="text-xl font-semibold">{group.groupName}</h3>
                    <span className="ml-auto flex items-center gap-3 text-xs text-gray-500">
                      <span>
                        {formatSondes(group.sensors.length)}
                        {groupStats.critical > 0 ? ` - ${formatAlarmes(groupStats.critical)}` : ""}
                        {groupStats.warning > 0 ? ` - ${formatPreAlarmes(groupStats.warning)}` : ""}
                      </span>
                      <SurveillanceTreeStatsBadges stats={groupStats} compact />
                    </span>
                    {groupDisabled ? (
                      <span
                        className="ml-2 inline-flex items-center rounded-full bg-orange-500/20 text-orange-900 dark:text-orange-100 text-[10px] px-2 py-0.5"
                        title={formatDisabledLabel(groupDisabledUntil, locale, timezone, t)}
                      >
                        {t("grid.disabled_badge")}
                      </span>
                    ) : null}
                  </button>
                )}

                {isGroupExpanded ? (
                  <m.div
                    className={`grid gap-4 justify-start ${
                      disabledView
                        ? "grid-cols-[repeat(auto-fill,minmax(250px,1fr))]"
                        : "grid-cols-[repeat(auto-fill,minmax(260px,1fr))]"
                    }`}
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {sortedGroupSensors.map((sensor) => (
                      <MonitoringCard
                        key={sensor.id}
                        {...buildMonitoringCardProps(
                          sensor,
                          site.siteName ?? "",
                          group.groupName ?? "",
                          handleSurveillanceToggle,
                          onEditLocation,
                          showNullNonResponse,
                        )}
                      />
                    ))}
                  </m.div>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
    </LazyMotion>
  )
}
