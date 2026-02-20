"use client"

import { useState } from "react"
import { Building2, ChevronDown, Power, PowerOff, Users } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import MonitoringCard from "@/components/monitoring-card"
import { MonitoringCardSkeleton } from "@/components/monitoring-card-skeleton"
import type { SensorWithLocation } from "@/lib/api"
import { countStatus } from "@/lib/surveillance-status"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SurveillanceEmptyState } from "./_components/monitoring-empty-state"
import { SurveillanceTreeStatsBadges } from "./_components/monitoring-tree-stats-badges"
import { groupSensorsBySiteAndGroup } from "./_helpers/group-sensors"
import { sortSensorsByStatus } from "./_helpers/monitoring-derived"
import { formatAlarmes, formatGroupes, formatPreAlarmes, formatSondes } from "./_helpers/monitoring-labels"
import { usePersistentStringSet } from "./_hooks/use-persistent-string-set"
import { useAppTimezone } from "@/components/timezone-provider"

interface MonitoringCardsGridProps {
  sensors: SensorWithLocation[]
  disabledFirst?: boolean
  isLoading?: boolean
  onSurveillanceToggle?: (
    idLieu: number,
    action: "surveillance" | "alarms",
    newState: boolean,
    durationMinutes?: number | null,
  ) => void
  onGroupSurveillanceToggle?: (groupId: number, newState: boolean, durationMinutes?: number | null) => void
  onEditLocation?: (idLieu: number) => void
  showNullNonResponse?: boolean
  onShowNullNonResponseChange?: (enabled: boolean) => Promise<void> | void
  nonResponsePreferencesLoading?: boolean
}

