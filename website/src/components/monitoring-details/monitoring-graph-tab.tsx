import type { RefObject } from "react"

import { Button } from "@/components/ui/button"
import { Line } from "react-chartjs-2"
import type { Chart as ChartJS } from "chart.js"

import type { MeasureData } from "@/lib/measurements"
import type { ZoomBounds } from "./types"

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
  return (
    <div className="space-y-4 pt-4 h-[68vh]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">
          {t("chart.measure_count", { count: graphMeasureCount })}
        </span>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={resetChartZoom}>
            {locale === "fr" ? "Reinitialiser zoom" : "Reset zoom"}
          </Button>
        </div>
      </div>

      <div className="relative h-[60vh]">
        <Line
          ref={chartRef}
          data={{
            labels: orderedData.map((point) => point.DateHeureMesureXaxis),
            datasets: [
              ...(consigneSup !== null
                ? [{
                    label: t("chart.over_high"),
                    data: orderedData.map(() => consigneSup),
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
                    data: orderedData.map(() => consigneInf),
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
                itemSort: (a, b) => {
                  const aIsMeasure = a.dataset.label === measuresLabel
                  const bIsMeasure = b.dataset.label === measuresLabel
                  if (aIsMeasure && !bIsMeasure) return -1
                  if (!aIsMeasure && bIsMeasure) return 1
                  return 0
                },
                filter: (context) => context?.dataset?.label === measuresLabel && typeof context.dataIndex === "number",
                callbacks: {
                  title: (context) => {
                    const index = context?.[0]?.dataIndex
                    return typeof index === "number" ? orderedData[index]?.DateHeureMesure || "" : ""
                  },
                  label: (context) => {
                    const index = context?.dataIndex
                    if (typeof index !== "number") return ""
                    const measure = orderedData[index]
                    if (!measure || measure.Valeur === null) {
                      return t("table.status.no_response")
                    }
                    return t("tooltip.value", { value: measure.Valeur, unit: unite })
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
                ticks: { autoSkip: true, maxTicksLimit: 8, font: { size: 11 } },
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

        <div className="absolute inset-0 pointer-events-none">
          {preAlarmSup !== null && guidePositions.preSup !== null && (
            <>
              <div className="absolute w-full border-t border-red-500/70 border-dotted" style={{ top: `${guidePositions.preSup}px` }} />
              <div className="absolute right-4 text-[11px] font-medium text-red-500 bg-white/95 dark:bg-gray-800/95 px-2 py-1 rounded shadow-sm" style={{ top: `${guidePositions.preSup}px`, transform: "translateY(-50%)" }}>
                {locale === "fr" ? `Pre-sup: ${preAlarmSup}${unite}` : `Pre-high: ${preAlarmSup}${unite}`}
              </div>
            </>
          )}
          {consigneSup !== null && guidePositions.sup !== null && (
            <>
              <div className="absolute w-full border-t-2 border-red-500 border-dashed" style={{ top: `${guidePositions.sup}px` }} />
              <div className="absolute right-4 text-xs font-medium text-red-600 dark:text-red-400 bg-white/95 dark:bg-gray-800/95 px-2 py-1 rounded shadow-md" style={{ top: `${guidePositions.sup}px`, transform: "translateY(-50%)" }}>
                {t("guides.max", { value: consigneSup, unit: unite })}
              </div>
            </>
          )}
          {consigne !== null && guidePositions.consigne !== null && (
            <>
              <div className="absolute w-full border-t-2 border-gray-900 dark:border-white" style={{ top: `${guidePositions.consigne}px` }} />
              <div className="absolute right-4 text-xs font-medium text-gray-900 dark:text-white bg-white/95 dark:bg-gray-800/95 px-2 py-1 rounded shadow-md" style={{ top: `${guidePositions.consigne}px`, transform: "translateY(-50%)" }}>
                {t("guides.target", { value: consigne, unit: unite })}
              </div>
            </>
          )}
          {preAlarmInf !== null && guidePositions.preInf !== null && (
            <>
              <div className="absolute w-full border-t border-blue-500/70 border-dotted" style={{ top: `${guidePositions.preInf}px` }} />
              <div className="absolute right-4 text-[11px] font-medium text-blue-600 dark:text-blue-300 bg-white/95 dark:bg-gray-800/95 px-2 py-1 rounded shadow-sm" style={{ top: `${guidePositions.preInf}px`, transform: "translateY(-50%)" }}>
                {locale === "fr" ? `Pre-inf: ${preAlarmInf}${unite}` : `Pre-low: ${preAlarmInf}${unite}`}
              </div>
            </>
          )}
          {consigneInf !== null && guidePositions.inf !== null && (
            <>
              <div className="absolute w-full border-t-2 border-red-500 border-dashed" style={{ top: `${guidePositions.inf}px` }} />
              <div className="absolute right-4 text-xs font-medium text-red-600 dark:text-red-400 bg-white/95 dark:bg-gray-800/95 px-2 py-1 rounded shadow-md" style={{ top: `${guidePositions.inf}px`, transform: "translateY(-50%)" }}>
                {t("guides.min", { value: consigneInf, unit: unite })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
