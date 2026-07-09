"use client"

import { ChevronDown, ChevronRight, Power, PowerOff } from "lucide-react"
import type { ReactNode } from "react"
import { useState } from "react"
import { useTranslations } from "next-intl"

import MonitoringCard from "@/components/monitoring-card"
import { MonitoringCardSkeleton } from "@/components/monitoring-card-skeleton"
import type { SensorWithLocation } from "@/lib/api"

import { SurveillanceEmptyState } from "./_components/monitoring-empty-state"
import { sortSensors, type SurveillanceSortMode } from "./_helpers/monitoring-derived"

interface SensorsCardsGridProps {
  activeSensors: SensorWithLocation[]
  disabledSensors: SensorWithLocation[]
  activeTotalCount?: number
  disabledTotalCount?: number
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
  requireActionComment?: boolean
  onEditLocation?: (idLieu: number) => void
  onDetailsModalStateChange?: (idLieu: number, open: boolean) => void
  backgroundPaused?: boolean
  showNullNonResponse?: boolean
  sortMode?: SurveillanceSortMode
}

/**
 * SensorsCardsGrid - Grille plate de toutes les sondes.
 * Affiche les memes cards que l'arborescence, sans distinction de sites/groupes.
 * Les infos de site et groupe sont affichees dans les cards.
 * Trie les capteurs par statut (alarmes en priorite).
 */
export function SensorsCardsGrid({
  activeSensors,
  disabledSensors,
  activeTotalCount,
  disabledTotalCount,
  disabledFirst = false,
  isLoading = false,
  activeFooter,
  disabledFooter,
  onSurveillanceToggle,
  requireActionComment = false,
  onEditLocation,
  onDetailsModalStateChange,
  backgroundPaused = false,
  showNullNonResponse = false,
  sortMode = "status",
}: SensorsCardsGridProps) {
  const t = useTranslations("surveillance")
  const [disabledExpanded, setDisabledExpanded] = useState(false)
  const handleSurveillanceToggle =
    onSurveillanceToggle ??
    ((_: number, __: "surveillance" | "alarms", ___: boolean, ____: number | null, _____?: string | null) => {
      // no-op
    })

  // Afficher des skeleton cards pendant le chargement
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xl font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
            <Power className="h-5 w-5 text-sky-500" />
            {t("grid.active_title")}
          </div>
          <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))] justify-start">
            {Array.from({ length: 8 }).map((_, i) => (
              <MonitoringCardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (activeSensors.length === 0 && disabledSensors.length === 0) {
    return <SurveillanceEmptyState title={t("grid.empty_title")} />
  }

  const sortedDisabledSensors = sortSensors(disabledSensors, sortMode)
  const sortedActiveSensors = sortSensors(activeSensors, sortMode)
  const countLocations = (items: SensorWithLocation[], fallback?: number) =>
    fallback ?? new Set(items.map((sensor) => Number(sensor.location.id ?? sensor.id)).filter((id) => Number.isFinite(id))).size

  const renderSection = (
    title: string,
    icon: ReactNode,
    items: SensorWithLocation[],
    isDisabledSection = false,
  ) => (
    <div className="space-y-4">
      {isDisabledSection ? (
        <button
          type="button"
          onClick={() => setDisabledExpanded((current) => !current)}
          className="flex w-full items-center gap-2 border-b border-slate-200 pb-2 text-left text-xl font-semibold text-slate-700 transition-colors hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:text-white"
          aria-expanded={disabledExpanded}
        >
          {disabledExpanded ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronRight className="h-5 w-5 text-slate-400" />}
          {icon}
          {title}
        </button>
      ) : (
        <div className="flex items-center gap-2 text-xl font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
          {icon}
          {title}
        </div>
      )}
      {isDisabledSection && !disabledExpanded ? null : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-slate-500">
          {title === t("grid.disabled_title") ? t("grid.disabled_empty") : t("grid.empty_title")}
        </div>
      ) : (
        <div className={`grid gap-4 justify-start ${isDisabledSection ? "grid-cols-[repeat(auto-fill,minmax(250px,1fr))]" : "grid-cols-[repeat(auto-fill,minmax(260px,1fr))]"}`}>
          {items.map((sensor) => {
            const locationId = Number(sensor.location.id ?? sensor.id)
            const groupName =
              sensor.location.groupNames && sensor.location.groupNames.length > 0
                ? sensor.location.groupNames.join(" / ")
                : sensor.location.groupName1 || t("grid.no_group")

            return (
              <MonitoringCard
                key={sensor.id}
                idLieu={Number.isFinite(locationId) ? locationId : Number(sensor.id)}
                nomLieu={sensor.name ?? ""}
                lieuType={sensor.lieuType ?? sensor.location.lieuType ?? null}
                siteName={sensor.location.site ?? t("grid.unknown_site")}
                groupName={groupName}
                status={sensor.status}
                alarmType={sensor.alarmType ?? null}
                alarmId={sensor.alarmId ?? sensor.location.alarmId ?? null}
                alarmDisabled={sensor.location.alarmDisabled ?? false}
                alarmDisabledUntil={sensor.location.alarmDisabledUntil ?? null}
                alarmDelayMinutes={sensor.location.alarmDelayMinutes ?? null}
                alarmDelayHighMinutes={sensor.location.alarmDelayHighMinutes ?? null}
                alarmDelayLowMinutes={sensor.location.alarmDelayLowMinutes ?? null}
                noResponseDelayMinutes={sensor.location.noResponseDelayMinutes ?? null}
                consigneSupPreAlarme={sensor.location.consigneSupPreAlarme ?? null}
                estConsigneSupPreAlarmeActive={sensor.location.estConsigneSupPreAlarmeActive ?? false}
                consigneInfPreAlarme={sensor.location.consigneInfPreAlarme ?? null}
                estConsigneInfPreAlarmeActive={sensor.location.estConsigneInfPreAlarmeActive ?? false}
                locationComment={sensor.location.comment ?? null}
                lieuEtat={sensor.location.lieuEtat ?? ""}
                surveillanceDisabled={sensor.location.surveillanceDisabled ?? false}
                sondeNumeroSerie={sensor.location.sondeNumeroSerie ?? ""}
                isGso={sensor.location.isGso ?? null}
                gsoRssi={sensor.location.gsoRssi ?? null}
                batteryPercent={sensor.location.batteryPercent ?? null}
                gsoTension={sensor.location.gsoTension ?? null}
                onSurveillanceToggle={handleSurveillanceToggle}
                requireActionComment={requireActionComment}
                onEditLocation={onEditLocation}
                onDetailsModalStateChange={onDetailsModalStateChange}
                backgroundPaused={backgroundPaused}
                showNullNonResponse={showNullNonResponse}
              />
            )
          })}
        </div>
      )}
      {(!isDisabledSection || disabledExpanded) ? (isDisabledSection ? disabledFooter : activeFooter) : null}
    </div>
  )

  return (
    <div className="p-4 md:p-6 flex flex-col gap-8 animate-fade-in">
      <div style={{ order: disabledFirst ? 2 : 1 }}>
        {renderSection(
          `${t("grid.active_title")} (${countLocations(activeSensors, activeTotalCount)})`,
          <Power className="h-5 w-5 text-sky-500" />,
          sortedActiveSensors,
        )}
      </div>
      <div style={{ order: disabledFirst ? 1 : 2 }}>
        {renderSection(
          `${t("grid.disabled_title")} (${countLocations(disabledSensors, disabledTotalCount)})`,
          <PowerOff className="h-5 w-5 text-slate-400" />,
          sortedDisabledSensors,
          true,
        )}
      </div>
    </div>
  )
}