function formatDisabledLabel(
  disabledUntil: Date | string | null,
  locale: string,
  timezone: string | undefined,
  t: (key: string, values?: Record<string, string>) => string,
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

export function MonitoringCardsGrid({
  sensors,
  disabledFirst = false,
  isLoading = false,
  onSurveillanceToggle,
  onGroupSurveillanceToggle,
  onEditLocation,
  showNullNonResponse = false,
  onShowNullNonResponseChange,
  nonResponsePreferencesLoading = false,
}: MonitoringCardsGridProps) {
  const t = useTranslations("surveillance")
  const locale = useLocale()
  const timezone = useAppTimezone()
  const { value: expandedSites, toggle: toggleSite } = usePersistentStringSet(
    "surveillance-expanded-sites",
  )
  const { value: expandedGroups, toggle: toggleGroup } = usePersistentStringSet(
    "surveillance-expanded-groups",
  )
  const [groupModal, setGroupModal] = useState<{
    groupId: number
    groupName: string
    isActive: boolean
  } | null>(null)
  const [groupDisableDuration, setGroupDisableDuration] = useState("60")
  const handleSurveillanceToggle =
    onSurveillanceToggle ??
    ((_: number, __: "surveillance" | "alarms", ___: boolean, ____: number | null) => {
      // no-op
    })

  // Afficher des skeleton cards pendant le chargement
  if (isLoading && sensors.length === 0) {
    return (
      <div className="p-4 md:p-6 space-y-8">
        {/* Section Active */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xl font-semibold text-slate-700 dark:text-slate-50">
                <Power className="h-5 w-5 text-sky-500" />
                {t("grid.active_title")}
              </div>
            </div>
            <div className="h-px w-full bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
            {Array.from({ length: 4 }).map((_, i) => (
              <MonitoringCardSkeleton key={`skeleton-active-${i}`} />
            ))}
          </div>
        </div>

        {/* Section Disabled */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xl font-semibold text-slate-700 dark:text-slate-50">
              <PowerOff className="h-5 w-5 text-slate-400" />
              {t("grid.disabled_title")}
            </div>
            <div className="h-px w-full bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
            {Array.from({ length: 4 }).map((_, i) => (
              <MonitoringCardSkeleton key={`skeleton-disabled-${i}`} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (sensors.length === 0) {
    return <SurveillanceEmptyState title={t("grid.empty_title")} />
  }

  const disabledSensors = sensors.filter((sensor) => sensor.location.surveillanceDisabled)
  const activeSensors = sensors.filter((sensor) => !sensor.location.surveillanceDisabled)

  const groupedActive = groupSensorsBySiteAndGroup(activeSensors)
  const groupedDisabled = groupSensorsBySiteAndGroup(disabledSensors)
  const hasDisabled = groupedDisabled.length > 0

  const renderActiveSection = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-semibold text-slate-700 dark:text-slate-200">
            <Power className="h-5 w-5 text-sky-500" />
            {t("grid.active_title")}
          </div>
        </div>
        <div className="h-px w-full bg-slate-200 dark:bg-slate-700" />
      </div>
      {groupedActive.map(({ siteId, siteName, sensorsCount, groups }) => {
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
              <span className="ml-auto flex items-center gap-3 text-base font-semibold text-gray-600 dark:text-slate-300">
                <span>
                  {formatSondes(sensorsCount)} - {formatGroupes(groups.length)}
                  {siteStats.critical > 0 ? ` - ${formatAlarmes(siteStats.critical)}` : ""}
                  {siteStats.warning > 0 ? ` - ${formatPreAlarmes(siteStats.warning)}` : ""}
                </span>
                <SurveillanceTreeStatsBadges stats={siteStats} compact />
              </span>
            </button>

            {isSiteExpanded ? (
              <div className="space-y-4 animate-fade-in">
                {groups.map(({ groupKey, groupId, groupName, sensors: groupSensors }) => {
                  const isGroupExpanded = expandedGroups.has(groupKey)
                  const sortedGroupSensors = sortSensorsByStatus(groupSensors)
                  const groupStats = countStatus(groupSensors)
                  const groupDisabled =
                    groupId !== null &&
                    groupSensors.length > 0 &&
                    groupSensors.every((sensor) => sensor.location.surveillanceDisabled)
                  const groupDisabledUntil = groupDisabled
                    ? groupSensors
                        .map((sensor) => sensor.location.alarmDisabledUntil)
                        .filter((value) => value !== null && value !== undefined)
                        .map((value) => new Date(value as string | number | Date))
                        .filter((date) => !Number.isNaN(date.getTime()))
                        .reduce<Date | null>((latest, current) => {
                          if (!latest) return current
                          return current > latest ? current : latest
                        }, null)
                    : null

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
                        <h3 className="text-xl font-semibold">{groupName}</h3>
                        <span className="ml-auto flex items-center gap-3 text-xs text-gray-500">
                          <span>
                            {formatSondes(groupSensors.length)}
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
                        {groupId !== null ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="ml-2 h-8 w-8"
                            title={
                              groupDisabled
                                ? t("group_modal.toggle_enable")
                                : t("group_modal.toggle_disable")
                            }
                            onClick={(event) => {
                              event.stopPropagation()
                              setGroupDisableDuration("60")
                              setGroupModal({
                                groupId,
                                groupName,
                                isActive: !groupDisabled,
                              })
                            }}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </button>

                      {isGroupExpanded ? (
                        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,320px))] justify-start animate-fade-in">
                          {sortedGroupSensors.map((sensor) => (
                            <MonitoringCard
                              key={sensor.id}
                              idLieu={Number(sensor.id)}
                              nomLieu={sensor.name ?? ""}
                              lieuType={sensor.lieuType ?? sensor.location.lieuType ?? null}
                              siteName={siteName ?? ""}
                              groupName={groupName ?? ""}
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
                              gsoTension={sensor.location.gsoTension ?? null}
                              onSurveillanceToggle={(id, action, newState, durationMinutes) =>
                                handleSurveillanceToggle(id, action, newState, durationMinutes ?? null)
                              }
                              onEditLocation={onEditLocation}
                              showNullNonResponse={showNullNonResponse}
                              onShowNullNonResponseChange={onShowNullNonResponseChange}
                              nonResponsePreferencesLoading={nonResponsePreferencesLoading}
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )

  const renderDisabledSection = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xl font-semibold text-slate-700 dark:text-slate-50">
          <PowerOff className="h-5 w-5 text-slate-400" />
          {t("grid.disabled_title")}
        </div>
        <div className="h-px w-full bg-slate-200 dark:bg-slate-700" />
      </div>
      {hasDisabled ? (
        <div>
          {groupedDisabled.map(({ siteId, siteName, sensorsCount, groups }) => {
            const isSiteExpanded = expandedSites.has(`disabled-${siteId}`)
            return (
              <div key={`disabled-${siteId}`} className="space-y-4">
                <button
                  onClick={() => toggleSite(`disabled-${siteId}`)}
                  className="w-full flex items-center gap-3 border-b border-gray-200 dark:border-slate-700 pb-3 hover:bg-gray-50 dark:hover:bg-slate-900/50 px-2 py-1 rounded transition-colors"
                >
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      isSiteExpanded ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                  <Building2 className="w-5 h-5 text-slate-500" />
                  <h2 className="text-xl font-semibold">{siteName}</h2>
                  <span className="ml-auto text-xs text-gray-500">
                    {formatSondes(sensorsCount)} - {formatGroupes(groups.length)}
                  </span>
                </button>

                {isSiteExpanded ? (
                  <div className="space-y-3 animate-fade-in">
                    {groups.map(({ groupKey, groupName, sensors: groupSensors }) => (
                      <div key={`disabled-${groupKey}`} className="space-y-3">
                        <div className="flex items-center gap-2 px-2 py-1 text-base font-semibold text-gray-600 dark:text-slate-300">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">{groupName}</span>
                        </div>
                        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,320px))] justify-start animate-fade-in">
                          {sortSensorsByStatus(groupSensors).map((sensor) => (
                            <MonitoringCard
                              key={sensor.id}
                              idLieu={Number(sensor.id)}
                              nomLieu={sensor.name ?? ""}
                              lieuType={sensor.lieuType ?? sensor.location.lieuType ?? null}
                              siteName={siteName ?? ""}
                              groupName={groupName ?? ""}
                              status={sensor.status}
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
                              gsoTension={sensor.location.gsoTension ?? null}
                              onSurveillanceToggle={(id, action, newState, durationMinutes) =>
                                handleSurveillanceToggle(id, action, newState, durationMinutes ?? null)
                              }
                              onEditLocation={onEditLocation}
                              showNullNonResponse={showNullNonResponse}
                              onShowNullNonResponseChange={onShowNullNonResponseChange}
                              nonResponsePreferencesLoading={nonResponsePreferencesLoading}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-slate-500">
          {t("grid.disabled_empty")}
        </div>
      )}
    </div>
  )

  return (
    <div className="p-4 md:p-6 space-y-8 animate-fade-in">
      {disabledFirst ? (
        <>
          {renderDisabledSection()}
          {renderActiveSection()}
        </>
      ) : (
        <>
          {renderActiveSection()}
          {renderDisabledSection()}
        </>
      )}

      <Dialog open={groupModal !== null} onOpenChange={() => setGroupModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("group_modal.title")}</DialogTitle>
            <DialogDescription>
              {groupModal
                ? t("group_modal.description", {
                    action: groupModal.isActive
                      ? t("group_modal.action_disable")
                      : t("group_modal.action_enable"),
                    group: groupModal.groupName,
                  })
                : null}
            </DialogDescription>
          </DialogHeader>
          {groupModal?.isActive ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("group_modal.duration_label")}</label>
              <Select value={groupDisableDuration} onValueChange={setGroupDisableDuration}>
                <SelectTrigger>
                  <SelectValue placeholder={t("group_modal.duration_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">{t("group_modal.duration_options.15")}</SelectItem>
                  <SelectItem value="60">{t("group_modal.duration_options.60")}</SelectItem>
                  <SelectItem value="240">{t("group_modal.duration_options.240")}</SelectItem>
                  <SelectItem value="720">{t("group_modal.duration_options.720")}</SelectItem>
                  <SelectItem value="manual">{t("group_modal.duration_options.manual")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupModal(null)}>
              {t("group_modal.cancel")}
            </Button>
            <Button
              variant={groupModal?.isActive ? "destructive" : "default"}
              onClick={() => {
                if (!groupModal || !onGroupSurveillanceToggle) {
                  setGroupModal(null)
                  return
                }
                const newState = !groupModal.isActive
                const durationMinutes =
                  newState === false
                    ? groupDisableDuration === "manual"
                      ? null
                      : Number(groupDisableDuration)
                    : null
                onGroupSurveillanceToggle(groupModal.groupId, newState, durationMinutes)
                setGroupModal(null)
              }}
            >
              {t("group_modal.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}















