"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter, useSearchParams } from "next/navigation"
import type { SortingState, Updater } from "@tanstack/react-table"
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
} from "chart.js"
import { AlertTriangle, ChevronLeft, Clock3, LocateFixed, Maximize2, Minimize2 } from "lucide-react"
import { AlarmAcknowledgeDialog, type AcknowledgeDialogAlarm } from "@/components/alarm-acknowledge-dialog"
import { alarmsApi } from "@/lib/api"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import { MonitoringAuditTab } from "@/components/monitoring-details/monitoring-audit-tab"
import { MonitoringGraphTab } from "@/components/monitoring-details/monitoring-graph-tab"
import { MonitoringTableTab } from "@/components/monitoring-details/monitoring-table-tab"
import type { DateRangeValue, ZoomBounds } from "@/components/monitoring-details/types"
import { useMonitoringAuditLogs } from "@/components/monitoring-details/use-monitoring-audit-logs"
import { useMonitoringRangeMeasurements } from "@/components/monitoring-details/use-monitoring-range-measurements"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLieuMeasurementsPaged } from "@/hooks/useLieuMeasurementsPaged"
import { formatDbDateTime, parseDbDateTime } from "@/lib/date-display"
import { getMeasureSummary, calculateYDomain, formatMeasureValue, sortMeasuresChronologically } from "@/lib/measurements"
import type { MeasureData } from "@/lib/measurements"
import { cn } from "@/lib/utils"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend, Filler)

type AlarmListItem = {
  id: number
  locationId: number
  locationName: string
  sensorName: string
  type: "high" | "low" | "no-response" | "sector" | "module" | "temperature" | "ended"
  status: "active" | "resolved" | "acknowledged"
  timestamp: string | null
  resolvedAt: string | null
  currentValue: number | null
  unit: string | null
  minThreshold: number | null
  maxThreshold: number | null
}

type AlarmDetailPayload = {
  id: number
  locationId: number | null
  locationName: string | null
  sensorName: string | null
  type?: "high" | "low" | "no-response" | "sector" | "module" | "ended"
  currentValue?: number | null
  value?: number | null
  unit?: string | null
  minThreshold?: number | null
  maxThreshold?: number | null
  triggeredAt?: string | null
  endedAt?: string | null
}

type GuidePositions = {
  sup: number | null
  inf: number | null
  consigne: number | null
  preSup: number | null
  preInf: number | null
}

function formatAlarmNumber(value: number | null | undefined, locale: string) {
  if (value == null || !Number.isFinite(value)) return "-"
  return formatMeasureValue(value, null, locale === "fr" ? "fr-FR" : locale)
}

function getTypeLabel(t: (key: string) => string, type?: AlarmListItem["type"] | AlarmDetailPayload["type"]) {
  switch (type) {
    case "high":
      return t("dialog.type_high")
    case "low":
      return t("dialog.type_low")
    case "no-response":
      return t("dialog.type_no_response")
    case "module":
      return t("dialog.type_module")
    case "sector":
      return t("dialog.type_sector")
    case "ended":
      return t("dialog.type_other")
    default:
      return t("dialog.type_other")
  }
}

let isChartZoomPluginRegistered = false

