"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter, useSearchParams } from "next/navigation"
import type { SortingState, Updater } from "@tanstack/react-table"
import { useQueryClient } from "@tanstack/react-query"
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
import { ChevronLeft, Maximize2, Minimize2 } from "lucide-react"
import { toast } from "sonner"

import { useAppAccess } from "@/components/access/app-access-provider"
import { PageHeader } from "@/components/page-header"
import { MonitoringGraphTab } from "@/components/monitoring-details/monitoring-graph-tab"
import { MonitoringTableTab } from "@/components/monitoring-details/monitoring-table-tab"
import type { ZoomBounds } from "@/components/monitoring-details/types"
import { useMonitoringRangeMeasurements } from "@/components/monitoring-details/use-monitoring-range-measurements"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLieuMeasurementsPaged } from "@/hooks/useLieuMeasurementsPaged"
import { alarmsApi } from "@/lib/api"
import { toApiUtcDateTime } from "@/lib/date-range-api"
import { formatDbDateTime, parseDbDateTime } from "@/lib/date-display"
import { exportStyledExcel } from "@/lib/excel-export"
import { fetchJson } from "@/lib/http"
import { getMeasureSummary, calculateYDomain, formatMeasureValue, sortMeasuresChronologically } from "@/lib/measurements"
import type { MeasureData } from "@/lib/measurements"
import { markAlarmAcknowledgedInPaginatedSensorsCache } from "@/lib/surveillance-cache"
import { cn } from "@/lib/utils"

import { AlarmAcknowledgementCommentDialog } from "./alarm-acknowledgement-comment-dialog"

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

