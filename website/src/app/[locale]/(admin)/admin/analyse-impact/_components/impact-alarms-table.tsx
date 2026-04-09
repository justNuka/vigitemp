"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TanStackTable } from "@/components/data-table/tanstack-table"
import type { MeasureData } from "@/lib/measurements"
import type { SimulatedZone } from "../lib/simulated-zones"
import type { RealAlarm } from "./impact-chart"

interface ImpactAlarmsTableProps {
  simZones: SimulatedZone[]
  realAlarms: RealAlarm[]
  measurements: MeasureData[]
  locale: string
  isLoading: boolean
}

function formatDuration(startIso: string, endIso: string): string {
  const diffMs = new Date(endIso).getTime() - new Date(startIso).getTime()
  const totalMinutes = Math.round(diffMs / 60000)
  if (totalMinutes < 60) return `${totalMinutes}min`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}min`
}

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

function countOutOfBoundPoints(measurements: MeasureData[], zone: SimulatedZone): number {
  return measurements.filter(
    (m) =>
      (m.DateHeureMesureIso ?? m.DateHeureMesure) >= zone.start &&
      (m.DateHeureMesureIso ?? m.DateHeureMesure) <= zone.end,
  ).length
}

type SimRow = { index: number; start: string; end: string; duration: string; points: number }
type RealRow = { index: number; id: number; start: string; end: string; duration: string; type: string }

export function ImpactAlarmsTable({
  simZones,
  realAlarms,
  measurements,
  locale,
  isLoading,
}: ImpactAlarmsTableProps) {
  const t = useTranslations("impactAnalysis")

  const simRows = useMemo<SimRow[]>(
    () =>
      simZones.map((zone, i) => ({
        index: i + 1,
        start: formatDate(zone.start, locale),
        end: formatDate(zone.end, locale),
        duration: formatDuration(zone.start, zone.end),
        points: countOutOfBoundPoints(measurements, zone),
      })),
    [simZones, measurements, locale],
  )

  const realRows = useMemo<RealRow[]>(
    () =>
      realAlarms.map((alarm, i) => ({
        index: i + 1,
        id: alarm.Id_Alarme,
        start: formatDate(alarm.Date_Heure_Debut, locale),
        end: alarm.Date_Heure_Fin ? formatDate(alarm.Date_Heure_Fin, locale) : "—",
        duration: alarm.Date_Heure_Fin
          ? formatDuration(alarm.Date_Heure_Debut, alarm.Date_Heure_Fin)
          : "—",
        type: alarm.Type ?? "—",
      })),
    [realAlarms, locale],
  )

  const simColumns = useMemo<ColumnDef<SimRow>[]>(
    () => [
      { accessorKey: "index", header: t("table.colIndex"), size: 48, enableSorting: false },
      { accessorKey: "start", header: t("table.colStart") },
      { accessorKey: "end", header: t("table.colEnd") },
      { accessorKey: "duration", header: t("table.colDuration") },
      { accessorKey: "points", header: t("table.colPoints") },
    ],
    [t],
  )

  const realColumns = useMemo<ColumnDef<RealRow>[]>(
    () => [
      { accessorKey: "index", header: t("table.colIndex"), size: 48, enableSorting: false },
      { accessorKey: "start", header: t("table.colStart") },
      { accessorKey: "end", header: t("table.colEnd") },
      { accessorKey: "duration", header: t("table.colDuration") },
      { accessorKey: "type", header: t("table.colType") },
    ],
    [t],
  )

  if (isLoading) {
    return (
      <Card className="mx-6 mb-6">
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-6 mb-6">
      <CardContent className="pt-6 space-y-6">
        {/* Simulated alarms */}
        <div>
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              {t("table.simTitle", { count: simZones.length })}
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                {simZones.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <TanStackTable
            columns={simColumns}
            data={simRows}
            pageSize={10}
            maxHeight="20rem"
            emptyMessage={t("table.noSimAlarms")}
            showSearch={false}
            showPagination={true}
          />
        </div>

        {/* Real alarms */}
        <div>
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              {t("table.realTitle", { count: realAlarms.length })}
              <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {realAlarms.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <TanStackTable
            columns={realColumns}
            data={realRows}
            pageSize={10}
            maxHeight="20rem"
            emptyMessage={t("table.noRealAlarms")}
            showSearch={false}
            showPagination={true}
          />
        </div>
      </CardContent>
    </Card>
  )
}
