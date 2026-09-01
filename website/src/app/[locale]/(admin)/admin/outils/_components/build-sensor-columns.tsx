import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/number-display"

import type { SensorWithSelection } from "./sensor-types"

type BuildSensorColumnsParams = {
  sensors: SensorWithSelection[]
  selectedIds: number[]
  onToggleAll: () => void
  onToggleOne: (id: number, selected: boolean) => void
  labels: {
    headers: {
      sensor: string
      location: string
      module: string
      signal: string
      responseRate: string
    }
    aria: {
      selectAll: string
      selectOne: (serial?: string | null) => string
    }
  }
}

export function buildSensorColumns({
  sensors,
  selectedIds,
  onToggleAll,
  onToggleOne,
  labels,
}: BuildSensorColumnsParams): ColumnDef<SensorWithSelection>[] {


  return [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={selectedIds.length === sensors.length && sensors.length > 0}
          onCheckedChange={() => onToggleAll()}
          aria-label={labels.aria.selectAll}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.includes(row.original.Id_Sonde)}
          onCheckedChange={(checked) => onToggleOne(row.original.Id_Sonde, checked === true)}
          aria-label={labels.aria.selectOne(row.original.Sonde_Numero_Serie)}
        />
      ),
      size: 40,
    },
    {
      accessorKey: "Sonde_Numero_Serie",
      header: labels.headers.sensor,
      cell: ({ row }) => <div className="font-medium">{row.original.Sonde_Numero_Serie}</div>,
    },
    {
      accessorKey: "Lieu",
      header: labels.headers.location,
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.Lieu}</span>,
    },
    {
      accessorKey: "Module",
      header: labels.headers.module,
    },
    {
      accessorKey: "Signal_Lu",
      header: labels.headers.signal,
      cell: ({ row }) => {
        const value = row.original.Signal_Lu
        return value ? <span className="font-medium">{value}</span> : <span className="text-muted-foreground"> </span>
      },
    },
    {
      accessorKey: "Taux_Reponse",
      header: () => <div className="text-right">{labels.headers.responseRate}</div>,
      cell: ({ row }) => {
        const rate = row.original.Taux_Reponse
        const color =
          rate >= 95 ? "text-green-600" : rate >= 80 ? "text-yellow-600" : "text-red-600"

        return <div className={cn("text-right font-medium", color)}>{formatNumber(rate, { decimals: 1, locale: "en-US", grouping: false })}%</div>
      },
    },
  ]
}


