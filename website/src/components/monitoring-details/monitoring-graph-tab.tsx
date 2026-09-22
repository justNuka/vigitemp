import type { RefObject } from "react"
import { useEffect, useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Line } from "react-chartjs-2"
import type { Chart as ChartJS } from "chart.js"

import { formatDbDateTime, parseDbDateTime, serializeDbDateTime } from "@/lib/date-display"
import {
  formatMeasureValue,
  formatTimeAxisLabel,
  getTimeAxisSpanMs,
  normalizeMeasureNumber,
  type MeasureData,
} from "@/lib/measurements"
import type { AuditLog, ZoomBounds } from "./types"

type GuidePositions = {
  sup: number | null
  inf: number | null
  consigne: number | null
  preSup: number | null
  preInf: number | null
}

interface MonitoringGraphTabProps {
  chartRef: RefObject<ChartJS<"line"> | null>
  orderedData: MeasureData[]
  graphMeasureCount: number
  displayedPointCount?: number
  isSampled?: boolean
  isRangeSelected: boolean
  isRollingWindow?: boolean
  auditLogs: AuditLog[]
  showAuditMarkers: boolean
  onShowAuditMarkersChange: (next: boolean) => void
  measuresLabel: string
  locale: string
  unite: string
  consigneSup: number | null
  consigneInf: number | null
  consigne: number | null
  preAlarmSup: number | null
  preAlarmInf: number | null
  guidePositions: GuidePositions
  yMin: number
  yMax: number
  xRangeStart?: Date | null
  xRangeEnd?: Date | null
  zoomBounds: ZoomBounds | null
  resetChartZoom: () => void
  captureZoomBounds: (chart: ChartJS<"line">) => void
  t: (key: string, values?: Record<string, string | number>) => string
  graphHeightClassName?: string
  exportFileName: string
  showAuditControls?: boolean
  allowImageExport?: boolean
  onChartImageReady?: (dataUrl: string) => void
}

function normalizeGuideValue(value: number | null): number | null {
  return normalizeMeasureNumber(value, 2)
}

function isMemoryMeasure(point: MeasureData) {
  return typeof point.Est_Valeur_Memoire === "number"
    ? point.Est_Valeur_Memoire !== 0
    : Boolean(point.Est_Valeur_Memoire)
}

function buildRanges(
  orderedData: MeasureData[],
  predicate: (point: MeasureData) => boolean,
): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = []
  let start = -1

  for (let index = 0; index < orderedData.length; index += 1) {
    if (predicate(orderedData[index])) {
      if (start < 0) start = index
      continue
    }

    if (start >= 0) {
      ranges.push({ start, end: index - 1 })
      start = -1
    }
  }

  if (start >= 0) {
    ranges.push({ start, end: orderedData.length - 1 })
  }

  return ranges
}

function buildMergedAxisLabels(
  orderedData: MeasureData[],
  auditLogs: AuditLog[],
  showAuditMarkers: boolean,
  rangeStart?: Date | null,
  rangeEnd?: Date | null,
) {
  const labels = new Set<string>()

  for (const point of orderedData) {
    const label = point.DateHeureMesureIso ?? point.DateHeureMesure
    if (label) labels.add(label)
  }

  if (showAuditMarkers) {
    for (const log of auditLogs) {
      if (log.timestamp) labels.add(log.timestamp)
    }
  }

  const rangeStartLabel = serializeDbDateTime(rangeStart ?? null)
  const rangeEndLabel = serializeDbDateTime(rangeEnd ?? null)
  if (rangeStartLabel) labels.add(rangeStartLabel)
  if (rangeEndLabel) labels.add(rangeEndLabel)

  return Array.from(labels)
    .filter((label) => Number.isFinite(parseDbDateTime(label)?.getTime() ?? Number.NaN))
    .sort((left, right) => {
      const leftTs = parseDbDateTime(left)?.getTime() ?? Number.NaN
      const rightTs = parseDbDateTime(right)?.getTime() ?? Number.NaN
      if (!Number.isFinite(leftTs) || !Number.isFinite(rightTs)) {
        return left.localeCompare(right)
      }
      return leftTs - rightTs
    })
}

