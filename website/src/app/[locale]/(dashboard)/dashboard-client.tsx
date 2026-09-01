"use client"

import { useCallback, useMemo, useState } from "react"
import { enUS, fr } from "date-fns/locale"
import { useQueryClient } from "@tanstack/react-query"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"
import { LazyMotion, domAnimation, m } from "motion/react"

import { AlarmAcknowledgeDialog } from "@/components/alarm-acknowledge-dialog"
import { useAppAccess } from "@/components/access/app-access-provider"
import { useAppTimezone } from "@/components/timezone-provider"
import { alarmsApi, type AlarmWithDetails, type Measurement, type SensorWithLocation } from "@/lib/api"
import { formatDbDateTime } from "@/lib/date-display"
import { markAlarmAcknowledgedInPaginatedSensorsCache } from "@/lib/surveillance-cache"
import { staggerContainer, fadeInUp } from "@/lib/motion-variants"
import { DashboardActiveAlarmsSection } from "./_components/dashboard/dashboard-active-alarms-section"
import { createDashboardAlarmColumns, buildAlarmRows } from "./_components/dashboard/dashboard-alarm-columns"
import { DashboardTrendSection } from "./_components/dashboard/dashboard-trend-section"
import type { DashboardAlarmTypeCounts } from "./server-dashboard"

interface DashboardClientProps {
  criticalSensors: SensorWithLocation[]
  activeAlarms: AlarmWithDetails[]
  alarmTypeCounts: DashboardAlarmTypeCounts
  sensorOverview: SensorWithLocation[]
  totalActiveAlarms: number
  trendCountLast7d: number
  trendMeasurements: Measurement[]
}

export function DashboardClient({
  criticalSensors: _criticalSensors,
  activeAlarms,
  alarmTypeCounts,
  sensorOverview: _sensorOverview,
  totalActiveAlarms,
  trendCountLast7d,
  trendMeasurements,
}: DashboardClientProps) {
  const t = useTranslations("dashboardClient")
  const tAlarmType = useTranslations("alarmAckHistoryPage.table.type")
  const locale = useLocale()
  const dateLocale = locale.toLowerCase().startsWith("fr") ? fr : enUS
  const localeTag = locale.toLowerCase().startsWith("fr") ? "fr-FR" : locale
  const timezone = useAppTimezone()
  const queryClient = useQueryClient()
  const { hasPermission } = useAppAccess()

  const canAcknowledgeAlarm = hasPermission("ALARM_ACK_ACCESS")
  const [locallyAcknowledgedIds, setLocallyAcknowledgedIds] = useState<Set<string>>(new Set())
  const [selectedAlarm, setSelectedAlarm] = useState<AlarmWithDetails | null>(null)
  const [isAcknowledging] = useState(false)

  const localAlarms = useMemo(
    () => activeAlarms.filter((alarm) => !locallyAcknowledgedIds.has(alarm.id)),
    [activeAlarms, locallyAcknowledgedIds],
  )

  const activeCount = useMemo(
    () => Math.max(totalActiveAlarms - locallyAcknowledgedIds.size, 0),
    [totalActiveAlarms, locallyAcknowledgedIds],
  )

  const formatTzDateTime = useCallback((value: string | Date) => {
    return formatDbDateTime(value, { format: "dateTimeSeconds", locale: localeTag, timeZone: timezone })
  }, [localeTag, timezone])

  const handleAcknowledge = async (alarmId: string, commentValue: string) => {
    try {
      await alarmsApi.acknowledge(alarmId, commentValue)
      const acknowledgedId = Number(alarmId)
      if (Number.isFinite(acknowledgedId)) {
        markAlarmAcknowledgedInPaginatedSensorsCache(queryClient, acknowledgedId)
      }
      setLocallyAcknowledgedIds((previousIds) => {
        if (previousIds.has(alarmId)) return previousIds
        const nextIds = new Set(previousIds)
        nextIds.add(alarmId)
        const nextCount = Math.max(totalActiveAlarms - nextIds.size, 0)
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("vigitemp:active-alarms", { detail: { count: nextCount } }))
        }
        return nextIds
      })
      toast.success(t("toast.ack_success"))
    } catch (error) {
      console.error("Acknowledge alarm error:", error)
      toast.error(t("toast.ack_error"))
    }
  }

  const displayedAlarms = useMemo(() => localAlarms.slice(0, 10), [localAlarms])
  const tableData = useMemo(() => buildAlarmRows(displayedAlarms), [displayedAlarms])
  const columns = useMemo(
    () =>
      createDashboardAlarmColumns({
        t,
        dateLocale,
        canAcknowledgeAlarm,
        onSelectAlarm: (alarmId) => {
          const fullAlarm = displayedAlarms.find((item) => item.id === alarmId)
          if (fullAlarm && canAcknowledgeAlarm) setSelectedAlarm(fullAlarm)
        },
      }),
    [t, dateLocale, canAcknowledgeAlarm, displayedAlarms],
  )

  return (
    <LazyMotion features={domAnimation}>
      <m.main
        className="flex-1 p-4 md:p-6 space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <m.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DashboardActiveAlarmsSection
            t={t}
            activeCount={activeCount}
            data={tableData}
            columns={columns}
            selectedAlarmId={selectedAlarm?.id}
            canAcknowledgeAlarm={canAcknowledgeAlarm}
            onRowClick={(row) => {
              const fullAlarm = displayedAlarms.find((item) => item.id === row.id)
              if (fullAlarm && canAcknowledgeAlarm) setSelectedAlarm(fullAlarm)
            }}
          />

          <DashboardTrendSection
            t={t}
            trendMeasurements={trendMeasurements}
            trendCountLast7d={trendCountLast7d}
            alarmTypeCounts={alarmTypeCounts}
            alarmTypeLabels={{
              high: tAlarmType("high"),
              low: tAlarmType("low"),
              noResponse: tAlarmType("no_response"),
              sector: tAlarmType("sector"),
              module: tAlarmType("module"),
            }}
          />
        </m.div>

        <AlarmAcknowledgeDialog
          open={canAcknowledgeAlarm && !!selectedAlarm}
          alarm={
            selectedAlarm
              ? {
                  id: selectedAlarm.id,
                  locationId: selectedAlarm.locationId,
                  locationName: selectedAlarm.location.name,
                  sensorName: selectedAlarm.sensor.name,
                  type: selectedAlarm.type,
                  currentValue: selectedAlarm.sensor.currentValue,
                  value: selectedAlarm.value,
                  unit: selectedAlarm.sensor.unit,
                  minThreshold: selectedAlarm.sensor.minThreshold,
                  maxThreshold: selectedAlarm.sensor.maxThreshold,
                  triggeredAt: selectedAlarm.triggeredAt,
                  endedAt: selectedAlarm.resolvedAt,
                }
              : null
          }
          onOpenChange={(open) => {
            if (!open) setSelectedAlarm(null)
          }}
          onConfirm={async (alarmIds, commentValue, options) => {
            for (const alarmId of alarmIds) {
              await handleAcknowledge(alarmId, commentValue ?? "")
            }
            if (options?.closeAfter !== false) {
              setSelectedAlarm(null)
            }
          }}
          isConfirming={isAcknowledging}
        />
      </m.main>
    </LazyMotion>
  )
}