type MeasurementsExportPayload = {
  measurements: MeasureData[]
  total: number
  page: number
  pageSize: number
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
  const queryClient = useQueryClient()
  const { hasPermission } = useAppAccess()
  const canAcknowledgeAlarm = hasPermission("ALARM_ACK_ACCESS")
  const chartRef = useRef<ChartJS<"line"> | null>(null)

  const locationId = Number(searchParams.get("locationId") ?? "0")
  const initialAlarmId = Number(searchParams.get("alarmId") ?? "0")
  const [alarms, setAlarms] = useState<AlarmListItem[]>([])
  const [isLoadingAlarms, setIsLoadingAlarms] = useState(false)
  const [selectedAlarmIds, setSelectedAlarmIds] = useState<number[]>(
    Number.isFinite(initialAlarmId) && initialAlarmId > 0 ? [initialAlarmId] : [],
  )
  const selectedAlarmId = selectedAlarmIds.length === 1 ? selectedAlarmIds[0] : null
  const [selectedAlarmDetail, setSelectedAlarmDetail] = useState<AlarmDetailPayload | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [activeTab, setActiveTab] = useState<"graph" | "table">("graph")
  const [detailsSize, setDetailsSize] = useState<"standard" | "expanded">("standard")
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 500 })
  const [tableSorting, setTableSorting] = useState<SortingState>([])
  const [zoomBounds, setZoomBounds] = useState<ZoomBounds | null>(null)
  const [guidePositions, setGuidePositions] = useState<GuidePositions>({ sup: null, inf: null, consigne: null, preSup: null, preInf: null })
  const [activeRangeNow, setActiveRangeNow] = useState(() => new Date())
  const [chartImageDataUrl, setChartImageDataUrl] = useState<string | null>(null)
  const [isAcknowledgeOpen, setIsAcknowledgeOpen] = useState(false)
  const [acknowledgementTargetIds, setAcknowledgementTargetIds] = useState<number[]>([])
  const [isAcknowledgePending, setIsAcknowledgePending] = useState(false)
  const [isExportingXlsx, setIsExportingXlsx] = useState(false)
  const tabContentMaxHeight =
    detailsSize === "expanded"
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
          setSelectedAlarmIds([])
          return
        }

        const preferred = next.some((row) => row.id === initialAlarmId) ? initialAlarmId : next[0].id
        setSelectedAlarmIds((current) => {
          const validSelection = current.filter((id) => next.some((row) => row.id === id))
          return validSelection.length > 0 ? validSelection : [preferred]
        })
      })
      .catch(() => {
        if (!active) return
        setAlarms([])
        setSelectedAlarmIds([])
      })
      .finally(() => {
        if (active) setIsLoadingAlarms(false)
      })

    return () => {
      active = false
    }
  }, [initialAlarmId, locationId])

  useEffect(() => {
    if (!selectedAlarmId) {
      setSelectedAlarmDetail(null)
      setIsLoadingDetail(false)
      return
    }

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
    setPagination((previous) => ({ ...previous, pageIndex: 0 }))
    setActiveTab("graph")
    setZoomBounds(null)
    setChartImageDataUrl(null)
  }, [selectedAlarmId])

  useEffect(() => {
    if (!selectedAlarmDetail?.triggeredAt || selectedAlarmDetail.endedAt) return

    setActiveRangeNow(new Date())
    const interval = window.setInterval(() => setActiveRangeNow(new Date()), 60_000)
    return () => window.clearInterval(interval)
  }, [selectedAlarmDetail?.endedAt, selectedAlarmDetail?.triggeredAt])

  const explicitRangeStart = useMemo(
    () => selectedAlarmDetail?.triggeredAt ? parseDbDateTime(selectedAlarmDetail.triggeredAt) : null,
    [selectedAlarmDetail?.triggeredAt],
  )
  const explicitRangeEnd = useMemo(
    () => selectedAlarmDetail?.endedAt
      ? parseDbDateTime(selectedAlarmDetail.endedAt)
      : selectedAlarmDetail?.triggeredAt
        ? activeRangeNow
        : null,
    [activeRangeNow, selectedAlarmDetail?.endedAt, selectedAlarmDetail?.triggeredAt],
  )

  const { data: graphData = [] } = useMonitoringRangeMeasurements(locationId, {
    enabled: locationId > 0 && !!explicitRangeStart && !!explicitRangeEnd,
    rangeStart: explicitRangeStart,
    rangeEnd: explicitRangeEnd,
    includeNullNonResponse: true,
    limitTodayRange: false,
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
      {
        label: tMonitoring("export.presentation.selected_range"),
        value: explicitRangeStart && explicitRangeEnd
          ? `${formatDbDateTime(explicitRangeStart, { format: "dateTimeSeconds" })} -> ${formatDbDateTime(explicitRangeEnd, { format: "dateTimeSeconds" })}`
          : "-",
      },
      { label: tMonitoring("export.presentation.unit"), value: summary.unite || "-" },
      { label: tMonitoring("export.presentation.upper_threshold"), value: summary.consigneSup !== null ? `${summary.consigneSup}${summary.unite}` : "-" },
      { label: tMonitoring("export.presentation.lower_threshold"), value: summary.consigneInf !== null ? `${summary.consigneInf}${summary.unite}` : "-" },
      { label: tMonitoring("export.presentation.graph_points"), value: String(orderedData.length) },
      { label: tMonitoring("export.presentation.table_measurements"), value: String(totalRows) },
      { label: tMonitoring("export.presentation.last_measure_time"), value: summary.lastDateTime || "-" },
      { label: tMonitoring("export.presentation.last_measure_value"), value: summary.lastMeasureText || "-" },
    ],
    [explicitRangeEnd, explicitRangeStart, orderedData.length, selectedAlarmDetail?.locationName, selectedAlarmDetail?.sensorName, summary, tMonitoring, totalRows],
  )

  const handleTableSortingChange = useCallback((updater: Updater<SortingState>) => {
    setTableSorting((prev) => (typeof updater === "function" ? updater(prev) : updater))
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [])

  const selectedAlarmRow = useMemo(
    () => (selectedAlarmId ? alarms.find((row) => row.id === selectedAlarmId) ?? null : null),
    [alarms, selectedAlarmId],
  )
  const selectedAlarmRows = useMemo(
    () => selectedAlarmIds
      .map((id) => alarms.find((row) => row.id === id) ?? null)
      .filter((row): row is AlarmListItem => row !== null),
    [alarms, selectedAlarmIds],
  )
  const acknowledgeableAlarms = useMemo(
    () => alarms.filter((row) => row.status !== "acknowledged"),
    [alarms],
  )
  const selectedAcknowledgeableIds = useMemo(
    () => selectedAlarmIds.filter((id) => alarms.some((row) => row.id === id && row.status !== "acknowledged")),
    [alarms, selectedAlarmIds],
  )
  const allAcknowledgeableSelected =
    acknowledgeableAlarms.length > 0 &&
    acknowledgeableAlarms.every((row) => selectedAlarmIds.includes(row.id))
  const someAcknowledgeableSelected =
    !allAcknowledgeableSelected &&
    acknowledgeableAlarms.some((row) => selectedAlarmIds.includes(row.id))

  const toggleAlarmSelection = useCallback((alarmId: number, checked: boolean) => {
    if (!canAcknowledgeAlarm) return
    setSelectedAlarmIds((current) => {
      if (checked) {
        return current.includes(alarmId) ? current : [...current, alarmId]
      }
      return current.filter((id) => id !== alarmId)
    })
  }, [canAcknowledgeAlarm])

  const selectOnlyAlarm = useCallback((alarmId: number) => {
    setSelectedAlarmIds([alarmId])
  }, [])

  const toggleAllAlarms = useCallback((checked: boolean) => {
    if (!canAcknowledgeAlarm) return
    setSelectedAlarmIds(checked ? acknowledgeableAlarms.map((row) => row.id) : [])
  }, [acknowledgeableAlarms, canAcknowledgeAlarm])

  const openAcknowledgementDialog = useCallback(() => {
    if (!canAcknowledgeAlarm || selectedAcknowledgeableIds.length === 0) return
    setAcknowledgementTargetIds(selectedAcknowledgeableIds)
    setIsAcknowledgeOpen(true)
  }, [canAcknowledgeAlarm, selectedAcknowledgeableIds])

  const handleAcknowledgementConfirm = useCallback(async (comment: string) => {
    if (acknowledgementTargetIds.length === 0) return

    setIsAcknowledgePending(true)
    try {
      const successfulIds = new Set<number>()
      for (const alarmId of acknowledgementTargetIds) {
        try {
          await alarmsApi.acknowledge(String(alarmId), comment)
          successfulIds.add(alarmId)
        } catch {
          // Keep processing the remaining alarms so a partial multi-acknowledgement
          // is reflected accurately without creating a burst of concurrent writes.
        }
      }

      if (successfulIds.size === 0) {
        throw new Error("no_acknowledgement_succeeded")
      }

      const nextAlarms = alarms.map((row) =>
        successfulIds.has(row.id) ? { ...row, status: "acknowledged" as const } : row,
      )
      setAlarms(nextAlarms)

      successfulIds.forEach((alarmId) => {
        markAlarmAcknowledgedInPaginatedSensorsCache(queryClient, alarmId)
      })
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["alarms"] }),
        queryClient.invalidateQueries({ queryKey: ["capteurs", "paginated"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "alarmes-actives"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "alarms-count"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ])

      const remainingSelection = selectedAlarmIds.filter((id) => !successfulIds.has(id))
      if (remainingSelection.length > 0) {
        setSelectedAlarmIds(remainingSelection)
      } else {
        const nextAlarm = nextAlarms.find((row) => row.status !== "acknowledged")
        setSelectedAlarmIds(nextAlarm ? [nextAlarm.id] : [])
      }

      setIsAcknowledgeOpen(false)
      setAcknowledgementTargetIds([])
      toast.success(t("toast.acknowledge_success"))

      if (successfulIds.size !== acknowledgementTargetIds.length) {
        toast.error(t("analysis.partialAcknowledgeError"))
      }
    } catch {
      toast.error(t("toast.acknowledge_error"))
    } finally {
      setIsAcknowledgePending(false)
    }
  }, [acknowledgementTargetIds, alarms, queryClient, selectedAlarmIds, t])

  const handleChartImageReady = useCallback((dataUrl: string) => {
    setChartImageDataUrl(dataUrl)
  }, [])

  const fetchAllMeasurementsForExport = useCallback(async () => {
    if (!explicitRangeStart || !explicitRangeEnd || locationId <= 0) return [] as MeasureData[]

    const pageSize = 500
    const fetchPage = (page: number) => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        source: "mesures",
        startDate: toApiUtcDateTime(explicitRangeStart),
        endDate: toApiUtcDateTime(explicitRangeEnd),
        includeNullNonResponse: "1",
      })
      return fetchJson<MeasurementsExportPayload>(`/api/mesures/${locationId}?${params.toString()}`)
    }

    const firstPage = await fetchPage(1)
    const measurements = [...(firstPage.measurements ?? [])]
    const pageCountForExport = Math.max(1, Math.ceil((firstPage.total ?? measurements.length) / pageSize))

    for (let page = 2; page <= pageCountForExport; page += 1) {
      const nextPage = await fetchPage(page)
      measurements.push(...(nextPage.measurements ?? []))
    }

    return sortMeasuresChronologically(measurements)
  }, [explicitRangeEnd, explicitRangeStart, locationId])

  const handleExportXlsx = useCallback(async () => {
    if (!selectedAlarmId || !selectedAlarmDetail || isExportingXlsx) return

    setIsExportingXlsx(true)
    try {
      const measurements = await fetchAllMeasurementsForExport()
      const imageDataUrl =
        chartImageDataUrl ??
        chartRef.current?.toBase64Image("image/png", 1) ??
        null

      await exportStyledExcel({
        fileName: `analyse-alarme-${selectedAlarmId}`,
        title: selectedAlarmDetail.locationName ?? t("analysis.focusTitle"),
        presentationSheetName: tMonitoring("table.multi_tabs.presentation_sheet"),
        dataSheetName: tMonitoring("table.multi_tabs.measurements_sheet"),
        presentationHeaders: [
          tMonitoring("table.multi_tabs.presentation_columns.label"),
          tMonitoring("table.multi_tabs.presentation_columns.value"),
        ],
        presentationRows,
        presentationImage: imageDataUrl
          ? {
              dataUrl: imageDataUrl,
              title: tMonitoring("tabs.graph"),
            }
          : null,
        dataHeaders: [
          tMonitoring("table.columns.date_time"),
          tMonitoring("table.columns.serial"),
          tMonitoring("table.columns.value"),
          tMonitoring("table.columns.lower_threshold"),
          tMonitoring("table.columns.upper_threshold"),
          tMonitoring("table.columns.status"),
        ],
        dataRows: measurements.map((measure) => [
          formatDbDateTime(measure.DateHeureMesureIso ?? measure.DateHeureMesure ?? null, { format: "dateTimeSeconds" }),
          selectedAlarmDetail.sensorName ?? "",
          measure.Valeur == null
            ? tMonitoring("table.status.no_response")
            : `${formatMeasureValue(measure.Valeur, measure.Nb_Decimal ?? null, localeTag)}${summary.unite}`,
          measure.Consigne_Inf == null ? "-" : `${formatMeasureValue(measure.Consigne_Inf, null, localeTag)}${summary.unite}`,
          measure.Consigne_Sup == null ? "-" : `${formatMeasureValue(measure.Consigne_Sup, null, localeTag)}${summary.unite}`,
          measure.Est_Valeur_Null
            ? tMonitoring("table.status.no_response")
            : measure.Etat_Alarme
              ? tMonitoring("table.status.out_of_range")
              : tMonitoring("table.status.ok"),
        ]),
      })
    } catch {
      toast.error(t("analysis.exportError"))
    } finally {
      setIsExportingXlsx(false)
    }
  }, [
    chartImageDataUrl,
    fetchAllMeasurementsForExport,
    isExportingXlsx,
    localeTag,
    presentationRows,
    selectedAlarmDetail,
    selectedAlarmId,
    summary.unite,
    t,
    tMonitoring,
  ])

  return (
    <div className="space-y-6 p-6">
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
            variant="outline"
            disabled={!selectedAlarmId || !selectedAlarmDetail || isExportingXlsx}
            onClick={() => void handleExportXlsx()}
          >
            {isExportingXlsx ? t("analysis.exportingXlsx") : t("analysis.exportXlsx")}
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
          <CardHeader className="space-y-4">
            <div>
              <CardTitle>{t("analysis.locationAlarms")}</CardTitle>
              <CardDescription>
                {alarms[0]?.locationName ?? t("analysis.selectAlarm")}
              </CardDescription>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={allAcknowledgeableSelected ? true : someAcknowledgeableSelected ? "indeterminate" : false}
                disabled={!canAcknowledgeAlarm || acknowledgeableAlarms.length === 0}
                onCheckedChange={(checked) => toggleAllAlarms(checked === true)}
              />
              <span>{t("analysis.selectAllForAcknowledgement")}</span>
            </label>
          </CardHeader>
          <CardContent className="min-w-0">
            {isLoadingAlarms ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : alarms.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                {t("analysis.empty")}
              </div>
            ) : (
              <ScrollArea className="h-[72vh] pr-3">
                <div className="space-y-3">
                  {alarms.map((alarm) => {
                    const selected = selectedAlarmIds.includes(alarm.id)
                    const acknowledged = alarm.status === "acknowledged"
                    const value = alarm.currentValue == null
                      ? t("dialog.na")
                      : `${formatAlarmNumber(alarm.currentValue, locale)} ${alarm.unit ?? ""}`.trim()

                    return (
                      <div
                        key={alarm.id}
                        role={acknowledged ? undefined : "button"}
                        tabIndex={acknowledged ? -1 : 0}
                        onClick={() => {
                          if (!acknowledged) selectOnlyAlarm(alarm.id)
                        }}
                        onKeyDown={(event) => {
                          if (acknowledged || (event.key !== "Enter" && event.key !== " ")) return
                          event.preventDefault()
                          selectOnlyAlarm(alarm.id)
                        }}
                        className={cn(
                          "w-full rounded-xl border p-4 text-left transition-colors",
                          acknowledged && "cursor-default border-border bg-muted/50 opacity-65",
                          !acknowledged && selected && "border-primary bg-primary/5 shadow-sm",
                          !acknowledged && !selected && "cursor-pointer border-border bg-background hover:bg-muted/30",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selected}
                            disabled={acknowledged || !canAcknowledgeAlarm}
                            onCheckedChange={(checked) => toggleAlarmSelection(alarm.id, checked === true)}
                            onClick={(event) => event.stopPropagation()}
                            aria-label={t("analysis.selectAlarmAria", { id: alarm.id })}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <p className="text-sm font-semibold">#{alarm.id} - {getTypeLabel(t, alarm.type)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDbDateTime(alarm.timestamp, { format: "dateTimeSeconds" })}
                                </p>
                              </div>
                              <span
                                className={cn(
                                  "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium",
                                  alarm.status === "active" && "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
                                  alarm.status === "resolved" && "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
                                  acknowledged && "bg-muted text-muted-foreground",
                                )}
                              >
                                {alarm.status === "active"
                                  ? t("analysis.statusActive")
                                  : alarm.status === "resolved"
                                    ? t("analysis.statusResolved")
                                    : t("status.acknowledged")}
                              </span>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground">{t("dialog.last_value_label")}</p>
                                <p className="font-medium">{value}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">{t("dialog.sensor_label")}</p>
                                <p className="truncate font-medium">{alarm.sensorName}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-6">
          {selectedAlarmIds.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-48 items-center justify-center p-6 text-center text-sm text-muted-foreground">
                {t("analysis.noSelection")}
              </CardContent>
            </Card>
          ) : selectedAlarmIds.length > 1 ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <div>
                  <CardTitle>{t("analysis.multipleSelectionTitle", { count: selectedAlarmRows.length })}</CardTitle>
                  <CardDescription>{t("analysis.multipleSelectionDescription")}</CardDescription>
                </div>
                <Button
                  type="button"
                  disabled={!canAcknowledgeAlarm || selectedAcknowledgeableIds.length === 0 || isAcknowledgePending}
                  onClick={openAcknowledgementDialog}
                >
                  {t("analysis.acknowledgeMany", { count: selectedAcknowledgeableIds.length })}
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedAlarmRows.map((alarm) => (
                  <div
                    key={alarm.id}
                    className="grid gap-3 rounded-xl border bg-muted/15 p-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
                  >
                    <div>
                      <p className="text-sm font-semibold">#{alarm.id} - {getTypeLabel(t, alarm.type)}</p>
                      <p className="text-xs text-muted-foreground">{alarm.sensorName}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("dialog.last_value_label")}</p>
                      <p className="text-sm font-medium">
                        {alarm.currentValue == null
                          ? t("dialog.na")
                          : `${formatAlarmNumber(alarm.currentValue, locale)} ${alarm.unit ?? ""}`.trim()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("dialog.start_label")}</p>
                      <p className="text-sm font-medium">{formatDbDateTime(alarm.timestamp, { format: "dateTimeSeconds" })}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("dialog.end_label")}</p>
                      <p className="text-sm font-medium">
                        {alarm.resolvedAt
                          ? formatDbDateTime(alarm.resolvedAt, { format: "dateTimeSeconds" })
                          : t("dialog.end_in_progress")}
                      </p>
                    </div>
                    <div className="flex items-start justify-end">
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium",
                          alarm.status === "active" && "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
                          alarm.status === "resolved" && "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
                          alarm.status === "acknowledged" && "bg-muted text-muted-foreground",
                        )}
                      >
                        {alarm.status === "active"
                          ? t("analysis.statusActive")
                          : alarm.status === "resolved"
                            ? t("analysis.statusResolved")
                            : t("status.acknowledged")}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-primary/30">
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                  <div>
                    <CardTitle>{t("analysis.focusTitle")}</CardTitle>
                    <CardDescription>{selectedAlarmDetail?.locationName ?? selectedAlarmRow?.locationName ?? t("analysis.selectAlarm")}</CardDescription>
                  </div>
                  <Button
                    type="button"
                    disabled={!canAcknowledgeAlarm || !selectedAlarmDetail || isLoadingDetail || selectedAcknowledgeableIds.length === 0 || isAcknowledgePending}
                    onClick={openAcknowledgementDialog}
                  >
                    {t("analysis.acknowledge")}
                  </Button>
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
                    <p className="text-sm font-medium">
                      {formatDbDateTime(selectedAlarmDetail?.triggeredAt ?? null, { format: "dateTimeSeconds" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("dialog.end_label")}</p>
                    <p className="text-sm font-medium">
                      {selectedAlarmDetail?.endedAt
                        ? formatDbDateTime(selectedAlarmDetail.endedAt, { format: "dateTimeSeconds" })
                        : t("dialog.end_in_progress")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Tabs
                value={activeTab}
                onValueChange={(next) => setActiveTab(next as "graph" | "table")}
                className="flex min-h-0 min-w-0 flex-1 flex-col"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="graph">{tMonitoring("tabs.graph")}</TabsTrigger>
                  <TabsTrigger value="table">{tMonitoring("tabs.table")}</TabsTrigger>
                </TabsList>
                <TabsContent value="graph" className="flex min-h-0 min-w-0 flex-1 flex-col">
                  <MonitoringGraphTab
                    chartRef={chartRef}
                    orderedData={orderedData}
                    graphMeasureCount={orderedData.length}
                    isRangeSelected
                    auditLogs={[]}
                    showAuditMarkers={false}
                    onShowAuditMarkersChange={() => {}}
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
                    showAuditControls={false}
                    allowImageExport={false}
                    onChartImageReady={handleChartImageReady}
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
                    isSurveillanceActive
                    rangeEnabled={Boolean(explicitRangeStart && explicitRangeEnd)}
                    presentationRows={presentationRows}
                    maxHeight={tabContentMaxHeight}
                    t={tMonitoring}
                    showExportActions={false}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>

      <AlarmAcknowledgementCommentDialog
        open={isAcknowledgeOpen}
        alarmCount={acknowledgementTargetIds.length}
        isConfirming={isAcknowledgePending}
        onOpenChange={(open) => {
          setIsAcknowledgeOpen(open)
          if (!open) setAcknowledgementTargetIds([])
        }}
        onConfirm={handleAcknowledgementConfirm}
      />
    </div>
  )
}
