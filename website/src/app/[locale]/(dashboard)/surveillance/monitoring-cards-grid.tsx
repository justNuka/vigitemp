"use client"

import { ChevronDown, ChevronRight, Power, PowerOff } from "lucide-react"
import type { ReactNode } from "react"
import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"

import { MonitoringCardSkeleton } from "@/components/monitoring-card-skeleton"
import type { SensorWithLocation, SurveillanceTreeSiteCounter } from "@/lib/api"

import { SurveillanceEmptyState } from "./_components/monitoring-empty-state"
import { MonitoringSiteSection } from "./_components/monitoring-site-section"
import { type SiteSection } from "./_helpers/group-sensors"
import { groupSensorsBySiteAndGroup } from "./_helpers/group-sensors"
import { type SurveillanceSortMode } from "./_helpers/monitoring-derived"
import { usePersistentStringSet } from "./_hooks/use-persistent-string-set"

interface MonitoringCardsGridProps {
  activeSensors: SensorWithLocation[]
  disabledSensors: SensorWithLocation[]
  activeTotalCount?: number
  disabledTotalCount?: number
  emptyDescription?: string
  activeTreeCounters?: SurveillanceTreeSiteCounter[]
  disabledTreeCounters?: SurveillanceTreeSiteCounter[]
  disabledFirst?: boolean
  isLoading?: boolean
  activeFooter?: ReactNode
  disabledFooter?: ReactNode
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
  showNullNonResponse?: boolean
  sortMode?: SurveillanceSortMode
}

function MonitoringCardsGridSkeleton({ keyPrefix }: { keyPrefix: string }) {
  return (
    <div className="space-y-2">
      <div className="h-px w-full bg-slate-200 dark:bg-slate-700" />
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
        {Array.from({ length: 4 }).map((_, i) => (
          <MonitoringCardSkeleton key={`${keyPrefix}-${i}`} />
        ))}
      </div>
    </div>
  )
}

function MonitoringSectionHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xl font-semibold text-slate-700 dark:text-slate-50">
        {icon}
        {title}
      </div>
      <div className="h-px w-full bg-slate-200 dark:bg-slate-700" />
    </div>
  )
}