export function MonitoringGraphTab({
  chartRef,
  orderedData,
  graphMeasureCount,
  displayedPointCount = orderedData.length,
  isSampled = false,
  isRangeSelected,
  isRollingWindow = false,
  auditLogs,
  showAuditMarkers,
  onShowAuditMarkersChange,
  measuresLabel,
  locale,
  unite,
  consigneSup,
  consigneInf,
  consigne,
  preAlarmSup,
  preAlarmInf,
  guidePositions,
  yMin,
  yMax,
  xRangeStart = null,
  xRangeEnd = null,
  zoomBounds,
  resetChartZoom,
  captureZoomBounds,
  t,
  graphHeightClassName,
  exportFileName,
  showAuditControls = true,
  allowImageExport = true,
  onChartImageReady,
}: MonitoringGraphTabProps) {
  const localeTag = locale === "fr" ? "fr-FR" : locale
  const auditMarkerLabel = t("chart.audit_markers")
  const normalizedConsigneSup = normalizeGuideValue(consigneSup)
  const normalizedConsigneInf = normalizeGuideValue(consigneInf)
  const normalizedConsigne = normalizeGuideValue(consigne)
  const normalizedPreAlarmSup = normalizeGuideValue(preAlarmSup)
  const normalizedPreAlarmInf = normalizeGuideValue(preAlarmInf)
  const formattedConsigneSup = normalizedConsigneSup === null ? null : formatMeasureValue(normalizedConsigneSup, null, localeTag)
  const formattedConsigneInf = normalizedConsigneInf === null ? null : formatMeasureValue(normalizedConsigneInf, null, localeTag)
  const formattedConsigne = normalizedConsigne === null ? null : formatMeasureValue(normalizedConsigne, null, localeTag)
  const formattedPreAlarmSup = normalizedPreAlarmSup === null ? null : formatMeasureValue(normalizedPreAlarmSup, null, localeTag)
  const formattedPreAlarmInf = normalizedPreAlarmInf === null ? null : formatMeasureValue(normalizedPreAlarmInf, null, localeTag)
  const rangeStartMs = parseDbDateTime(xRangeStart)?.getTime() ?? Number.NaN
  const rangeEndMs = parseDbDateTime(xRangeEnd)?.getTime() ?? Number.NaN
  const hasExplicitAxisRange = Number.isFinite(rangeStartMs) && Number.isFinite(rangeEndMs) && rangeEndMs > rangeStartMs
  const timeAxisSpanMs = hasExplicitAxisRange ? rangeEndMs - rangeStartMs : getTimeAxisSpanMs(orderedData)
  const memoryMeasureRanges = useMemo(
    () =>
      buildRanges(
        orderedData,
        (point) => isMemoryMeasure(point) && typeof point.Valeur === "number",
      ),
    [orderedData],
  )
  const axisLabels = useMemo(
    () => buildMergedAxisLabels(orderedData, auditLogs, showAuditMarkers, xRangeStart, xRangeEnd),
    [auditLogs, orderedData, showAuditMarkers, xRangeEnd, xRangeStart],
  )
  const axisTimestamps = useMemo(
    () => axisLabels.map((label) => parseDbDateTime(label)?.getTime() ?? Number.NaN),
    [axisLabels],
  )
  const measurementByLabel = useMemo(() => {
    const map = new Map<string, MeasureData>()
    for (const point of orderedData) {
      const label = point.DateHeureMesureIso ?? point.DateHeureMesure
      if (label) map.set(label, point)
    }
    return map
  }, [orderedData])
  const firstMeasurement = orderedData[0]
  const lastMeasurement = orderedData[orderedData.length - 1]
  const rangeStartLabel = serializeDbDateTime(xRangeStart)
  const rangeEndLabel = serializeDbDateTime(xRangeEnd)
  const guideValueForLabel = (
    label: string,
    field: "Consigne_Sup" | "Consigne_Inf" | "Consigne",
  ) => {
    const point = measurementByLabel.get(label)
    if (point) return normalizeGuideValue(point[field] ?? null)
    if (label === rangeStartLabel) return normalizeGuideValue(firstMeasurement?.[field] ?? null)
    if (label === rangeEndLabel) return normalizeGuideValue(lastMeasurement?.[field] ?? null)
    return null
  }
  const upperLine = axisLabels.map((label) => guideValueForLabel(label, "Consigne_Sup"))
  const lowerLine = axisLabels.map((label) => guideValueForLabel(label, "Consigne_Inf"))
  const targetLine = axisLabels.map((label) => guideValueForLabel(label, "Consigne"))
  const measureSeries = axisLabels.map((label) => {
    const point = measurementByLabel.get(label)
    return typeof point?.Valeur === "number" ? point.Valeur : null
  })
  const shortNoResponseConnectorDatasets = useMemo(() => {
    const ranges = buildRanges(
      orderedData,
      (point) =>
        point.Valeur === null &&
        !isMemoryMeasure(point) &&
        (typeof point.Est_Valeur_Null === "number" ? point.Est_Valeur_Null !== 0 : Boolean(point.Est_Valeur_Null)),
    )

    return ranges
      .filter((range) => range.end - range.start + 1 < 5)
      .map((range, connectorIndex) => {
        const beforeIndex = range.start - 1
        const afterIndex = range.end + 1
        const beforeValue = beforeIndex >= 0 ? orderedData[beforeIndex]?.Valeur : null
        const afterValue = afterIndex < orderedData.length ? orderedData[afterIndex]?.Valeur : null

        if (typeof beforeValue !== "number" || typeof afterValue !== "number") return null

        return {
          label: connectorIndex === 0 ? "__gap_connector__" : "",
          data: axisLabels.map((label) => {
            const beforeLabel = orderedData[beforeIndex]?.DateHeureMesureIso ?? orderedData[beforeIndex]?.DateHeureMesure
            const afterLabel = orderedData[afterIndex]?.DateHeureMesureIso ?? orderedData[afterIndex]?.DateHeureMesure
            if (label === beforeLabel) return beforeValue
            if (label === afterLabel) return afterValue
            return null
          }),
          borderColor: "#3b82f6",
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 0,
          pointHitRadius: 0,
          fill: false,
          tension: 0,
          spanGaps: true,
          order: 1,
        }
      })
      .filter((dataset): dataset is NonNullable<typeof dataset> => dataset !== null)
  }, [axisLabels, orderedData])
  const memoryRangeDatasets = useMemo(
    () =>
      memoryMeasureRanges.map((range, rangeIndex) => {
        const rangeLabels = new Set(
          orderedData
            .slice(range.start, range.end + 1)
            .map((point) => point.DateHeureMesureIso ?? point.DateHeureMesure)
            .filter((label): label is string => Boolean(label)),
        )
        return {
          label: rangeIndex === 0 ? t("table.legend.memory") : "",
          data: axisLabels.map((label) => {
            const point = measurementByLabel.get(label)
            return rangeLabels.has(label) && typeof point?.Valeur === "number" ? point.Valeur : null
          }),
          borderColor: "#d97706",
          backgroundColor: "#d97706",
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointHitRadius: 14,
          pointStyle: "circle" as const,
          pointBackgroundColor: "#d97706",
          pointBorderColor: "#fffbeb",
          pointBorderWidth: 2,
          fill: false,
          tension: 0,
          spanGaps: false,
          order: 2,
        }
      }),
    [axisLabels, measurementByLabel, memoryMeasureRanges, orderedData, t],
  )

  const { auditMarkerSeries, auditMarkerDetailsByIndex } = useMemo(() => {
    const series = Array.from({ length: axisLabels.length }, () => null as number | null)
    const detailsByIndex = new Map<number, string[]>()

    if (!showAuditMarkers || orderedData.length === 0 || auditLogs.length === 0) {
      return { auditMarkerSeries: series, auditMarkerDetailsByIndex: detailsByIndex }
    }

    const pointTimestamps = orderedData.map(
      (point) => parseDbDateTime(point.DateHeureMesureIso ?? point.DateHeureMesure)?.getTime() ?? Number.NaN,
    )
    const axisIndexByLabel = new Map(axisLabels.map((label, index) => [label, index]))

    for (const log of auditLogs) {
      if (!log.timestamp) continue
      const logTs = parseDbDateTime(log.timestamp)?.getTime() ?? Number.NaN
      if (!Number.isFinite(logTs)) continue

      let nearestIndex = -1
      let nearestDistance = Number.POSITIVE_INFINITY

      for (let i = 0; i < pointTimestamps.length; i += 1) {
        const ts = pointTimestamps[i]
        if (!Number.isFinite(ts)) continue
        const distance = Math.abs(ts - logTs)
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestIndex = i
        }
      }

      const axisIndex = axisIndexByLabel.get(log.timestamp)
      if (nearestIndex < 0 || axisIndex === undefined) continue

      const point = orderedData[nearestIndex]
      const fallbackValue = consigne ?? consigneSup ?? consigneInf ?? yMax
      const markerValue = typeof point?.Valeur === "number" ? point.Valeur : fallbackValue
      series[axisIndex] = markerValue

      const markerDetails = [
        log.label,
        log.detailsSummary,
        log.commentaireUtilisateur,
      ]
        .filter((value) => Boolean(value && value.trim()))
        .join(" - ")
      if (!markerDetails) continue

      const current = detailsByIndex.get(axisIndex) ?? []
      if (!current.includes(markerDetails)) {
        current.push(markerDetails)
      }
      detailsByIndex.set(axisIndex, current)
    }

    return { auditMarkerSeries: series, auditMarkerDetailsByIndex: detailsByIndex }
  }, [auditLogs, axisLabels, consigne, consigneInf, consigneSup, orderedData, showAuditMarkers, yMax])

  const hasAuditMarkers = useMemo(
    () => auditMarkerSeries.some((value) => value !== null),
    [auditMarkerSeries],
  )
  const hasPlottedMeasures = useMemo(
    () => orderedData.some((point) => typeof point.Valeur === "number"),
    [orderedData],
  )

  useEffect(() => {
    if (!onChartImageReady || !hasPlottedMeasures) return

    const frame = window.requestAnimationFrame(() => {
      const chart = chartRef.current
      if (!chart) return
      const image = chart.toBase64Image("image/png", 1)
      if (image) onChartImageReady(image)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [axisLabels, chartRef, hasPlottedMeasures, onChartImageReady, orderedData])

  const exportChartImage = () => {
    const chart = chartRef.current
    if (!chart) return

    const anchor = document.createElement("a")
    anchor.href = chart.toBase64Image("image/png", 1)
    anchor.download = `${exportFileName}-courbe.png`
    anchor.click()
  }

  const chartAreaLeft = chartRef.current?.chartArea?.left
  const guideLabelLeft =
    typeof chartAreaLeft === "number" && Number.isFinite(chartAreaLeft) ? chartAreaLeft + 8 : 8
  const guideLabelMaxWidth = { maxWidth: "min(18rem, calc(100vw - 4rem))" }
  const guideLabelStyle = {
    left: `${guideLabelLeft}px`,
    transform: "translateY(-50%)",
    ...guideLabelMaxWidth,
  } as const

  return (
    <div className="space-y-4 pt-4 min-h-[68vh]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">
          {isSampled
            ? t("chart.sampled_measure_count", {
                source: graphMeasureCount,
                displayed: displayedPointCount,
              })
            : t(
                isRollingWindow
                  ? "chart.rolling_measure_count"
                  : isRangeSelected
                    ? "chart.measure_count"
                    : "chart.latest_measure_count",
                { count: graphMeasureCount },
              )}
        </span>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {memoryMeasureRanges.length > 0 ? (
            <span
              className="inline-flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              title={t("table.legend.memory_tooltip")}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-amber-600" />
              <span>{t("table.legend.memory")}</span>
            </span>
          ) : null}
          {showAuditControls ? (
            <label className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs text-muted-foreground">
              <Switch checked={showAuditMarkers} onCheckedChange={onShowAuditMarkersChange} disabled={!hasPlottedMeasures} />
              <span>{t("chart.show_audit_markers")}</span>
            </label>
          ) : null}
          <Button type="button" variant="outline" size="sm" onClick={resetChartZoom} disabled={!hasPlottedMeasures}>
            {t("chart.reset_zoom")}
          </Button>
          {allowImageExport ? (
            <Button type="button" variant="outline" size="sm" onClick={exportChartImage} disabled={!hasPlottedMeasures}>
              {t("chart.export_image")}
            </Button>
          ) : null}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{t("chart.drag_zoom_hint")}</p>

      <div className={graphHeightClassName ?? "relative h-[calc(100vh-23rem)] min-h-[60vh]"}>
        {!hasPlottedMeasures ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 text-center">
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("chart.empty_title")}</p>
              <p className="text-xs text-muted-foreground">{t("chart.empty_description")}</p>
            </div>
          </div>
        ) : (
        <>
        <div className="absolute inset-0 z-10">
          <Line
            ref={chartRef}
          data={{
            labels: axisTimestamps,
            datasets: [
              ...(consigneSup !== null
                ? [{
                    label: t("chart.over_high"),
                    data: upperLine,
                    borderColor: "transparent",
                    borderWidth: 0,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    pointHitRadius: 0,
                    hoverBorderWidth: 0,
                    fill: "end" as const,
                    backgroundColor: "rgba(220, 38, 38, 0.2)",
                    order: 0,
                  }]
                : []),
              ...(consigneInf !== null
                ? [{
                    label: t("chart.over_low"),
                    data: lowerLine,
                    borderColor: "transparent",
                    borderWidth: 0,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    pointHitRadius: 0,
                    hoverBorderWidth: 0,
                    fill: "start" as const,
                    backgroundColor: "rgba(30, 64, 175, 0.2)",
                    order: 0,
                  }]
                : []),
              {
                label: t("guides.max", { value: formattedConsigneSup ?? "-", unit: unite }),
                data: upperLine,
                borderColor: "#ef4444",
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 0,
                fill: false,
                tension: 0,
                spanGaps: true,
                order: 1,
              },
              {
                label: t("guides.target", { value: formattedConsigne ?? "-", unit: unite }),
                data: targetLine,
                borderColor: "#111827",
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 0,
                fill: false,
                tension: 0,
                spanGaps: true,
                order: 1,
              },
              {
                label: t("guides.min", { value: formattedConsigneInf ?? "-", unit: unite }),
                data: lowerLine,
                borderColor: "#ef4444",
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 0,
                fill: false,
                tension: 0,
                spanGaps: true,
                order: 1,
              },
              {
                label: measuresLabel,
                data: measureSeries,
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                borderWidth: 2,
                fill: false,
                tension: 0,
                pointRadius: axisLabels.map((label) => {
                  const point = measurementByLabel.get(label)
                  return !point || isMemoryMeasure(point) ? 0 : 2
                }),
                pointHoverRadius: 4,
                pointHitRadius: 16,
                pointStyle: "circle",
                hoverBorderWidth: 0,
                pointBackgroundColor: axisLabels.map((label) => {
                  const point = measurementByLabel.get(label)
                  return !point || isMemoryMeasure(point) ? "rgba(0,0,0,0)" : "#3b82f6"
                }),
                pointBorderColor: axisLabels.map((label) => {
                  const point = measurementByLabel.get(label)
                  return !point || isMemoryMeasure(point) ? "rgba(0,0,0,0)" : "#3b82f6"
                }),
                pointBorderWidth: axisLabels.map((label) => {
                  const point = measurementByLabel.get(label)
                  return !point || isMemoryMeasure(point) ? 0 : 0
                }),
                order: 1,
              },
              ...shortNoResponseConnectorDatasets,
              ...memoryRangeDatasets,
              ...(showAuditMarkers && hasAuditMarkers
                ? [
                    {
                      label: auditMarkerLabel,
                      data: auditMarkerSeries,
                      borderColor: "transparent",
                      backgroundColor: "#7c3aed",
                      borderWidth: 0,
                      showLine: false,
                      pointRadius: 10,
                      pointHoverRadius: 12,
                      pointHitRadius: 22,
                      pointStyle: "rectRot" as const,
                      order: 3,
                    },
                  ]
                : []),
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: "top",
                labels: {
                  usePointStyle: true,
                  padding: 20,
                  font: { size: 12 },
                  filter: (legendItem) => {
                    const text = legendItem.text ?? ""
                    if (!text) return false
                    if (text === "__gap_connector__") return false
                    return ![t("chart.over_high"), t("chart.over_low")].includes(text)
                  },
                },
              },
              tooltip: {
                enabled: true,
                mode: "nearest",
                intersect: false,
                position: "nearest",
                displayColors: false,
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                padding: 12,
                titleFont: { size: 13, weight: "bold" },
                bodyFont: { size: 12 },
                filter: (context) => {
                  if (typeof context.dataIndex !== "number") return false
                  const label = context?.dataset?.label
                  const axisLabel = axisLabels[context.dataIndex]
                  const point = axisLabel ? measurementByLabel.get(axisLabel) : undefined
                  const isMemoryPoint = point ? isMemoryMeasure(point) : false
                  const isMemoryDataset =
                    context.dataset.borderColor === "#d97706" ||
                    context.dataset.backgroundColor === "#d97706"
                  if (label === measuresLabel && isMemoryPoint) return false
                  if (isMemoryDataset && isMemoryPoint) return true
                  if (label === measuresLabel) return true
                  return showAuditMarkers && label === auditMarkerLabel
                },
                callbacks: {
                  title: (context) => {
                    const index = context?.[0]?.dataIndex
                    const dateValue = typeof index === "number" ? axisLabels[index] : ""
                    return dateValue ? formatDbDateTime(dateValue, { format: "dateTimeSeconds" }) : ""
                  },
                  label: (context) => {
                    const index = context?.dataIndex
                    if (typeof index !== "number") return ""
                    const label = axisLabels[index]
                    const measure = measurementByLabel.get(label)
                    const isMemoryDataset =
                      context.dataset.borderColor === "#d97706" ||
                      context.dataset.backgroundColor === "#d97706"
                    if (context.dataset.label === auditMarkerLabel) {
                      const details = auditMarkerDetailsByIndex.get(index) ?? []
                      return t("chart.audit_marker_count", { count: details.length || 1 })
                    }
                    if (!measure || measure.Valeur === null) {
                      return t("table.status.no_response")
                    }
                    if (isMemoryDataset) {
                      return ""
                    }
                    if (context.dataset.label === measuresLabel) {
                      return t("tooltip.value", {
                        value: formatMeasureValue(measure.Valeur, measure.Nb_Decimal ?? null, localeTag),
                        unit: unite,
                      })
                    }
                    return `${context.dataset.label}`
                  },
                  afterLabel: (context) => {
                    const index = context?.dataIndex
                    if (typeof index !== "number") return []
                    const label = axisLabels[index]
                    const measure = measurementByLabel.get(label)
                    const isMemoryDataset =
                      context.dataset.borderColor === "#d97706" ||
                      context.dataset.backgroundColor === "#d97706"
                    if (isMemoryDataset) {
                      if (!measure || measure.Valeur === null) return []
                      return [
                        t("table.legend.memory"),
                        t("tooltip.value", {
                          value: formatMeasureValue(measure.Valeur, measure.Nb_Decimal ?? null, localeTag),
                          unit: unite,
                        }),
                      ]
                    }
                    return []
                  },
                  afterBody: (context) => {
                    const first = context?.[0]
                    if (!first || first.dataset.label !== auditMarkerLabel) return []
                    const index = first.dataIndex
                    const details = auditMarkerDetailsByIndex.get(index) ?? []
                    return details.slice(0, 8).map((detail) => `- ${detail}`)
                  },
                },
              },
              zoom: {
                limits: { x: { minRange: 60_000 } },
                pan: {
                  enabled: true,
                  mode: "x" as const,
                  onPanComplete: ({ chart }: { chart: ChartJS<"line"> }) => captureZoomBounds(chart),
                },
                zoom: {
                  // Drag désactivé : le glissement est réservé au pan
                  drag: { enabled: false },
                  wheel: { enabled: true },
                  pinch: { enabled: true },
                  mode: "x" as const,
                  onZoomComplete: ({ chart }: { chart: ChartJS<"line"> }) => captureZoomBounds(chart),
                },
              } as never,
            },
            scales: {
              x: {
                type: "linear",
                display: true,
                offset: false,
                bounds: "ticks",
                min: zoomBounds?.xMin ?? (hasExplicitAxisRange ? rangeStartMs : undefined),
                max: zoomBounds?.xMax ?? (hasExplicitAxisRange ? rangeEndMs : undefined),
                grid: { display: true, color: "rgba(0, 0, 0, 0.05)" },
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: timeAxisSpanMs >= 24 * 60 * 60 * 1000 ? 10 : 8,
                  maxRotation: 0,
                  minRotation: 0,
                  font: { size: 10 },
                  padding: 8,
                  callback: (value) => {
                    const timestamp = typeof value === "number" ? value : Number(value)
                    return Number.isFinite(timestamp)
                      ? formatTimeAxisLabel(new Date(timestamp), localeTag, timeAxisSpanMs)
                      : ""
                  },
                },
              },
              y: {
                display: true,
                min: zoomBounds?.yMin ?? yMin,
                max: zoomBounds?.yMax ?? yMax,
                grid: { display: true, color: "rgba(0, 0, 0, 0.1)" },
                ticks: {
                  font: { size: 11 },
                  callback: (value) => `${formatMeasureValue(Number(value), null, localeTag)}${unite}`,
                },
                title: {
                  display: true,
                  text: unite,
                  font: { size: 12, weight: "bold" },
                },
              },
            },
            interaction: {
              mode: "nearest",
              axis: "x",
              intersect: false,
            },
          }}
          />
        </div>

        <div className="absolute inset-0 z-0 pointer-events-none">
          {preAlarmSup !== null && guidePositions.preSup !== null && (
            <>
                <div className="absolute z-20 truncate text-[11px] font-medium text-red-500 bg-white/95 dark:bg-popover/95 px-2 py-1 rounded shadow-sm" style={{ top: `${guidePositions.preSup}px`, ...guideLabelStyle }} title={locale === "fr" ? `Pre-sup: ${formattedPreAlarmSup}${unite}` : `Pre-high: ${formattedPreAlarmSup}${unite}`}>
                {locale === "fr" ? `Pre-sup: ${formattedPreAlarmSup}${unite}` : `Pre-high: ${formattedPreAlarmSup}${unite}`}
              </div>
            </>
          )}
          {consigneSup !== null && guidePositions.sup !== null && (
            <>
                <div className="absolute z-20 truncate text-xs font-medium text-red-600 dark:text-red-400 bg-white/95 dark:bg-popover/95 px-2 py-1 rounded shadow-md" style={{ top: `${guidePositions.sup}px`, ...guideLabelStyle }} title={t("guides.max", { value: formattedConsigneSup ?? "-", unit: unite })}>
                {t("guides.max", { value: formattedConsigneSup ?? "-", unit: unite })}
              </div>
            </>
          )}
          {consigne !== null && guidePositions.consigne !== null && (
            <>
                <div className="absolute z-20 truncate text-xs font-medium text-gray-900 dark:text-popover-foreground bg-white/95 dark:bg-popover/95 px-2 py-1 rounded shadow-md" style={{ top: `${guidePositions.consigne}px`, ...guideLabelStyle }} title={t("guides.target", { value: formattedConsigne ?? "-", unit: unite })}>
                {t("guides.target", { value: formattedConsigne ?? "-", unit: unite })}
              </div>
            </>
          )}
          {preAlarmInf !== null && guidePositions.preInf !== null && (
            <>
                <div className="absolute z-20 truncate text-[11px] font-medium text-blue-600 dark:text-blue-300 bg-white/95 dark:bg-popover/95 px-2 py-1 rounded shadow-sm" style={{ top: `${guidePositions.preInf}px`, ...guideLabelStyle }} title={locale === "fr" ? `Pre-inf: ${formattedPreAlarmInf}${unite}` : `Pre-low: ${formattedPreAlarmInf}${unite}`}>
                {locale === "fr" ? `Pre-inf: ${formattedPreAlarmInf}${unite}` : `Pre-low: ${formattedPreAlarmInf}${unite}`}
              </div>
            </>
          )}
          {consigneInf !== null && guidePositions.inf !== null && (
            <>
                <div className="absolute z-20 truncate text-xs font-medium text-red-600 dark:text-red-400 bg-white/95 dark:bg-popover/95 px-2 py-1 rounded shadow-md" style={{ top: `${guidePositions.inf}px`, ...guideLabelStyle }} title={t("guides.min", { value: formattedConsigneInf ?? "-", unit: unite })}>
                {t("guides.min", { value: formattedConsigneInf ?? "-", unit: unite })}
              </div>
            </>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  )
}
