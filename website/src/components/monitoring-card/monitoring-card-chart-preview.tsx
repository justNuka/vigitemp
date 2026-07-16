import { Line } from 'react-chartjs-2'

import { Skeleton } from '@/components/ui/skeleton'

interface MonitoringCardChartPreviewProps {
  isLoading: boolean
  orderedData: Array<{ DateHeureMesureXaxis: string; Valeur: number | null }>
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
}: MonitoringCardChartPreviewProps) {
  if (isLoading) {
    return (
      <div className="h-32.5">
        <Skeleton className="h-full w-full rounded-md" />
      </div>
    )
  }

  return (
    <>
      <div className="h-32.5">
        <Line
          data={{
            labels: orderedData.map((point) => point.DateHeureMesureXaxis),
            datasets: chartDatasets.map((dataset) => ({
              ...dataset,
              borderWidth: dataset.label === "" ? 1.35 : 1,
              pointRadius: dataset.label === "" ? 1.25 : 0,
              pointHoverRadius: dataset.label === "" ? 1.25 : 0,
            })),
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false },
            },
            scales: {
              x: { display: false },
              y: { display: false, min: yMin, max: yMax },
            },
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
