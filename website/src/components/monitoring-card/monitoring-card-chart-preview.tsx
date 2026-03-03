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
            datasets: chartDatasets,
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: true, mode: 'index', intersect: false },
            },
            scales: {
              x: { display: false },
              y: { display: false, min: yMin, max: yMax },
            },
            interaction: { mode: 'nearest', axis: 'x', intersect: false },
          }}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {consigneInf !== null ? (
          <div
            className="absolute w-full h-0.5"
            style={{
              top: `${yMax === yMin ? 0 : ((yMax - consigneInf) / (yMax - yMin)) * 100}%`,
              backgroundImage: 'repeating-linear-gradient(to right, rgba(239, 68, 68, 0.8) 0 10px, transparent 10px 16px)',
            }}
          />
        ) : null}
        {consigneSup !== null ? (
          <div
            className="absolute w-full h-0.5"
            style={{
              top: `${yMax === yMin ? 0 : ((yMax - consigneSup) / (yMax - yMin)) * 100}%`,
              backgroundImage: 'repeating-linear-gradient(to right, rgba(239, 68, 68, 0.8) 0 10px, transparent 10px 16px)',
            }}
          />
        ) : null}
        {consigne !== null ? (
          <div
            className="absolute w-full border-t border-gray-900 dark:border-white"
            style={{ top: `${yMax === yMin ? 0 : ((yMax - consigne) / (yMax - yMin)) * 100}%` }}
          />
        ) : null}
      </div>

      <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between py-2 pointer-events-none pr-1">
        {consigneSup !== null ? (
          <div className="text-[9px] font-medium text-red-600 dark:text-red-200 bg-white/90 dark:bg-gray-800/90 px-1 rounded shadow-sm whitespace-nowrap" style={{ position: 'absolute', top: `${yMax === yMin ? 0 : ((yMax - consigneSup) / (yMax - yMin)) * 100}%`, transform: 'translateY(-50%)', right: '4px' }}>
            {formattedConsigneSup || consigneSup}
            {unite}
          </div>
        ) : null}
        {consigneInf !== null ? (
          <div className="text-[9px] font-medium text-red-600 dark:text-red-200 bg-white/90 dark:bg-gray-800/90 px-1 rounded shadow-sm whitespace-nowrap" style={{ position: 'absolute', top: `${yMax === yMin ? 0 : ((yMax - consigneInf) / (yMax - yMin)) * 100}%`, transform: 'translateY(-50%)', right: '4px' }}>
            {formattedConsigneInf || consigneInf}
            {unite}
          </div>
        ) : null}
        {consigne !== null ? (
          <div className="text-[9px] font-medium text-gray-900 dark:text-white bg-white/90 dark:bg-gray-800/90 px-1 rounded shadow-sm whitespace-nowrap" style={{ position: 'absolute', top: `${yMax === yMin ? 0 : ((yMax - consigne) / (yMax - yMin)) * 100}%`, transform: 'translateY(-50%)', right: '4px' }}>
            {formattedConsigne || consigne}
            {unite}
          </div>
        ) : null}
      </div>
    </>
  )
}
