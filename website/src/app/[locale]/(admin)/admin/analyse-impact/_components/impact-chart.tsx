"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import annotationPlugin from "chartjs-plugin-annotation"
import type { AnnotationOptions } from "chartjs-plugin-annotation"
import { Line } from "react-chartjs-2"
import { useTranslations, useLocale } from "next-intl"
import { Loader2, ZoomOut } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { MeasureData } from "@/lib/measurements"
import type { ZoomBounds } from "@/components/monitoring-details/types"
import { formatDbDateTime } from "@/lib/date-display"
import { computeSimulatedZones } from "../lib/simulated-zones"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin,
)

export interface RealAlarm {
  Id_Alarme: number
  Date_Heure_Debut: string
  Date_Heure_Fin: string | null
  Type: string | null
}

export type { SimulatedZone } from "../lib/simulated-zones"

export interface ImpactChartProps {
  measurements: MeasureData[]
  realAlarms: RealAlarm[]
  actualSup: number | null
  actualInf: number | null
  newSup: number | null
  newInf: number | null
  unit: string
  isLoading: boolean
  alarmsLoading?: boolean
  onChartReady?: (chart: ChartJS<"line">) => void
}

let isImpactChartZoomPluginRegistered = false

function buildAnnotations(
  measurements: MeasureData[],
  realAlarms: RealAlarm[],
  actualSup: number | null,
  actualInf: number | null,
  newSup: number | null,
  newInf: number | null,
  rangeEnd: string | undefined,
): Record<string, AnnotationOptions> {
  const annotations: Record<string, AnnotationOptions> = {}

  if (actualSup !== null) {
    annotations["line-actual-sup"] = {
      type: "line",
      borderColor: "rgba(239,68,68,1)",
      borderWidth: 2,
      borderDash: [],
      yMin: actualSup,
      yMax: actualSup,
    }
  }

  if (actualInf !== null) {
    annotations["line-actual-inf"] = {
      type: "line",
      borderColor: "rgba(59,130,246,1)",
      borderWidth: 2,
      borderDash: [],
      yMin: actualInf,
      yMax: actualInf,
    }
  }

  if (newSup !== null) {
    annotations["line-new-sup"] = {
      type: "line",
      borderColor: "rgba(249,115,22,0.95)",
      borderWidth: 3,
      borderDash: [10, 6],
      yMin: newSup,
      yMax: newSup,
    }
  }

  if (newInf !== null) {
    annotations["line-new-inf"] = {
      type: "line",
      borderColor: "rgba(249,115,22,0.95)",
      borderWidth: 3,
      borderDash: [10, 6],
      yMin: newInf,
      yMax: newInf,
    }
  }

  realAlarms.forEach((alarm, i) => {
    annotations[`box-real-${i}`] = {
      type: "box",
      backgroundColor: "rgba(239,68,68,0.15)",
      borderColor: "rgba(239,68,68,0.3)",
      borderWidth: 1,
      xMin: alarm.Date_Heure_Debut,
      xMax: alarm.Date_Heure_Fin ?? rangeEnd,
    }
  })

  if (newSup !== null && newInf !== null) {
    const simZones = computeSimulatedZones(
      measurements,
      newSup,
      newInf,
      actualSup,
      actualInf,
    )
    simZones.forEach((zone, i) => {
      annotations[`box-sim-${i}`] = {
        type: "box",
        backgroundColor: "rgba(249,115,22,0.15)",
        borderColor: "rgba(249,115,22,0.3)",
        borderWidth: 1,
        xMin: zone.start,
        xMax: zone.end,
      }
    })
  }

  return annotations
}