export function AlarmAnalysisClient() {
  const t = useTranslations("alarmsPage")
  const tMonitoring = useTranslations("monitoringDetailsModal")
  const locale = useLocale()
  const localeTag = locale === "fr" ? "fr-FR" : locale
  const router = useRouter()
  const searchParams = useSearchParams()
  const chartRef = useRef<ChartJS<"line"> | null>(null)

  const locationId = Number(searchParams.get("locationId") ?? "0")
  const initialAlarmId = Number(searchParams.get("alarmId") ?? "0")
  const [alarms, setAlarms] = useState<AlarmListItem[]>([])
  const [isLoadingAlarms, setIsLoadingAlarms] = useState(false)
  const [selectedAlarmId, setSelectedAlarmId] = useState<number | null>(Number.isFinite(initialAlarmId) && initialAlarmId > 0 ? initialAlarmId : null)
  const [selectedAlarmDetail, setSelectedAlarmDetail] = useState<AlarmDetailPayload | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [dateRange, setDateRange] = useState<DateRangeValue | null>(null)
  const [activeTab, setActiveTab] = useState<"graph" | "table" | "audit">("graph")
  const [detailsSize, setDetailsSize] = useState<"standard" | "expanded">("standard")
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 500 })
  const [tableSorting, setTableSorting] = useState<SortingState>([])
  const [zoomBounds, setZoomBounds] = useState<ZoomBounds | null>(null)
  const [guidePositions, setGuidePositions] = useState<GuidePositions>({ sup: null, inf: null, consigne: null, preSup: null, preInf: null })
  const [showGraphAudits, setShowGraphAudits] = useState(false)
  const [isAcknowledgeOpen, setIsAcknowledgeOpen] = useState(false)
  const [isAcknowledgePending, setIsAcknowledgePending] = useState(false)
  const tabContentMaxHeight =
    detailsSize === "expanded" || activeTab === "audit"
      ? "calc(100vh - 18rem)"
      : "calc(100vh - 26rem)"

  useEffect(() => {
    if (isChartZoomPluginRegistered) return
    let cancelled = false
    import("chartjs-plugin-zoom")
      .then((mod) => {
        if (cancelled || isChartZoomPluginRegistered) return
        ChartJS.register(mod.default)
        isChartZoomPluginRegistered = true
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!Number.isFinite(locationId) || locationId <= 0) return
    let active = true
    setIsLoadingAlarms(true)
    fetch(`/api/alarmes?locationId=${encodeURIComponent(String(locationId))}&limit=200`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!active) return
        const rows = Array.isArray(payload?.data?.data) ? (payload.data.data as AlarmListItem[]) : []
        const next = rows.filter((row) => row.status !== "acknowledged")
        setAlarms(next)
        if (next.length === 0) {
          setSelectedAlarmId(null)
          return
        }
        const preferred = next.some((row) => row.id === initialAlarmId) ? initialAlarmId : next[0].id
        setSelectedAlarmId((current) => (current && next.some((row) => row.id === current) ? current : preferred))
      })
      .catch(() => {
        if (!active) return
        setAlarms([])
        setSelectedAlarmId(null)
      })
      .finally(() => {
        if (active) setIsLoadingAlarms(false)
      })
    return () => {
      active = false
    }
  }, [initialAlarmId, locationId])

  useEffect(() => {
    if (!selectedAlarmId) return
    let active = true
    setIsLoadingDetail(true)
    fetch(`/api/alarmes/${selectedAlarmId}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!active) return
        setSelectedAlarmDetail(payload?.data ?? null)
      })
      .catch(() => {
        if (!active) return
        setSelectedAlarmDetail(null)
      })
      .finally(() => {
        if (active) setIsLoadingDetail(false)
      })
    return () => {
      active = false
    }
  }, [selectedAlarmId])

  useEffect(() => {
    if (!selectedAlarmDetail?.triggeredAt) return
    const start = parseDbDateTime(selectedAlarmDetail.triggeredAt)
    const end = selectedAlarmDetail.endedAt ? parseDbDateTime(selectedAlarmDetail.endedAt) : new Date()
    if (!start || !end) return
    setDateRange({
      from: new Date(start.getTime() - 60 * 60 * 1000),
      to: new Date(end.getTime() + 60 * 60 * 1000),
    })
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    setActiveTab("graph")
    setZoomBounds(null)
  }, [selectedAlarmDetail?.endedAt, selectedAlarmDetail?.triggeredAt, selectedAlarmId])

  const explicitRangeStart = dateRange?.from ?? null
  const explicitRangeEnd = useMemo(() => {
    if (!dateRange?.to && !dateRange?.from) return null
    const end = new Date(dateRange?.to ?? dateRange!.from)
    end.setHours(23, 59, 59, 999)
    return end
  }, [dateRange])

  const { data: graphData = [], isLoading: isGraphLoading } = useMonitoringRangeMeasurements(locationId, {
    enabled: locationId > 0 && !!explicitRangeStart && !!explicitRangeEnd,
    rangeStart: explicitRangeStart,
    rangeEnd: explicitRangeEnd,
    includeNullNonResponse: true,
  })

  const measurementSortBy = tableSorting[0]?.id === "value" ? "value" : tableSorting[0]?.id === "date" ? "date" : null
  const measurementSortDirection =
    tableSorting[0]?.desc === true ? "desc" : tableSorting[0] ? "asc" : null

  const { data: historyData = [], isLoading: isHistoryLoading, totalRows, pageCount } = useLieuMeasurementsPaged(locationId, {
    enabled: locationId > 0 && !!explicitRangeStart && !!explicitRangeEnd,
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    startDate: explicitRangeStart,
    endDate: explicitRangeEnd,
    includeNullNonResponse: true,
    sortBy: measurementSortBy,
    sortDirection: measurementSortDirection,
  })

  const { logs: auditLogs, isLoading: auditLoading, error: auditError } = useMonitoringAuditLogs(locationId, {
    enabled: locationId > 0 && !!explicitRangeStart && !!explicitRangeEnd && (activeTab === "audit" || (activeTab === "graph" && showGraphAudits)),
    errorMessage: tMonitoring("audit.error"),
    rangeStart: explicitRangeStart,
    rangeEnd: explicitRangeEnd,
  })

  const orderedData = useMemo(() => sortMeasuresChronologically(graphData), [graphData])
  const orderedHistoryData = useMemo(() => {
    if (measurementSortBy) return historyData
    return sortMeasuresChronologically(historyData)
  }, [historyData, measurementSortBy])

  const summary = useMemo(
    () =>
      getMeasureSummary(orderedData, {
        consigneSup: selectedAlarmDetail?.maxThreshold ?? null,
        consigneInf: selectedAlarmDetail?.minThreshold ?? null,
        consigne: null,
        unite: selectedAlarmDetail?.unit ?? "",
      }),
    [orderedData, selectedAlarmDetail?.maxThreshold, selectedAlarmDetail?.minThreshold, selectedAlarmDetail?.unit],
  )

  const measuresLabel = useMemo(() => tMonitoring("chart.measures", { unit: summary.unite }), [summary.unite, tMonitoring])
  const [yMin, yMax] = useMemo(
    () => calculateYDomain(orderedData, { consigneSup: summary.consigneSup, consigneInf: summary.consigneInf, consigne: null }),
    [orderedData, summary.consigneInf, summary.consigneSup],
  )

  const updateGuidePositions = useCallback(() => {
    const chart = chartRef.current
    const yScale = chart?.scales?.y
    if (!yScale) return
    const chartArea = chart.chartArea
    const clamp = (value: number) => (chartArea ? Math.max(chartArea.top, Math.min(chartArea.bottom, value)) : value)
    const toPosition = (value: number | null) => (value === null ? null : clamp(yScale.getPixelForValue(value)))
    setGuidePositions({
      sup: toPosition(summary.consigneSup),
      inf: toPosition(summary.consigneInf),
      consigne: null,
      preSup: null,
      preInf: null,
    })
  }, [summary.consigneInf, summary.consigneSup])

  useEffect(() => {
    const frame = requestAnimationFrame(updateGuidePositions)
    return () => cancelAnimationFrame(frame)
  }, [orderedData, updateGuidePositions, yMin, yMax])

  const captureZoomBounds = useCallback((chart: ChartJS<"line">) => {
    const xScale = chart.scales?.x
    const yScale = chart.scales?.y
    setZoomBounds({
      xMin: typeof xScale?.min === "number" ? xScale.min : undefined,
      xMax: typeof xScale?.max === "number" ? xScale.max : undefined,
      yMin: typeof yScale?.min === "number" ? yScale.min : undefined,
      yMax: typeof yScale?.max === "number" ? yScale.max : undefined,
    })
  }, [])

  const resetChartZoom = useCallback(() => {
    const chart = chartRef.current
    if (!chart) return
    chart.resetZoom()
    setZoomBounds(null)
    chart.update("none")
  }, [])

  const presentationRows = useMemo(
    () => [
      { label: tMonitoring("export.presentation.location"), value: selectedAlarmDetail?.locationName ?? "-" },
      { label: tMonitoring("export.presentation.sensor_serial"), value: selectedAlarmDetail?.sensorName ?? "-" },
      { label: tMonitoring("export.presentation.selected_range"), value: dateRange ? `${formatDbDateTime(dateRange.from, { format: "date" })} -> ${formatDbDateTime(dateRange.to ?? dateRange.from, { format: "date" })}` : "-" },
      { label: tMonitoring("export.presentation.unit"), value: summary.unite || "-" },
      { label: tMonitoring("export.presentation.upper_threshold"), value: summary.consigneSup !== null ? `${summary.consigneSup}${summary.unite}` : "-" },
      { label: tMonitoring("export.presentation.lower_threshold"), value: summary.consigneInf !== null ? `${summary.consigneInf}${summary.unite}` : "-" },
      { label: tMonitoring("export.presentation.graph_points"), value: String(orderedData.length) },
      { label: tMonitoring("export.presentation.table_measurements"), value: String(totalRows) },
      { label: tMonitoring("export.presentation.last_measure_time"), value: summary.lastDateTime || "-" },
      { label: tMonitoring("export.presentation.last_measure_value"), value: summary.lastMeasureText || "-" },
    ],
    [dateRange, orderedData.length, selectedAlarmDetail?.locationName, selectedAlarmDetail?.sensorName, summary, tMonitoring, totalRows],
  )

  const handleTableSortingChange = useCallback((updater: Updater<SortingState>) => {
    setTableSorting((prev) => (typeof updater === "function" ? updater(prev) : updater))
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [])

  const selectedAlarmRow = useMemo(
    () => alarms.find((row) => row.id === selectedAlarmId) ?? null,
    [alarms, selectedAlarmId],
  )
  const acknowledgeDialogAlarm = useMemo<AcknowledgeDialogAlarm | null>(() => {
    if (!selectedAlarmDetail || !selectedAlarmId) return null
    return {
      id: String(selectedAlarmId),
      locationId: String(selectedAlarmDetail.locationId ?? ""),
      locationName: selectedAlarmDetail.locationName ?? selectedAlarmRow?.locationName ?? "-",
      sensorName: selectedAlarmDetail.sensorName ?? selectedAlarmRow?.sensorName ?? "-",
      type: selectedAlarmDetail.type,
      currentValue: selectedAlarmDetail.currentValue ?? selectedAlarmDetail.value ?? null,
      value: selectedAlarmDetail.value ?? null,
      unit: selectedAlarmDetail.unit ?? null,
      minThreshold: selectedAlarmDetail.minThreshold ?? null,
      maxThreshold: selectedAlarmDetail.maxThreshold ?? null,
      triggeredAt: selectedAlarmDetail.triggeredAt ?? null,
      endedAt: selectedAlarmDetail.endedAt ?? null,
    }
  }, [selectedAlarmDetail, selectedAlarmId, selectedAlarmRow?.locationName, selectedAlarmRow?.sensorName])
  const datePickerKey = useMemo(() => {
    const from = dateRange?.from?.toISOString() ?? "none"
    const to = dateRange?.to?.toISOString() ?? "none"
    return `${from}-${to}`
  }, [dateRange?.from, dateRange?.to])

  const refreshAlarms = useCallback(async () => {
    if (!Number.isFinite(locationId) || locationId <= 0) return
    setIsLoadingAlarms(true)
    try {
      const res = await fetch(`/api/alarmes?locationId=${encodeURIComponent(String(locationId))}&limit=200`, { cache: "no-store" })
      const payload = res.ok ? await res.json() : null
      const rows = Array.isArray(payload?.data?.data) ? (payload.data.data as AlarmListItem[]) : []
      const next = rows.filter((row) => row.status !== "acknowledged")
      setAlarms(next)
      if (next.length === 0) {
        setSelectedAlarmId(null)
        return
      }
      if (!next.some((row) => row.id === selectedAlarmId)) {
        setSelectedAlarmId(next[0].id)
      }
    } catch {
      setAlarms([])
      setSelectedAlarmId(null)
    } finally {
      setIsLoadingAlarms(false)
    }
  }, [locationId, selectedAlarmId])

  const exportMeasurementsCsv = useCallback(() => {
    const headers = [
      tMonitoring("table.columns.date_time"),
      tMonitoring("table.columns.serial"),
      tMonitoring("table.columns.value"),
      tMonitoring("table.columns.lower_threshold"),
      tMonitoring("table.columns.upper_threshold"),
      tMonitoring("table.columns.status"),
    ]
    const rows = orderedHistoryData.map((measure) => [
      formatDbDateTime(measure.DateHeureMesure ?? null, { format: "dateTimeSeconds" }),
      selectedAlarmDetail?.sensorName ?? "",
      measure.Valeur == null ? "" : formatMeasureValue(measure.Valeur, null, localeTag),
      measure.Consigne_Inf == null ? "" : formatMeasureValue(measure.Consigne_Inf, null, localeTag),
      measure.Consigne_Sup == null ? "" : formatMeasureValue(measure.Consigne_Sup, null, localeTag),
      measure.Est_Valeur_Null ? tMonitoring("table.status.no_response") : measure.Etat_Alarme ? tMonitoring("table.status.out_of_range") : tMonitoring("table.status.ok"),
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(";"))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `analyse-alarme-${selectedAlarmId ?? "unknown"}-mesures.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [localeTag, orderedHistoryData, selectedAlarmDetail?.sensorName, selectedAlarmId, tMonitoring])

  const exportAuditCsv = useCallback(() => {
    const headers = [
      tMonitoring("audit.columns.code"),
      tMonitoring("audit.columns.label"),
      tMonitoring("audit.columns.date_time"),
      tMonitoring("audit.columns.user"),
      tMonitoring("audit.columns.details"),
    ]
    const rows = auditLogs.map((log) => [
      log.code ?? "",
      log.commentaire ?? log.label ?? "",
      formatDbDateTime(log.timestamp ?? null, { format: "dateTimeSeconds" }),
      log.user ?? "",
      log.detailsSummary ?? "",
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(";"))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `analyse-alarme-${selectedAlarmId ?? "unknown"}-audit.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [auditLogs, selectedAlarmId, tMonitoring])

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={t("analysis.title")}
        description={t("analysis.description")}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/${locale}/alarmes`)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("analysis.back")}
          </Button>
          <Button variant="outline" onClick={() => router.push(`/${locale}/surveillance`)}>
            {t("analysis.backToMonitoring")}
          </Button>
          <Button
            variant="default"
            disabled={!acknowledgeDialogAlarm || isAcknowledgePending}
            onClick={() => setIsAcknowledgeOpen(true)}
          >
            {t("analysis.acknowledge")}
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            {t("analysis.print")}
          </Button>
          <Button variant="outline" onClick={exportMeasurementsCsv} disabled={orderedHistoryData.length === 0}>
            {t("analysis.exportMeasurements")}
          </Button>
          <Button variant="outline" onClick={exportAuditCsv} disabled={auditLogs.length === 0}>
            {t("analysis.exportAudit")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setDetailsSize((current) => (current === "expanded" ? "standard" : "expanded"))}
          >
            {detailsSize === "expanded" ? <Minimize2 className="mr-2 h-4 w-4" /> : <Maximize2 className="mr-2 h-4 w-4" />}
            {detailsSize === "expanded" ? t("analysis.standardView") : t("analysis.expandedView")}
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>{t("analysis.locationAlarms")}</CardTitle>
            <CardDescription>{selectedAlarmRow?.locationName ?? t("analysis.selectAlarm")}</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            {isLoadingAlarms ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : alarms.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                {t("analysis.empty")}
              </div>
            ) : (
              <ScrollArea className="h-[72vh] pr-3">
                <div className="space-y-3">
                  {alarms.map((alarm) => {
                    const active = alarm.id === selectedAlarmId
                    const value = alarm.currentValue == null ? t("dialog.na") : `${formatAlarmNumber(alarm.currentValue, locale)} ${alarm.unit ?? ""}`.trim()
                    return (
                      <button
                        key={alarm.id}
                        type="button"
                        onClick={() => setSelectedAlarmId(alarm.id)}
                        className={cn(
                          "w-full rounded-xl border p-4 text-left transition-colors",
                          active ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-background hover:bg-muted/30",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold">#{alarm.id} - {getTypeLabel(t, alarm.type)}</p>
                            <p className="text-xs text-muted-foreground">{formatDbDateTime(alarm.timestamp, { format: "dateTimeSeconds" })}</p>
                          </div>
                          <span className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                            alarm.status === "active" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700",
                          )}>
                            {alarm.status === "active" ? t("analysis.statusActive") : t("analysis.statusResolved")}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">{t("dialog.last_value_label")}</p>
                            <p className="font-medium">{value}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{t("dialog.sensor_label")}</p>
                            <p className="font-medium">{alarm.sensorName}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("analysis.focusTitle")}</CardTitle>
              <CardDescription>{selectedAlarmDetail?.locationName ?? t("analysis.selectAlarm")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("dialog.type_label")}</p>
                <p className="text-sm font-medium">{getTypeLabel(t, selectedAlarmDetail?.type)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("dialog.last_value_label")}</p>
                <p className="text-sm font-medium">
                  {selectedAlarmDetail
                    ? `${formatAlarmNumber(selectedAlarmDetail.currentValue ?? selectedAlarmDetail.value ?? null, locale)} ${selectedAlarmDetail.unit ?? ""}`.trim()
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("dialog.start_label")}</p>
                <p className="text-sm font-medium">{formatDbDateTime(selectedAlarmDetail?.triggeredAt ?? null, { format: "dateTimeSeconds" })}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("dialog.end_label")}</p>
                <p className="text-sm font-medium">{selectedAlarmDetail?.endedAt ? formatDbDateTime(selectedAlarmDetail.endedAt, { format: "dateTimeSeconds" }) : t("dialog.end_in_progress")}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <DateRangePicker
              key={datePickerKey}
              allowEmpty
              initialDateFrom={dateRange?.from}
              initialDateTo={dateRange?.to}
              onUpdate={({ range }) => setDateRange(range?.from ? { from: range.from, to: range.to } : null)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!selectedAlarmDetail?.triggeredAt) return
                const start = parseDbDateTime(selectedAlarmDetail.triggeredAt)
                const end = selectedAlarmDetail.endedAt ? parseDbDateTime(selectedAlarmDetail.endedAt) : new Date()
                if (!start || !end) return
                setDateRange({
                  from: new Date(start.getTime() - 60 * 60 * 1000),
                  to: new Date(end.getTime() + 60 * 60 * 1000),
                })
                resetChartZoom()
              }}
            >
              <LocateFixed className="mr-2 h-4 w-4" />
              {t("analysis.refocus")}
            </Button>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(next) => setActiveTab(next as "graph" | "table" | "audit")}
            className="flex min-h-0 min-w-0 flex-1 flex-col"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="graph">{tMonitoring("tabs.graph")}</TabsTrigger>
              <TabsTrigger value="table">{tMonitoring("tabs.table")}</TabsTrigger>
              <TabsTrigger value="audit">{tMonitoring("tabs.audit")}</TabsTrigger>
            </TabsList>
            <TabsContent value="graph" className="flex min-h-0 min-w-0 flex-1 flex-col">
              <MonitoringGraphTab
                chartRef={chartRef}
                orderedData={orderedData}
                graphMeasureCount={orderedData.length}
                isRangeSelected={Boolean(dateRange?.from)}
                auditLogs={auditLogs}
                showAuditMarkers={showGraphAudits}
                onShowAuditMarkersChange={setShowGraphAudits}
                measuresLabel={measuresLabel}
                locale={locale}
                unite={summary.unite}
                consigneSup={summary.consigneSup}
                consigneInf={summary.consigneInf}
                consigne={null}
                preAlarmSup={null}
                preAlarmInf={null}
                guidePositions={guidePositions}
                yMin={yMin}
                yMax={yMax}
                zoomBounds={zoomBounds}
                resetChartZoom={resetChartZoom}
                captureZoomBounds={captureZoomBounds}
                t={tMonitoring}
                exportFileName={`analyse-alarme-${selectedAlarmId ?? "unknown"}`}
              />
            </TabsContent>
            <TabsContent value="table" className="flex min-h-0 min-w-0 flex-1 flex-col">
              <MonitoringTableTab
                tableMeasurements={orderedHistoryData}
                nomLieu={selectedAlarmDetail?.locationName ?? "-"}
                sondeNumeroSerie={selectedAlarmDetail?.sensorName ?? "-"}
                exportFileName={`analyse-alarme-${selectedAlarmId ?? "unknown"}`}
                unite={summary.unite}
                consigneSup={summary.consigneSup}
                consigneInf={summary.consigneInf}
                rangeLoading={isHistoryLoading}
                pagination={pagination}
                pageCount={pageCount}
                totalRows={totalRows}
                onPaginationChange={setPagination}
                sorting={tableSorting}
                onSortingChange={handleTableSortingChange}
                isSurveillanceActive={true}
                rangeEnabled={Boolean(dateRange?.from)}
                presentationRows={presentationRows}
                maxHeight={tabContentMaxHeight}
                t={tMonitoring}
              />
            </TabsContent>
            <TabsContent value="audit" className="flex min-h-0 min-w-0 flex-1 flex-col">
              <MonitoringAuditTab
                logs={auditLogs}
                isLoading={auditLoading || isLoadingDetail || isGraphLoading}
                error={auditError}
                maxHeight={tabContentMaxHeight}
                t={tMonitoring}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AlarmAcknowledgeDialog
        open={isAcknowledgeOpen}
        alarm={acknowledgeDialogAlarm}
        onOpenChange={setIsAcknowledgeOpen}
        isConfirming={isAcknowledgePending}
        selectionMode="single"
        onConfirm={async (alarmIds, comment, options) => {
          setIsAcknowledgePending(true)
          try {
            const results = await Promise.allSettled(
              alarmIds.map((alarmId) => alarmsApi.acknowledge(alarmId, comment || "")),
            )
            const successCount = results.filter((result) => result.status === "fulfilled").length
            if (successCount === 0) {
              throw new Error("no_acknowledgement_succeeded")
            }
            toast.success(t("toast.acknowledge_success"))
            if (options?.closeAfter !== false) {
              setIsAcknowledgeOpen(false)
            }
            await refreshAlarms()
          } catch {
            toast.error(t("toast.acknowledge_error"))
          } finally {
            setIsAcknowledgePending(false)
          }
        }}
      />
    </div>
  )
}
