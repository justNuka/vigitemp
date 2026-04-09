"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useLocale, useTranslations } from "next-intl"
import { BellOff, Thermometer, TriangleAlert } from "lucide-react"

import { TanStackTable } from "@/components/data-table/tanstack-table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type AlarmByLocationRow = {
  locationId: number
  locationName: string
  siteName: string
  totalCount: number
  activeCount: number
  highCount: number
  lowCount: number
  noResponseCount: number
  lastTriggeredAt: string | null
}

function formatDateTime(value: string | null, locale: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleString(locale.toLowerCase().startsWith("fr") ? "fr-FR" : locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function AlarmsByLocationPageClient({ rows }: { rows: AlarmByLocationRow[] }) {
  const t = useTranslations("dashboardClient")
  const locale = useLocale()

  const totalAlarms = useMemo(() => rows.reduce((sum, row) => sum + row.totalCount, 0), [rows])

  const columns = useMemo<ColumnDef<AlarmByLocationRow>[]>(
    () => [
      {
        accessorKey: "locationName",
        header: t("trend_by_location.columns.location"),
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium">{row.original.locationName}</div>
            <div className="truncate text-xs text-muted-foreground">{row.original.siteName}</div>
          </div>
        ),
      },
      {
        accessorKey: "totalCount",
        header: () => <div className="text-right">{t("trend_by_location.columns.total")}</div>,
        cell: ({ row }) => <div className="text-right font-semibold tabular-nums">{row.original.totalCount}</div>,
      },
      {
        accessorKey: "activeCount",
        header: () => <div className="text-right">{t("trend_by_location.columns.active")}</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Badge variant={row.original.activeCount > 0 ? "destructive" : "secondary"}>{row.original.activeCount}</Badge>
          </div>
        ),
      },
      {
        id: "types",
        header: t("trend_by_location.columns.types"),
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("gap-1", row.original.highCount > 0 && "border-destructive/50 text-destructive")}>
              <TriangleAlert className="h-3.5 w-3.5" />
              {row.original.highCount}
            </Badge>
            <Badge variant="outline" className={cn("gap-1", row.original.lowCount > 0 && "border-info/50 text-info")}>
              <Thermometer className="h-3.5 w-3.5" />
              {row.original.lowCount}
            </Badge>
            <Badge variant="outline" className={cn("gap-1", row.original.noResponseCount > 0 && "border-warning/50 text-warning")}>
              <BellOff className="h-3.5 w-3.5" />
              {row.original.noResponseCount}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "lastTriggeredAt",
        header: t("trend_by_location.columns.last_triggered"),
        cell: ({ row }) => <div className="text-sm text-muted-foreground">{formatDateTime(row.original.lastTriggeredAt, locale)}</div>,
      },
    ],
    [locale, t],
  )

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t("trend_by_location.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("trend_by_location.description")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("trend_by_location.stats.locations")}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{rows.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("trend_by_location.stats.total_alarms")}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{totalAlarms}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("trend_by_location.stats.active_locations")}</CardTitle>
            <CardDescription>{t("trend_by_location.stats.active_locations_help")}</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">
            {rows.filter((row) => row.activeCount > 0).length}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <TanStackTable
            columns={columns}
            data={rows}
            searchField={["locationName", "siteName"]}
            searchPlaceholder={t("trend_by_location.search_placeholder")}
            emptyMessage={t("trend_by_location.empty")}
            pageSize={10}
            exportFileName="alarmes-par-lieu"
          />
        </CardContent>
      </Card>
    </main>
  )
}
