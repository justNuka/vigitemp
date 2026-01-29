import type { ColumnDef } from "@tanstack/react-table"
import { AlertTriangle, CheckCircle2, Zap } from "lucide-react"

import { Badge, type BadgeProps } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

import type { ProbeWithSelection } from "./probe-types"

type BuildProbeColumnsParams = {
  probes: ProbeWithSelection[]
  selectedIds: number[]
  onToggleAll: () => void
  onToggleOne: (id: number, selected: boolean) => void
  labels: {
    status: {
      ok: string
      warning: string
      error: string
    }
    headers: {
      probe: string
      module: string
      relay1: string
      relay2: string
      relay3: string
      relay4: string
      signal: string
      responseRate: string
    }
    aria: {
      selectAll: string
      selectOne: (serial?: string | null) => string
    }
  }
}

export function buildProbeColumns({
  probes,
  selectedIds,
  onToggleAll,
  onToggleOne,
  labels,
}: BuildProbeColumnsParams): ColumnDef<ProbeWithSelection>[] {
  const statusConfig: Record<
    string,
    { Icon: typeof CheckCircle2; variant: BadgeProps["variant"]; label: string }
  > = {
    ok: { Icon: CheckCircle2, variant: "outline", label: labels.status.ok },
    warning: { Icon: AlertTriangle, variant: "secondary", label: labels.status.warning },
    error: { Icon: Zap, variant: "destructive", label: labels.status.error },
  }

  return [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={selectedIds.length === probes.length && probes.length > 0}
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
      header: labels.headers.probe,
      cell: ({ row }) => <div className="font-medium">{row.original.Sonde_Numero_Serie}</div>,
    },
    {
      accessorKey: "Module",
      header: labels.headers.module,
    },
    {
      accessorKey: "Relai_1",
      header: labels.headers.relay1,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.Relai_1}</span>
      ),
    },
    {
      accessorKey: "Relai_2",
      header: labels.headers.relay2,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.Relai_2}</span>
      ),
    },
    {
      accessorKey: "Relai_3",
      header: labels.headers.relay3,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.Relai_3}</span>
      ),
    },
    {
      accessorKey: "Relai_4",
      header: labels.headers.relay4,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.Relai_4}</span>
      ),
    },
    {
      accessorKey: "Signal_Lu",
      header: labels.headers.signal,
      cell: ({ row }) => {
        const status = row.original.Signal_Lu
        const config = statusConfig[status] ?? statusConfig.ok
        const Icon = config.Icon

        return (
          <Badge variant={config.variant} className="gap-1 whitespace-nowrap">
            <Icon className="h-4 w-4" />
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "Taux_Reponse",
      header: () => <div className="text-right">{labels.headers.responseRate}</div>,
      cell: ({ row }) => {
        const rate = row.original.Taux_Reponse
        const color =
          rate >= 95 ? "text-green-600" : rate >= 80 ? "text-yellow-600" : "text-red-600"

        return <div className={cn("text-right font-medium", color)}>{rate.toFixed(1)}%</div>
      },
    },
  ]
}

