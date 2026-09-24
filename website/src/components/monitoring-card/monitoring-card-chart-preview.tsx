import { Line } from 'react-chartjs-2'

import { MonitoringChartLoading } from '@/components/animated-loaders/chart-loading'
import { getMeasureTimestamp, type MeasureData } from '@/lib/measurements'

interface MonitoringCardChartPreviewProps {
  isLoading: boolean
  orderedData: MeasureData[]
  chartDatasets: {
    label: string
    data: Array<number | null>
    borderColor: string
    backgroundColor: string
    borderWidth: number
    fill: boolean
    tension: number
    pointRadius: number
    pointHoverRadius: number
    order: number
  }[]
  yMin: number
  yMax: number
  consigne: number | null
  consigneSup: number | null
  consigneInf: number | null
  formattedConsigne: string
  formattedConsigneSup: string
  formattedConsigneInf: string
  unite: string
  rangeStartMs: number
  rangeEndMs: number
}

export function MonitoringCardChartPreview({
  isLoading,
  orderedData,
  chartDatasets,
  yMin,
  yMax,
  consigne,
  consigneSup,
  consigneInf,
  formattedConsigne,
  formattedConsigneSup,
  formattedConsigneInf,
  unite,
  rangeStartMs,
  rangeEndMs,
}: MonitoringCardChartPreviewProps) {
  if (isLoading) {
    return (
      <div className="h-[142px]">
        <MonitoringChartLoading />
      </div>
    )
  }

  return (
    <>
      <div className="h-[142px]">
        <Line
          data={{
            datasets: chartDatasets.map((dataset) => {
              const points = orderedData
                .map((point, index) => {
                  const timestamp = getMeasureTimestamp(point)
                  return {
                    x: timestamp,
                    y: dataset.data[index] ?? null,
                  }
                })
                .filter((point) => Number.isFinite(point.x))

              const isGuideDataset = dataset.order === 0
              if (isGuideDataset && points.length > 0) {
                const firstValue = points.find((point) => typeof point.y === "number")?.y ?? null
                const lastValue = [...points].reverse().find((point) => typeof point.y === "number")?.y ?? firstValue
                if (typeof firstValue === "number") {
                  points.unshift({ x: rangeStartMs, y: firstValue })
                }
                if (typeof lastValue === "number") {
                  points.push({ x: rangeEndMs, y: lastValue })
                }
              }

              return {
                ...dataset,
                data: points,
                borderWidth: dataset.label === "" ? 1.35 : 1,
                pointRadius: dataset.label === "" ? 1.25 : 0,
                pointHoverRadius: dataset.label === "" ? 1.25 : 0,
              }
            }),
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false },
            },
            scales: {
              x: {
                type: 'linear',
                display: false,
                min: rangeStartMs,
                max: rangeEndMs,
              },
              y: { display: false, min: yMin, max: yMax },
            },
            animation: { duration: 420, easing: 'easeOutQuart' },
            interaction: { mode: 'nearest', axis: 'x', intersect: false },
          }}
        />
      </div>

      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-2 pointer-events-none pl-1">
        {consigneSup !== null ? (
          <div className="text-[9px] font-medium text-red-600 dark:text-red-200 bg-white/92 dark:bg-popover/95 px-1 rounded shadow-sm whitespace-nowrap" style={{ position: 'absolute', top: `${yMax === yMin ? 0 : ((yMax - consigneSup) / (yMax - yMin)) * 100}%`, transform: 'translateY(-50%)', left: '4px' }}>
            {formattedConsigneSup || "-"}
            {unite}
          </div>
        ) : null}
        {consigneInf !== null ? (
          <div className="text-[9px] font-medium text-red-600 dark:text-red-200 bg-white/92 dark:bg-popover/95 px-1 rounded shadow-sm whitespace-nowrap" style={{ position: 'absolute', top: `${yMax === yMin ? 0 : ((yMax - consigneInf) / (yMax - yMin)) * 100}%`, transform: 'translateY(-50%)', left: '4px' }}>
            {formattedConsigneInf || "-"}
            {unite}
          </div>
        ) : null}
        {consigne !== null ? (
          <div className="text-[9px] font-medium text-gray-900 dark:text-popover-foreground bg-white/92 dark:bg-popover/95 px-1 rounded shadow-sm whitespace-nowrap" style={{ position: 'absolute', top: `${yMax === yMin ? 0 : ((yMax - consigne) / (yMax - yMin)) * 100}%`, transform: 'translateY(-50%)', left: '4px' }}>
            {formattedConsigne || "-"}
            {unite}
          </div>
        ) : null}
      </div>
    </>
  )
}
