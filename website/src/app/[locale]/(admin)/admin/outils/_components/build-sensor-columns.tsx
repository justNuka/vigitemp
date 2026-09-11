import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { formatNumber } from "@/lib/number-display"
import { cn } from "@/lib/utils"

import type { SensorTestStatus, SensorWithSelection } from "./sensor-types"

type BuildSensorColumnsParams = {
  sensors: SensorWithSelection[]
  selectedIds: number[]
  selectionDisabled?: boolean
  locale: string
  onToggleAll: () => void
  onToggleOne: (id: number, selected: boolean) => void
  labels: {
    headers: {
      sensor: string
      location: string
      module: string
      signal: string
      attempts: string
      responseRate: string
      status: string
    }
    status: Record<SensorTestStatus, string>
    aria: {
      selectAll: string
      selectOne: (serial?: string | null) => string
    }
  }
}

const statusClasses: Record<SensorTestStatus, string> = {
  idle: "border-border bg-muted text-muted-foreground",
  waiting: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  partial: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  failed: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
  "no-data": "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300",
}

export function buildSensorColumns({
  sensors,
  selectedIds,
  selectionDisabled = false,
  locale,
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
          disabled={selectionDisabled}
          onCheckedChange={() => onToggleAll()}
          aria-label={labels.aria.selectAll}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.includes(row.original.Id_Sonde)}
          disabled={selectionDisabled}
          onCheckedChange={(checked) => onToggleOne(row.original.Id_Sonde, checked === true)}
          aria-label={labels.aria.selectOne(row.original.Sonde_Numero_Serie)}
        />
      ),
      size: 40,
    },
    {
      accessorKey: "Sonde_Numero_Serie",
      header: labels.headers.sensor,
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-medium">{row.original.Sonde_Numero_Serie}</div>
          <div className="text-xs text-muted-foreground">{row.original.Famille_Sonde}</div>
        </div>
      ),
    },
    {
      accessorKey: "Lieu",
      header: labels.headers.location,
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.Lieu || "—"}</span>,
    },
    {
      accessorKey: "Module",
      header: labels.headers.module,
      cell: ({ row }) => <span className="text-sm">{row.original.Module || "—"}</span>,
    },
    {
      accessorKey: "Signal_Lu",
      header: labels.headers.signal,
      cell: ({ row }) => {
        const value = row.original.Signal_Lu
        return value
          ? <span className="font-medium tabular-nums">{value}</span>
          : <span className="text-muted-foreground">—</span>
      },
    },
    {
      id: "attempts",
      header: () => <div className="text-center">{labels.headers.attempts}</div>,
      cell: ({ row }) => (
        <div className="text-center font-medium tabular-nums">
          {row.original.Nombre_Recu}/{row.original.Nombre_Total}
        </div>
      ),
    },
    {
      accessorKey: "Taux_Reponse",
      header: () => <div className="text-right">{labels.headers.responseRate}</div>,
      cell: ({ row }) => {
        const rate = row.original.Taux_Reponse
        if (rate == null) return <div className="text-right text-muted-foreground">—</div>
        const color = rate >= 95 ? "text-emerald-600" : rate >= 80 ? "text-amber-600" : "text-red-600"
        return (
          <div className={cn("text-right font-semibold tabular-nums", color)}>
            {formatNumber(rate, { decimals: 1, locale, grouping: false })}%
          </div>
        )
      },
    },
    {
      accessorKey: "Test_Status",
      header: labels.headers.status,
      cell: ({ row }) => (
        <Badge variant="outline" className={cn("whitespace-nowrap font-medium", statusClasses[row.original.Test_Status])}>
          {labels.status[row.original.Test_Status]}
        </Badge>
      ),
    },
  ]
}
