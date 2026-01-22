"use client"

import { Power, PowerOff } from "lucide-react"
import type { ReactNode } from "react"
import { useTranslations } from "next-intl"

import MonitoringCard from "@/components/monitoring-card"
import { MonitoringCardSkeleton } from "@/components/monitoring-card-skeleton"
import type { SensorWithLocation } from "@/lib/api"

import { SurveillanceEmptyState } from "./_components/monitoring-empty-state"
import { sortSensorsByStatus } from "./_helpers/monitoring-derived"

interface SensorsCardsGridProps {
  sensors: SensorWithLocation[]
  disabledFirst?: boolean
  isLoading?: boolean
  onSurveillanceToggle?: (idLieu: number, newState: boolean, durationMinutes?: number | null) => void
}

/**
 * SensorsCardsGrid - Grille plate de toutes les sondes.
 * Affiche les memes cards que l'arborescence, sans distinction de sites/groupes.
 * Les infos de site et groupe sont affichees dans les cards.
 * Trie les capteurs par statut (alarmes en priorite).
 */
export function SensorsCardsGrid({
  sensors,
  disabledFirst = false,
  isLoading = false,
  onSurveillanceToggle,
}: SensorsCardsGridProps) {
  const t = useTranslations("surveillance")

  // Afficher des skeleton cards pendant le chargement
  if (isLoading && sensors.length === 0) {
    return (
      <div className="p-4 md:p-6 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xl font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
            <Power className="h-5 w-5 text-sky-500" />
            {t("grid.active_title")}
          </div>
          <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
            {Array.from({ length: 8 }).map((_, i) => (
              <MonitoringCardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (sensors.length === 0) {
    return <SurveillanceEmptyState title={t("grid.empty_title")} />
  }

  const sortedSensors = sortSensorsByStatus(sensors)
  const disabledSensors = sortedSensors.filter((sensor) => sensor.location.surveillanceDisabled)
  const activeSensors = sortedSensors.filter((sensor) => !sensor.location.surveillanceDisabled)

  const renderSection = (title: string, icon: ReactNode, items: SensorWithLocation[]) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xl font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
        {icon}
        {title}
      </div>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-slate-500">
          {title === t("grid.disabled_title") ? t("grid.disabled_empty") : t("grid.empty_title")}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
          {items.map((sensor) => {
            const groupName =
              sensor.location.groupNames && sensor.location.groupNames.length > 0
                ? sensor.location.groupNames.join(" / ")
                : sensor.location.groupName1 || "Sans groupe"

            return (
              <MonitoringCard
                key={sensor.id}
                idLieu={Number(sensor.id)}
                nomLieu={sensor.name}
                lieuType={sensor.lieuType ?? sensor.location.lieuType ?? undefined}
                siteName={sensor.location.site || "Site inconnu"}
                groupName={groupName}
                status={sensor.status}
                alarmDisabled={sensor.location.alarmDisabled}
                alarmDisabledUntil={sensor.location.alarmDisabledUntil}
                alarmDelayMinutes={sensor.location.alarmDelayMinutes ?? null}
                lieuEtat={sensor.location.lieuEtat ?? undefined}
                surveillanceDisabled={sensor.location.surveillanceDisabled}
                onSurveillanceToggle={onSurveillanceToggle}
              />
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <div className="p-4 md:p-6 space-y-8 animate-fade-in">
      {disabledFirst ? (
        <>
          {renderSection(
            t("grid.disabled_title"),
            <PowerOff className="h-5 w-5 text-slate-400" />,
            disabledSensors,
          )}
          {renderSection(
            t("grid.active_title"),
            <Power className="h-5 w-5 text-sky-500" />,
            activeSensors,
          )}
        </>
      ) : (
        <>
          {renderSection(
            t("grid.active_title"),
            <Power className="h-5 w-5 text-sky-500" />,
            activeSensors,
          )}
          {renderSection(
            t("grid.disabled_title"),
            <PowerOff className="h-5 w-5 text-slate-400" />,
            disabledSensors,
          )}
        </>
      )}
    </div>
  )
}

