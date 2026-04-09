import type { RefObject } from "react"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Line } from "react-chartjs-2"
import type { Chart as ChartJS } from "chart.js"

import { formatTimeAxisLabel, getTimeAxisSpanMs, type MeasureData } from "@/lib/measurements"
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
  isRangeSelected: boolean
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
  zoomBounds: ZoomBounds | null
  resetChartZoom: () => void
  captureZoomBounds: (chart: ChartJS<"line">) => void
  t: (key: string, values?: Record<string, string | number>) => string
}

export function MonitoringGraphTab({
  chartRef,
  orderedData,
  graphMeasureCount,
  isRangeSelected,
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
  zoomBounds,
  resetChartZoom,
  captureZoomBounds,
  t,
}: MonitoringGraphTabProps) {
  const localeTag = locale === "fr" ? "fr-FR" : locale
  const auditMarkerLabel = t("chart.audit_markers")
  const upperLine = orderedData.map((point) => point.Consigne_Sup)
  const lowerLine = orderedData.map((point) => point.Consigne_Inf)
  const targetLine = orderedData.map((point) => point.Consigne)
  const timeAxisSpanMs = getTimeAxisSpanMs(orderedData)
  const xAxisLabels = orderedData.map((point) => point.DateHeureMesureIso ?? point.DateHeureMesure)
  const tightRedDash = "repeating-linear-gradient(to right, rgb(239 68 68) 0 6px, transparent 6px 9px)"

  const { auditMarkerSeries, auditMarkerDetailsByIndex } = useMemo(() => {
    const series = Array.from({ length: orderedData.length }, () => null as number | null)
    const detailsByIndex = new Map<number, string[]>()

    if (!showAuditMarkers || orderedData.length === 0 || auditLogs.length === 0) {
      return { auditMarkerSeries: series, auditMarkerDetailsByIndex: detailsByIndex }
    }

    const pointTimestamps = orderedData.map((point) => Date.parse(point.DateHeureMesureIso ?? point.DateHeureMesure))

    for (const log of auditLogs) {
      if (!log.timestamp) continue
      const logTs = Date.parse(log.timestamp)
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

      if (nearestIndex < 0) continue

      const point = orderedData[nearestIndex]
      const fallbackValue = consigne ?? consigneSup ?? consigneInf ?? yMax
      const markerValue = typeof point?.Valeur === "number" ? point.Valeur : fallbackValue
      series[nearestIndex] = markerValue

      const markerDetails = [log.code, log.label].filter((value) => Boolean(value && value.trim())).join(" - ")
      if (!markerDetails) continue

      const current = detailsByIndex.get(nearestIndex) ?? []
      if (!current.includes(markerDetails)) {
        current.push(markerDetails)
      }
      detailsByIndex.set(nearestIndex, current)
    }

    return { auditMarkerSeries: series, auditMarkerDetailsByIndex: detailsByIndex }
  }, [auditLogs, consigne, consigneInf, consigneSup, orderedData, showAuditMarkers, yMax])

  const hasAuditMarkers = useMemo(
    () => auditMarkerSeries.some((value) => value !== null),
    [auditMarkerSeries],
  )

  return (
    <div className="space-y-4 pt-4 min-h-[68vh]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">
          {t("chart.measure_count", { count: graphMeasureCount })}
        </span>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs text-muted-foreground">
            <Switch checked={showAuditMarkers} onCheckedChange={onShowAuditMarkersChange} />
            <span>{t("chart.show_audit_markers")}</span>
          </label>
          <Button type="button" variant="outline" size="sm" onClick={resetChartZoom}>
            {t("chart.reset_zoom")}
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{t("chart.drag_zoom_hint")}</p>

      <div className="relative h-[calc(100vh-23rem)] min-h-[60vh]">
        <div className="absolute inset-0 z-10">
          <Line
            ref={chartRef}
          data={{
            labels: xAxisLabels,
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
                label: t("guides.max", { value: consigneSup ?? "-", unit: unite }),
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
                label: t("guides.target", { value: consigne ?? "-", unit: unite }),
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
                label: t("guides.min", { value: consigneInf ?? "-", unit: unite }),
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
                data: orderedData.map((point) => (typeof point.Valeur === "number" ? point.Valeur : null)),
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 1,
                pointHoverRadius: 6,
                pointHitRadius: 12,
                pointStyle: "circle",
                hoverBorderWidth: 2,
                pointBackgroundColor: "#3b82f6",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                order: 1,
              },
              ...(showAuditMarkers && hasAuditMarkers
                ? [
                    {
                      label: auditMarkerLabel,
                      data: auditMarkerSeries,
                      borderColor: "transparent",
                      backgroundColor: "#7c3aed",
                      borderWidth: 0,
                      showLine: false,
                      pointRadius: 4,
                      pointHoverRadius: 5,
                      pointHitRadius: 12,
                      pointStyle: "rectRot" as const,
                      order: 2,
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
                  filter: (legendItem) => ![t("chart.over_high"), t("chart.over_low")].includes(legendItem.text ?? ""),
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
                  if (label === measuresLabel) return true
                  return showAuditMarkers && label === auditMarkerLabel
                },
                callbacks: {
                  title: (context) => {
                    const index = context?.[0]?.dataIndex
                    return typeof index === "number" ? orderedData[index]?.DateHeureMesure || "" : ""
                  },
                  label: (context) => {
                    const index = context?.dataIndex
                    if (typeof index !== "number") return ""
                    const measure = orderedData[index]
                    if (context.dataset.label === auditMarkerLabel) {
                      const details = auditMarkerDetailsByIndex.get(index) ?? []
                      return t("chart.audit_marker_count", { count: details.length || 1 })
                    }
                    if (!measure || measure.Valeur === null) {
                      return t("table.status.no_response")
                    }
                    if (context.dataset.label === measuresLabel) {
                      return t("tooltip.value", { value: measure.Valeur, unit: unite })
                    }
                    return `${context.dataset.label}`
                  },
                  afterBody: (context) => {
                    const first = context?.[0]
                    if (!first || first.dataset.label !== auditMarkerLabel) return []
                    const index = first.dataIndex
                    const details = auditMarkerDetailsByIndex.get(index) ?? []
                    return details.slice(0, 5).map((detail) => `• ${detail}`)
                  },
                },
              },
              zoom: {
                limits: { x: { minRange: 10 } },
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
                display: true,
                min: zoomBounds?.xMin,
                max: zoomBounds?.xMax,
                grid: { display: true, color: "rgba(0, 0, 0, 0.05)" },
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: timeAxisSpanMs >= 24 * 60 * 60 * 1000 ? 10 : 8,
                  maxRotation: 0,
                  minRotation: 0,
                  font: { size: 11 },
                  callback: (_value, index) => {
                    const rawValue = xAxisLabels[index]
                    return rawValue ? formatTimeAxisLabel(rawValue, localeTag, timeAxisSpanMs) : ""
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
                  callback: (value) => `${value}${unite}`,
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
              <div
                className={`absolute z-0 w-full border-red-500/70 ${isRangeSelected ? "border-t-2 border-solid" : "border-t border-dotted"}`}
                style={{ top: `${guidePositions.preSup}px` }}
              />
              <div className="absolute z-20 right-4 text-[11px] font-medium text-red-500 bg-white/95 dark:bg-popover/95 px-2 py-1 rounded shadow-sm" style={{ top: `${guidePositions.preSup}px`, transform: "translateY(-50%)" }}>
                {locale === "fr" ? `Pre-sup: ${preAlarmSup}${unite}` : `Pre-high: ${preAlarmSup}${unite}`}
              </div>
            </>
          )}
          {consigneSup !== null && guidePositions.sup !== null && (
            <>
              {isRangeSelected ? (
                <div
                  className="absolute z-0 w-full border-t-2 border-red-500 border-solid"
                  style={{ top: `${guidePositions.sup}px` }}
                />
              ) : (
                <div
                  className="absolute z-0 w-full h-0.5"
                  style={{ top: `${guidePositions.sup}px`, backgroundImage: tightRedDash }}
                />
              )}
              <div className="absolute z-20 right-4 text-xs font-medium text-red-600 dark:text-red-400 bg-white/95 dark:bg-popover/95 px-2 py-1 rounded shadow-md" style={{ top: `${guidePositions.sup}px`, transform: "translateY(-50%)" }}>
                {t("guides.max", { value: consigneSup, unit: unite })}
              </div>
            </>
          )}
          {consigne !== null && guidePositions.consigne !== null && (
            <>
              <div className="absolute z-0 w-full border-t-2 border-gray-900 dark:border-white" style={{ top: `${guidePositions.consigne}px` }} />
              <div className="absolute z-20 right-4 text-xs font-medium text-gray-900 dark:text-popover-foreground bg-white/95 dark:bg-popover/95 px-2 py-1 rounded shadow-md" style={{ top: `${guidePositions.consigne}px`, transform: "translateY(-50%)" }}>
                {t("guides.target", { value: consigne, unit: unite })}
              </div>
            </>
          )}
          {preAlarmInf !== null && guidePositions.preInf !== null && (
            <>
              <div
                className={`absolute z-0 w-full border-blue-500/70 ${isRangeSelected ? "border-t-2 border-solid" : "border-t border-dotted"}`}
                style={{ top: `${guidePositions.preInf}px` }}
              />
              <div className="absolute z-20 right-4 text-[11px] font-medium text-blue-600 dark:text-blue-300 bg-white/95 dark:bg-popover/95 px-2 py-1 rounded shadow-sm" style={{ top: `${guidePositions.preInf}px`, transform: "translateY(-50%)" }}>
                {locale === "fr" ? `Pre-inf: ${preAlarmInf}${unite}` : `Pre-low: ${preAlarmInf}${unite}`}
              </div>
            </>
          )}
          {consigneInf !== null && guidePositions.inf !== null && (
            <>
              {isRangeSelected ? (
                <div
                  className="absolute z-0 w-full border-t-2 border-red-500 border-solid"
                  style={{ top: `${guidePositions.inf}px` }}
                />
              ) : (
                <div
                  className="absolute z-0 w-full h-0.5"
                  style={{ top: `${guidePositions.inf}px`, backgroundImage: tightRedDash }}
                />
              )}
              <div className="absolute z-20 right-4 text-xs font-medium text-red-600 dark:text-red-400 bg-white/95 dark:bg-popover/95 px-2 py-1 rounded shadow-md" style={{ top: `${guidePositions.inf}px`, transform: "translateY(-50%)" }}>
                {t("guides.min", { value: consigneInf, unit: unite })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
