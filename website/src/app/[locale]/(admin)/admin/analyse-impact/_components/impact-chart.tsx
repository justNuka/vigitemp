"use client"

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
import { useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"
import type { MeasureData } from "@/lib/measurements"

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

export interface ImpactChartProps {
  measurements: MeasureData[]
  realAlarms: RealAlarm[]
  actualSup: number | null
  actualInf: number | null
  newSup: number | null
  newInf: number | null
  unit: string
  isLoading: boolean
}

interface SimulatedZone {
  start: string
  end: string
}

export function computeSimulatedZones(
  measurements: MeasureData[],
  newSup: number,
  newInf: number,
  actualSup: number | null,
  actualInf: number | null,
): SimulatedZone[] {
  if (measurements.length === 0) return []

  const zones: SimulatedZone[] = []
  let zoneStart: string | null = null

  for (const m of measurements) {
    const value = m.Valeur
    if (value === null) {
      if (zoneStart !== null) {
        zones.push({ start: zoneStart, end: m.DateHeureMesureIso ?? m.DateHeureMesure })
        zoneStart = null
      }
      continue
    }

    const isOutsideNew = value > newSup || value < newInf
    const isInsideActual =
      (actualSup === null || value <= actualSup) &&
      (actualInf === null || value >= actualInf)

    const isSimulatedAlarm = isOutsideNew && isInsideActual

    if (isSimulatedAlarm) {
      if (zoneStart === null) {
        zoneStart = m.DateHeureMesureIso ?? m.DateHeureMesure
      }
    } else {
      if (zoneStart !== null) {
        zones.push({ start: zoneStart, end: m.DateHeureMesureIso ?? m.DateHeureMesure })
        zoneStart = null
      }
    }
  }

  if (zoneStart !== null && measurements.length > 0) {
    const last = measurements[measurements.length - 1]
    zones.push({
      start: zoneStart,
      end: last.DateHeureMesureIso ?? last.DateHeureMesure,
    })
  }

  return zones
}

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
      borderColor: "rgba(249,115,22,1)",
      borderWidth: 2,
      borderDash: [6, 3],
      yMin: newSup,
      yMax: newSup,
    }
  }

  if (newInf !== null) {
    annotations["line-new-inf"] = {
      type: "line",
      borderColor: "rgba(249,115,22,1)",
      borderWidth: 2,
      borderDash: [6, 3],
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
}: ImpactChartProps) {
  const t = useTranslations("impactAnalysis")

  if (isLoading) {
    return (
      <div className="px-6 pb-6">
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  if (measurements.length === 0) {
    return (
      <div className="px-6 pb-6 text-center text-muted-foreground py-12">
        {t("chart.noData")}
      </div>
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
        tension: 0.1,
        fill: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      annotation: {
        annotations,
      },
      tooltip: {
        callbacks: {
          label: (context: { parsed: { y: number | null } }) => {
            const y = context.parsed.y
            if (y === null) return ""
            return `${y} ${unit}`
          },
        },
      },
    },
    scales: {
      x: {
        type: "category" as const,
        ticks: {
          maxTicksLimit: 8,
          maxRotation: 0,
          autoSkip: true,
          callback: (_value: unknown, index: number) => {
            const label = labels[index]
            if (!label) return ""
            try {
              return new Date(label).toLocaleString("fr-FR", {
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            } catch {
              return label
            }
          },
        },
      },
      y: {
        title: {
          display: true,
          text: unit,
        },
      },
    },
  }

  return (
    <div className="px-6 pb-6 space-y-4">
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-6 rounded-sm bg-red-500/20 border border-red-500/40" />
          <span>
            {t("chart.legendRealAlarms", { count: realAlarms.length })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-6 rounded-sm bg-orange-500/20 border border-orange-500/40" />
          <span>
            {t("chart.legendSimAlarms", { count: simZones.length })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-6 bg-red-500" />
          <span>{t("chart.legendActualSup")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-6 bg-blue-500" />
          <span>{t("chart.legendActualInf")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-0.5 w-6 bg-orange-500"
            style={{ borderTop: "2px dashed rgb(249,115,22)" }}
          />
          <span>{t("chart.legendNewThreshold")}</span>
        </div>
      </div>
    </div>
  )
}
