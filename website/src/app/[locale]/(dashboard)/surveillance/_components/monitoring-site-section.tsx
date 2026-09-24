import { Building2, ChevronDown, Info, Power, PowerOff, Users } from "lucide-react"
import { LazyMotion, domAnimation, m } from "motion/react"

import MonitoringCard from "@/components/monitoring-card"
import { countStatus } from "@/lib/surveillance-status"
import type { SensorWithLocation } from "@/lib/api"

import { type SiteSection } from "../_helpers/group-sensors"
import { staggerContainer } from "@/lib/motion-variants"
import { sortSensors, type SurveillanceSortMode } from "../_helpers/monitoring-derived"
import { formatAlarmes, formatAlarmesTerminees, formatGroupes, formatPreAlarmes, formatSondes } from "../_helpers/monitoring-labels"
import { SurveillanceTreeStatsBadges } from "./monitoring-tree-stats-badges"
import { buildMonitoringCardProps } from "./monitoring-card-props"
import { formatStoredDbDateTime, parseStoredDbDateTime } from "@/lib/date-display"
import type { StatusCounts } from "@/lib/surveillance-status"
import type { SurveillanceTreeCounterStats } from "@/lib/api"

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
  t: Translate
  onSurveillanceToggle?: (
    idLieu: number,
    action: "surveillance" | "alarms",
    newState: boolean,
    durationMinutes?: number | null,
    actionComment?: string | null,
  ) => void
  onGroupSurveillanceToggle?: (
    groupId: number,
    newState: boolean,
    durationMinutes?: number | null,
  ) => void
  requireActionComment?: boolean
  onEditLocation?: (idLieu: number) => void
  onDetailsModalStateChange?: (idLieu: number, open: boolean) => void
  backgroundPaused?: boolean
  showNullNonResponse: boolean
  sortMode: SurveillanceSortMode
}

function formatDisabledSinceLabel(
  disabledUntil: Date | string | null,
  locale: string,
  t: Translate,
) {
  if (!disabledUntil) return t("grid.disabled_badge")
  const formatted = formatStoredDbDateTime(disabledUntil, {
    format: "dateTime",
    locale,
    fallback: "",
  })
  if (!formatted) return t("grid.disabled_badge")
  return t("grid.disabled_since", { date: formatted })
}

function getLatestDisabledSince(sensors: SensorWithLocation[]) {
  return sensors
    .map((sensor) => sensor.location.surveillanceDisabledSince)
    .filter((value) => value !== null && value !== undefined)
    .map((value) => parseStoredDbDateTime(value as string | number | Date))
    .filter((date): date is Date => date !== null)
    .filter((date) => !Number.isNaN(date.getTime()))
    .reduce<Date | null>((latest, current) => {
      if (!latest) return current
      return current > latest ? current : latest
    }, null)
}

function countLoadedLocations(sensors: SensorWithLocation[]) {
  return new Set(sensors.map((sensor) => String(sensor.location.id || sensor.id))).size
}

function toDisplayStats(stats: SurveillanceTreeCounterStats | StatusCounts): StatusCounts {
  if ("preAlarm" in stats || "ended" in stats || "disabled" in stats) {
    const treeStats = stats as SurveillanceTreeCounterStats
    return {
      total: treeStats.total,
      ok: treeStats.ok,
      warning: treeStats.preAlarm,
      ended: treeStats.ended,
      critical: treeStats.critical,
      inactive: treeStats.disabled,
    }
  }

  return stats
}

