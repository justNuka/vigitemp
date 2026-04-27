"use client"

import { useEffect, useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useLocale, useTranslations } from "next-intl"
import { BarChart3, Clock3, Loader2, Send, TriangleAlert } from "lucide-react"
import { toast } from "sonner"

import { TanStackTable } from "@/components/data-table/tanstack-table"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { formatMeasureValue } from "@/lib/measurements"

export type LocationStatisticsRow = {
  locationId: number
  locationName: string
  siteName: string
  groups: string
  unit: string
  consigne: number | null
  toleranceSup: number | null
  toleranceInf: number | null
  frequencySec: number | null
  highDelayMin: number | null
  lowDelayMin: number | null
  retriggerDelayMeasures: number | null
  measureMax: number | null
  measureMin: number | null
  measureAvg: number | null
  alarmCount: number
  alarmHighDurationSec: number
  alarmLowDurationSec: number
  exceedHighNoAlarmSec: number
  exceedLowNoAlarmSec: number
}

type MonthlyConfig = {
  enabled: boolean
  recipients: string
  dayOfMonth: number
  hourLocal: number
  includeLocationSummary: boolean
  includeSettingsSummary: boolean
  includeMax: boolean
  includeMin: boolean
  includeAvg: boolean
  includeAlarmCount: boolean
  includeAlarmHighDuration: boolean
  includeAlarmLowDuration: boolean
  includeOverHighNoAlarm: boolean
  includeOverLowNoAlarm: boolean
}

const DEFAULT_CONFIG: MonthlyConfig = {
  enabled: false,
  recipients: "",
  dayOfMonth: 1,
  hourLocal: 8,
  includeLocationSummary: true,
  includeSettingsSummary: true,
  includeMax: true,
  includeMin: true,
  includeAvg: true,
  includeAlarmCount: true,
  includeAlarmHighDuration: true,
  includeAlarmLowDuration: true,
  includeOverHighNoAlarm: true,
  includeOverLowNoAlarm: true,
}

const TOGGLE_FIELDS: Array<{ key: keyof MonthlyConfig; labelKey: string }> = [
  { key: "includeLocationSummary", labelKey: "trend_by_location.admin.fields.location_summary" },
  { key: "includeSettingsSummary", labelKey: "trend_by_location.admin.fields.settings_summary" },
  { key: "includeMax", labelKey: "trend_by_location.admin.fields.max" },
  { key: "includeMin", labelKey: "trend_by_location.admin.fields.min" },
  { key: "includeAvg", labelKey: "trend_by_location.admin.fields.avg" },
  { key: "includeAlarmCount", labelKey: "trend_by_location.admin.fields.alarm_count" },
  { key: "includeAlarmHighDuration", labelKey: "trend_by_location.admin.fields.alarm_high_duration" },
  { key: "includeAlarmLowDuration", labelKey: "trend_by_location.admin.fields.alarm_low_duration" },
  { key: "includeOverHighNoAlarm", labelKey: "trend_by_location.admin.fields.over_high_no_alarm" },
  { key: "includeOverLowNoAlarm", labelKey: "trend_by_location.admin.fields.over_low_no_alarm" },
]

function formatDuration(totalSeconds: number, locale: string) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "-"
  const seconds = Math.max(0, Math.round(totalSeconds))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const isFrench = locale.toLowerCase().startsWith("fr")
  if (hours > 0) return `${hours}${isFrench ? " h " : "h "}${minutes}${isFrench ? " min" : "m"}`
  return `${minutes}${isFrench ? " min" : "m"}`
}

function formatFrequency(seconds: number | null, t: ReturnType<typeof useTranslations>) {
  if (!seconds || seconds <= 0) return "-"
  if (seconds % 60 === 0) return t("trend_by_location.units.minutes_value", { value: seconds / 60 })
  return t("trend_by_location.units.seconds_value", { value: seconds })
}