export function MonitoringCardsGrid({
  activeSensors,
  disabledSensors,
  activeTotalCount,
  disabledTotalCount,
  emptyDescription,
  activeTreeCounters = [],
  disabledTreeCounters = [],
  disabledFirst = false,
  isLoading = false,
  activeFooter,
  disabledFooter,
  onSurveillanceToggle,
  onGroupSurveillanceToggle,
  requireActionComment = false,
  onEditLocation,
  onDetailsModalStateChange,
  backgroundPaused = false,
  showNullNonResponse = false,
  sortMode = "status",
}: MonitoringCardsGridProps) {
  const t = useTranslations("surveillance")
  const [disabledExpanded, setDisabledExpanded] = useState(false)
  const locale = useLocale()
  const { value: expandedSites, toggle: toggleSite } = usePersistentStringSet("surveillance-expanded-sites")
  const { value: expandedGroups, toggle: toggleGroup } = usePersistentStringSet("surveillance-expanded-groups")

  const handleSurveillanceToggle =
    onSurveillanceToggle ??
    ((_: number, __: "surveillance" | "alarms", ___: boolean, ____?: number | null, _____?: string | null) => {
      // no-op
    })

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-8">
        <div className="space-y-6">
          <MonitoringSectionHeader title={t("grid.active_title")} icon={<Power className="h-5 w-5 text-sky-500" />} />
          <MonitoringCardsGridSkeleton keyPrefix="active" />
        </div>
        <div className="space-y-4">
          <MonitoringSectionHeader title={t("grid.disabled_title")} icon={<PowerOff className="h-5 w-5 text-slate-400" />} />
          <MonitoringCardsGridSkeleton keyPrefix="disabled" />
        </div>
      </div>
    )
  }

  if (activeSensors.length === 0 && disabledSensors.length === 0) {
    return <SurveillanceEmptyState title={t("grid.empty_title")} description={emptyDescription} />
  }

  const groupingLabels = {
    noGroup: t("grid.no_group"),
    noSite: t("grid.no_site"),
  }

  const groupedActive = groupSensorsBySiteAndGroup(activeSensors, groupingLabels, sortMode, activeTreeCounters)
  const groupedDisabled = groupSensorsBySiteAndGroup(disabledSensors, groupingLabels, sortMode, disabledTreeCounters)

  const countLocations = (items: SensorWithLocation[], fallback?: number) =>
    fallback ?? new Set(items.map((sensor) => Number(sensor.location.id ?? sensor.id)).filter((id) => Number.isFinite(id))).size

  const sections: Array<{
    key: string
    title: string
    icon: React.ReactNode
    sites: SiteSection[]
    disabledView: boolean
    emptyMessage: string | null
    className: string
    footer?: ReactNode
  }> = [
    {
      key: "active",
      title: `${t("grid.active_title")} (${countLocations(activeSensors, activeTotalCount)})`,
      icon: <Power className="h-5 w-5 text-sky-500" />,
      sites: groupedActive,
      disabledView: false,
      emptyMessage: null,
      className: "space-y-6",
      footer: activeFooter,
    },
    {
      key: "disabled",
      title: `${t("grid.disabled_title")} (${countLocations(disabledSensors, disabledTotalCount)})`,
      icon: <PowerOff className="h-5 w-5 text-slate-400" />,
      sites: groupedDisabled,
      disabledView: true,
      emptyMessage: t("grid.disabled_empty"),
      className: "space-y-4",
      footer: disabledFooter,
    },
  ]

  return (
    <div className="p-4 md:p-6 flex flex-col gap-8 animate-fade-in">
      {sections.map((section, index) => {
        const order = index === 0 ? (disabledFirst ? 2 : 1) : disabledFirst ? 1 : 2

        return (
          <div key={section.key} className={section.className} style={{ order }}>
            {section.disabledView ? (
              <button
                type="button"
                onClick={() => setDisabledExpanded((current) => !current)}
                className="w-full space-y-2 text-left"
                aria-expanded={disabledExpanded}
              >
                <div className="flex items-center gap-2 text-xl font-semibold text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-50 dark:hover:text-white">
                  {disabledExpanded ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronRight className="h-5 w-5 text-slate-400" />}
                  {section.icon}
                  {section.title}
                </div>
                <div className="h-px w-full bg-slate-200 dark:bg-slate-700" />
              </button>
            ) : (
              <MonitoringSectionHeader title={section.title} icon={section.icon} />
            )}

            {!section.disabledView || disabledExpanded ? section.sites.length > 0 ? (
              <div className="space-y-6">
                {section.sites.map((site) => (
                  <MonitoringSiteSection
                    key={`${section.key}-${site.siteId}`}
                    site={site}
                    siteKey={section.disabledView ? `disabled-${site.siteId}` : site.siteId}
                    disabledView={section.disabledView}
                    expandedSites={expandedSites}
                    expandedGroups={expandedGroups}
                    toggleSite={toggleSite}
                    toggleGroup={toggleGroup}
                    locale={locale}
                    t={t}
                    onSurveillanceToggle={handleSurveillanceToggle}
                    onGroupSurveillanceToggle={onGroupSurveillanceToggle}
                    requireActionComment={requireActionComment}
                    onEditLocation={onEditLocation}
                    onDetailsModalStateChange={onDetailsModalStateChange}
                    backgroundPaused={backgroundPaused}
                    showNullNonResponse={showNullNonResponse}
                    sortMode={sortMode}
                  />
                ))}
              </div>
            ) : section.emptyMessage ? (
              <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-slate-500">
                {section.emptyMessage}
              </div>
            ) : null : null}

            {(!section.disabledView || disabledExpanded) && section.footer ? <div>{section.footer}</div> : null}
          </div>
        )
      })}
    </div>
  )
}