export function ImpactChart({
  measurements,
  realAlarms,
  actualSup,
  actualInf,
  newSup,
  newInf,
  unit,
  isLoading,
  alarmsLoading = false,
  onChartReady,
}: ImpactChartProps) {
  const t = useTranslations("impactAnalysis")
  const locale = useLocale()
  const localeTag = locale.toLowerCase().startsWith("fr") ? "fr-FR" : locale

  const chartRef = useRef<ChartJS<"line"> | null>(null)
  const [zoomBounds, setZoomBounds] = useState<ZoomBounds | null>(null)

  // Register zoom plugin dynamically (same pattern as monitoring-details-modal)
  useEffect(() => {
    if (isImpactChartZoomPluginRegistered) return
    let cancelled = false
    import("chartjs-plugin-zoom")
      .then((mod) => {
        if (cancelled || isImpactChartZoomPluginRegistered) return
        ChartJS.register(mod.default)
        isImpactChartZoomPluginRegistered = true
      })
      .catch((error: unknown) => {
        console.error("Failed to load chartjs-plugin-zoom", error)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Notify parent when chart is ready
  useEffect(() => {
    if (chartRef.current && onChartReady) {
      onChartReady(chartRef.current)
    }
  })

  const captureZoomBounds = useCallback((chart: ChartJS<"line">) => {
    const xScale = chart.scales?.x
    const next: ZoomBounds = {
      xMin: typeof xScale?.min === "number" ? xScale.min : undefined,
      xMax: typeof xScale?.max === "number" ? xScale.max : undefined,
    }
    setZoomBounds((prev) => {
      if (prev?.xMin === next.xMin && prev?.xMax === next.xMax) return prev
      return next
    })
  }, [])

  const resetChartZoom = useCallback(() => {
    chartRef.current?.resetZoom()
    setZoomBounds(null)
  }, [])

  if (isLoading) {
    return (
      <Card className="mx-6 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("chart.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-120 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (measurements.length === 0) {
    return (
      <Card className="mx-6 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("chart.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
            {t("chart.noData")}
          </div>
        </CardContent>
      </Card>
    )
  }

  const labels = measurements.map((m) => m.DateHeureMesureIso ?? m.DateHeureMesure)
  const values = measurements.map((m) => m.Valeur)
  const rangeEnd = labels[labels.length - 1]

  const simZones =
    newSup !== null && newInf !== null
      ? computeSimulatedZones(measurements, newSup, newInf, actualSup, actualInf)
      : []

  const annotations = buildAnnotations(
    measurements,
    realAlarms,
    actualSup,
    actualInf,
    newSup,
    newInf,
    rangeEnd,
  )

  const pointRadius = measurements.length > 200 ? 0 : 2
  const pointHoverRadius = measurements.length > 200 ? 4 : 6
  const pointHitRadius = measurements.length > 200 ? 10 : 12

  const chartData = {
    labels,
    datasets: [
      {
        label: t("chart.measurements"),
        data: values,
        borderColor: "rgba(59,130,246,0.8)",
        backgroundColor: "rgba(59,130,246,0.1)",
        borderWidth: 1.5,
        pointRadius,
        pointHoverRadius,
        pointHitRadius,
        tension: 0.1,
        fill: false,
      },
    ],
  }

  const xScaleConfig =
    zoomBounds?.xMin !== undefined || zoomBounds?.xMax !== undefined
      ? {
          type: "category" as const,
          min: zoomBounds?.xMin,
          max: zoomBounds?.xMax,
          ticks: {
            maxTicksLimit: 8,
            maxRotation: 0,
            autoSkip: true,
            callback: (_value: unknown, index: number) => {
              const label = labels[index]
              if (!label) return ""
              return formatDbDateTime(label, {
                locale: localeTag,
                withSeconds: false,
                withYear: false,
                fallback: label,
              })
            },
          },
        }
      : {
          type: "category" as const,
          ticks: {
            maxTicksLimit: 8,
            maxRotation: 0,
            autoSkip: true,
            callback: (_value: unknown, index: number) => {
              const label = labels[index]
              if (!label) return ""
              return formatDbDateTime(label, {
                locale: localeTag,
                withSeconds: false,
                withYear: false,
                fallback: label,
              })
            },
          },
        }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      annotation: {
        annotations,
      },
      tooltip: {
        callbacks: {
          title: (items: Array<{ label?: string }>) => {
            const label = items[0]?.label
            if (!label) return ""
            return formatDbDateTime(label, {
              locale: localeTag,
              withSeconds: false,
              fallback: label,
            })
          },
          label: (context: { parsed: { y: number | null } }) => {
            const y = context.parsed.y
            if (y === null) return ""
            return `${y} ${unit}`
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
      x: xScaleConfig,
      y: {
        title: {
          display: true,
          text: unit,
        },
      },
    },
  }

  return (
    <Card className="mx-6 mb-6">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base">{t("chart.title")}</CardTitle>
        {zoomBounds !== null && (
          <Button variant="outline" size="sm" onClick={resetChartZoom} className="flex items-center gap-1.5">
            <ZoomOut className="h-4 w-4" />
            {t("chart.resetZoom")}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-120">
          <Line ref={chartRef} data={chartData} options={options} />
        </div>

        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-6 rounded-sm bg-red-500/20 border border-red-500/40 shrink-0" />
              <span className="flex items-center gap-1">
                {t("chart.legendRealAlarms", { count: realAlarms.length })}
                {alarmsLoading && realAlarms.length === 0 && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-6 rounded-sm bg-orange-500/20 border border-orange-500/40 shrink-0" />
              <span>{t("chart.legendSimAlarms", { count: simZones.length })}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-0.5 w-6 bg-red-500 shrink-0" />
              <span>{t("chart.legendActualSup")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-0.5 w-6 bg-blue-500 shrink-0" />
              <span>{t("chart.legendActualInf")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-0.5 w-6 shrink-0"
                style={{ borderTop: "2px dashed rgb(249,115,22)" }}
              />
              <span>{t("chart.legendNewThreshold")}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