export function AlarmsByLocationPageClient({
  rows,
  fromDate,
  toDate,
  canManageReport,
}: {
  rows: LocationStatisticsRow[]
  fromDate: string
  toDate: string
  canManageReport: boolean
}) {
  const t = useTranslations("dashboardClient")
  const locale = useLocale()
  const [config, setConfig] = useState<MonthlyConfig>(DEFAULT_CONFIG)
  const [isLoadingConfig, setIsLoadingConfig] = useState(false)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [isSendingNow, setIsSendingNow] = useState(false)

  const columns = useMemo<ColumnDef<LocationStatisticsRow>[]>(
    () => [
      {
        id: "location",
        header: t("trend_by_location.columns.location_summary"),
        cell: ({ row }) => (
          <div className="min-w-0 space-y-0.5">
            <div className="truncate font-medium">{row.original.locationName}</div>
            <div className="truncate text-xs text-muted-foreground">
              {t("trend_by_location.summary.site_group", {
                site: row.original.siteName,
                groups: row.original.groups,
              })}
            </div>
          </div>
        ),
      },
      {
        id: "settings",
        header: t("trend_by_location.columns.settings_summary"),
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground space-y-0.5">
            <div>
              {t("trend_by_location.summary.thresholds", {
                consigne: row.original.consigne !== null ? formatMeasureValue(row.original.consigne, 2, locale) : "-",
                sup: row.original.toleranceSup !== null ? formatMeasureValue(row.original.toleranceSup, 2, locale) : "-",
                inf: row.original.toleranceInf !== null ? formatMeasureValue(row.original.toleranceInf, 2, locale) : "-",
                unit: row.original.unit,
              })}
            </div>
            <div>
              {t("trend_by_location.summary.frequency_delay", {
                frequency: formatFrequency(row.original.frequencySec, t),
                highDelay: row.original.highDelayMin ?? "-",
                lowDelay: row.original.lowDelayMin ?? "-",
                retrigger: row.original.retriggerDelayMeasures ?? "-",
              })}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "measureMax",
        header: () => <div className="text-right">{t("trend_by_location.columns.max")}</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono">
            {row.original.measureMax !== null ? `${formatMeasureValue(row.original.measureMax, 2, locale)} ${row.original.unit}` : "-"}
          </div>
        ),
      },
      {
        accessorKey: "measureMin",
        header: () => <div className="text-right">{t("trend_by_location.columns.min")}</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono">
            {row.original.measureMin !== null ? `${formatMeasureValue(row.original.measureMin, 2, locale)} ${row.original.unit}` : "-"}
          </div>
        ),
      },
      {
        accessorKey: "measureAvg",
        header: () => <div className="text-right">{t("trend_by_location.columns.avg")}</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono">
            {row.original.measureAvg !== null ? `${formatMeasureValue(row.original.measureAvg, 2, locale)} ${row.original.unit}` : "-"}
          </div>
        ),
      },
      {
        accessorKey: "alarmCount",
        header: () => <div className="text-right">{t("trend_by_location.columns.alarm_count")}</div>,
        cell: ({ row }) => <div className="text-right font-semibold tabular-nums">{row.original.alarmCount}</div>,
      },
      {
        accessorKey: "alarmHighDurationSec",
        header: () => <div className="text-right">{t("trend_by_location.columns.alarm_high_duration")}</div>,
        cell: ({ row }) => <div className="text-right tabular-nums">{formatDuration(row.original.alarmHighDurationSec, locale)}</div>,
      },
      {
        accessorKey: "alarmLowDurationSec",
        header: () => <div className="text-right">{t("trend_by_location.columns.alarm_low_duration")}</div>,
        cell: ({ row }) => <div className="text-right tabular-nums">{formatDuration(row.original.alarmLowDurationSec, locale)}</div>,
      },
      {
        accessorKey: "exceedHighNoAlarmSec",
        header: () => <div className="text-right">{t("trend_by_location.columns.over_high_no_alarm")}</div>,
        cell: ({ row }) => <div className="text-right tabular-nums">{formatDuration(row.original.exceedHighNoAlarmSec, locale)}</div>,
      },
      {
        accessorKey: "exceedLowNoAlarmSec",
        header: () => <div className="text-right">{t("trend_by_location.columns.over_low_no_alarm")}</div>,
        cell: ({ row }) => <div className="text-right tabular-nums">{formatDuration(row.original.exceedLowNoAlarmSec, locale)}</div>,
      },
    ],
    [locale, t],
  )

  const summary = useMemo(() => {
    const locations = rows.length
    const alarms = rows.reduce((sum, row) => sum + row.alarmCount, 0)
    return { locations, alarms }
  }, [rows])

  useEffect(() => {
    if (!canManageReport) return
    let active = true
    setIsLoadingConfig(true)
    fetch("/api/statistiques/recap-mensuel/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!active || !payload?.ok || !payload?.data) return
        setConfig({ ...DEFAULT_CONFIG, ...payload.data })
      })
      .finally(() => {
        if (active) setIsLoadingConfig(false)
      })
    return () => {
      active = false
    }
  }, [canManageReport])

  const updateConfig = <K extends keyof MonthlyConfig>(key: K, value: MonthlyConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const updateBooleanConfig = (key: keyof MonthlyConfig, value: boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const saveConfig = async () => {
    try {
      setIsSavingConfig(true)
      const response = await fetch("/api/statistiques/recap-mensuel/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      const payload = await response.json()
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.message ?? "save_failed")
      }
      toast.success(t("trend_by_location.admin.save_success"))
    } catch {
      toast.error(t("trend_by_location.admin.save_error"))
    } finally {
      setIsSavingConfig(false)
    }
  }

  const sendNow = async () => {
    try {
      setIsSendingNow(true)
      const response = await fetch("/api/statistiques/recap-mensuel/send", {
        method: "POST",
      })
      const payload = await response.json()
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.message ?? "send_failed")
      }
      toast.success(t("trend_by_location.admin.send_success", { sent: payload?.data?.sent ?? 0 }))
    } catch {
      toast.error(t("trend_by_location.admin.send_error"))
    } finally {
      setIsSendingNow(false)
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title={t("trend_by_location.title")}
        description={t("trend_by_location.description")}
      />

      <main className="flex-1 space-y-6 p-4 md:p-6">

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-primary" />
            {t("trend_by_location.period.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
            <div className="space-y-1">
              <Label htmlFor="stats-from">{t("trend_by_location.period.from")}</Label>
              <Input id="stats-from" name="from" type="date" defaultValue={fromDate} className="w-52" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="stats-to">{t("trend_by_location.period.to")}</Label>
              <Input id="stats-to" name="to" type="date" defaultValue={toDate} className="w-52" />
            </div>
            <Button type="submit">{t("trend_by_location.period.apply")}</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("trend_by_location.stats.locations")}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{summary.locations}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("trend_by_location.stats.total_alarms")}</CardTitle>
            <CardDescription>{t("trend_by_location.stats.total_alarms_help")}</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{summary.alarms}</CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            {t("trend_by_location.table_title")}
          </CardTitle>
          <CardDescription>{t("trend_by_location.table_description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TriangleAlert className="h-3.5 w-3.5 text-warning" />
            <span>{t("trend_by_location.table_hint")}</span>
          </div>
          <TanStackTable
            columns={columns}
            data={rows}
            maxHeight="calc(100dvh - 25rem)"
            searchField={["locationName", "siteName", "groups"]}
            searchPlaceholder={t("trend_by_location.search_placeholder")}
            emptyMessage={t("trend_by_location.empty")}
            pageSize={10}
            exportFileName="statistiques-par-lieu"
            containerClassName="border-border"
            headerClassName="!bg-foreground/90 text-white dark:!bg-muted"
            headerCellClassName="!bg-foreground/90 !text-white [&_svg]:!text-white !border-foreground/20 dark:!bg-muted dark:!border-border"
            bodyClassName="[&_tr:nth-child(odd)]:bg-card [&_tr:nth-child(even)]:bg-muted/40 dark:[&_tr:nth-child(odd)]:bg-muted/30 dark:[&_tr:nth-child(even)]:bg-background"
            tableClassName="text-foreground dark:text-card-foreground"
            toolbarClassName="rounded-lg border border-border bg-card px-3 py-2 shadow-sm"
          />
        </CardContent>
      </Card>

        {canManageReport ? (
          <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("trend_by_location.admin.title")}</CardTitle>
            <CardDescription>{t("trend_by_location.admin.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("trend_by_location.admin.recipients")}</Label>
                <Input
                  value={config.recipients}
                  onChange={(e) => updateConfig("recipients", e.target.value)}
                  placeholder={t("trend_by_location.admin.recipients_placeholder")}
                  disabled={isLoadingConfig}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t("trend_by_location.admin.day_of_month")}</Label>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={config.dayOfMonth}
                    onChange={(e) => updateConfig("dayOfMonth", Number(e.target.value))}
                    disabled={isLoadingConfig}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("trend_by_location.admin.hour_local")}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={23}
                    value={config.hourLocal}
                    onChange={(e) => updateConfig("hourLocal", Number(e.target.value))}
                    disabled={isLoadingConfig}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-medium">{t("trend_by_location.admin.enable_report")}</p>
                <p className="text-xs text-muted-foreground">{t("trend_by_location.admin.enable_report_help")}</p>
              </div>
              <Switch
                checked={config.enabled}
                onCheckedChange={(checked) => updateConfig("enabled", checked)}
                disabled={isLoadingConfig}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {TOGGLE_FIELDS.map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-md border border-border p-2.5">
                  <span className="text-sm">{t(item.labelKey)}</span>
                  <Switch
                    checked={Boolean(config[item.key])}
                    onCheckedChange={(checked) => updateBooleanConfig(item.key, checked)}
                    disabled={isLoadingConfig}
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={saveConfig} disabled={isSavingConfig || isLoadingConfig}>
                {isSavingConfig ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {t("trend_by_location.admin.save")}
              </Button>
              <Button variant="outline" onClick={sendNow} disabled={isSendingNow || isLoadingConfig}>
                {isSendingNow ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                {t("trend_by_location.admin.send_now")}
              </Button>
            </div>
          </CardContent>
          </Card>
        ) : null}
      </main>
    </div>
  )
}