function PartialLoadNotice({ message }: { message: string }) {
  return (
    <div className="mx-2 flex items-start gap-2 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-800 shadow-sm dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
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
  t,
  onSurveillanceToggle,
  onGroupSurveillanceToggle,
  requireActionComment = false,
  onEditLocation,
  onDetailsModalStateChange,
  backgroundPaused = false,
  showNullNonResponse,
  sortMode,
}: MonitoringSiteSectionProps) {
  const isSiteExpanded = expandedSites.has(siteKey)
  const handleSurveillanceToggle =
    onSurveillanceToggle ??
    ((_: number, __: "surveillance" | "alarms", ___: boolean, ____?: number | null, _____?: string | null) => {})
  const siteSensors = site.groups.flatMap((group) => group.sensors)
  const siteStats = toDisplayStats(site.globalStats ?? countStatus(siteSensors))
  const siteSensorsCount = site.sensorsCountGlobal ?? site.sensorsCount
  const siteGroupsCount = site.groupsCountGlobal ?? site.groups.length

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
            {formatSondes(siteSensorsCount)} - {formatGroupes(siteGroupsCount)}
            {!disabledView && siteStats.critical > 0 ? ` - ${formatAlarmes(siteStats.critical)}` : ""}
            {!disabledView && siteStats.warning > 0 ? ` - ${formatPreAlarmes(siteStats.warning)}` : ""}
            {!disabledView && siteStats.ended > 0 ? ` - ${formatAlarmesTerminees(siteStats.ended)}` : ""}
          </span>
          {!disabledView ? <SurveillanceTreeStatsBadges stats={siteStats} compact /> : null}
        </span>
      </button>

      {isSiteExpanded ? (
        <div className="space-y-3">
          {site.groups.map((group) => {
            const groupStats = toDisplayStats(group.globalStats ?? countStatus(group.sensors))
            const sortedGroupSensors = sortSensors(group.sensors, sortMode)
            const isGroupExpanded = disabledView ? true : expandedGroups.has(group.groupKey)
            const loadedGroupLocations = countLoadedLocations(group.sensors)
            const totalGroupLocations = group.sensorsCountGlobal ?? loadedGroupLocations
            const isPartiallyLoaded = totalGroupLocations > loadedGroupLocations
            const groupDisabled =
              group.groupId !== null &&
              group.sensors.length > 0 &&
              group.sensors.every((sensor) => sensor.location.surveillanceDisabled)
            const groupDisabledSince = groupDisabled ? getLatestDisabledSince(group.sensors) : null

            return (
              <div key={`${siteKey}-${group.groupKey}`} className="space-y-3">
                {disabledView ? (
                  <div className="flex items-center gap-2 px-2 py-1 text-base font-semibold text-gray-600 dark:text-slate-300">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{group.groupName}</span>
                    {group.groupId !== null && onGroupSurveillanceToggle ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onGroupSurveillanceToggle(group.groupId!, groupDisabled, null)
                        }}
                        className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900/60"
                        title={groupDisabled ? t("group_modal.toggle_enable") : t("group_modal.toggle_disable")}
                        aria-label={groupDisabled ? t("group_modal.toggle_enable") : t("group_modal.toggle_disable")}
                      >
                        {groupDisabled ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-2 py-1">
                    <button
                      onClick={() => toggleGroup(group.groupKey)}
                      className="flex min-w-0 flex-1 items-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-900/50 rounded transition-colors"
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
                        {formatSondes(group.sensorsCountGlobal ?? group.sensors.length)}
                        {groupStats.critical > 0 ? ` - ${formatAlarmes(groupStats.critical)}` : ""}
                        {groupStats.warning > 0 ? ` - ${formatPreAlarmes(groupStats.warning)}` : ""}
                        {groupStats.ended > 0 ? ` - ${formatAlarmesTerminees(groupStats.ended)}` : ""}
                      </span>
                      <SurveillanceTreeStatsBadges stats={groupStats} compact />
                    </span>
                    {groupDisabled ? (
                      <span
                        className="ml-2 inline-flex items-center rounded-full bg-orange-500/20 text-orange-900 dark:text-orange-100 text-[10px] px-2 py-0.5"
                        title={formatDisabledSinceLabel(groupDisabledSince, locale, t)}
                      >
                        {t("grid.disabled_badge")}
                      </span>
                    ) : null}
                    </button>
                    {group.groupId !== null && onGroupSurveillanceToggle ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onGroupSurveillanceToggle(group.groupId!, groupDisabled, null)
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900/60"
                        title={groupDisabled ? t("group_modal.toggle_enable") : t("group_modal.toggle_disable")}
                        aria-label={groupDisabled ? t("group_modal.toggle_enable") : t("group_modal.toggle_disable")}
                      >
                        {groupDisabled ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                      </button>
                    ) : null}
                  </div>
                )}

                {isGroupExpanded ? (
                  <>
                    {isPartiallyLoaded ? (
                      <PartialLoadNotice
                        message={t("grid.partial_group_loaded", {
                          loaded: String(loadedGroupLocations),
                          total: String(totalGroupLocations),
                        })}
                      />
                    ) : null}
                    <m.div
                      className={`grid gap-3 justify-start ${
                        disabledView
                          ? "grid-cols-[repeat(auto-fill,minmax(240px,1fr))]"
                          : "grid-cols-[repeat(auto-fill,minmax(240px,1fr))]"
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
                            requireActionComment,
                            onEditLocation,
                            onDetailsModalStateChange,
                            backgroundPaused,
                            showNullNonResponse,
                          )}
                        />
                      ))}
                    </m.div>
                  </>
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
