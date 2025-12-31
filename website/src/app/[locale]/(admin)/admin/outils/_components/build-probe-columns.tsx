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
}

export function buildProbeColumns({
  probes,
  selectedIds,
  onToggleAll,
  onToggleOne,
}: BuildProbeColumnsParams): ColumnDef<ProbeWithSelection>[] {
  const statusConfig: Record<
    string,
    { Icon: typeof CheckCircle2; variant: BadgeProps["variant"]; label: string }
  > = {
    ok: { Icon: CheckCircle2, variant: "outline", label: "OK" },
    warning: { Icon: AlertTriangle, variant: "secondary", label: "Attention" },
    error: { Icon: Zap, variant: "destructive", label: "Erreur" },
  }

  return [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={selectedIds.length === probes.length && probes.length > 0}
          onCheckedChange={() => onToggleAll()}
          aria-label="Sélectionner toutes les sondes"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.includes(row.original.Id_Sonde)}
          onCheckedChange={(checked) => onToggleOne(row.original.Id_Sonde, checked === true)}
          aria-label={`Sélectionner ${row.original.Sonde_Numero_Serie}`}
        />
      ),
      size: 40,
    },
    {
      accessorKey: "Sonde_Numero_Serie",
      header: "Sonde",
      cell: ({ row }) => <div className="font-medium">{row.original.Sonde_Numero_Serie}</div>,
    },
    {
      accessorKey: "Module",
      header: "Module",
    },
    {
      accessorKey: "Relai_1",
      header: "Relai 1",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.Relai_1}</span>
      ),
    },
    {
      accessorKey: "Relai_2",
      header: "Relai 2",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.Relai_2}</span>
      ),
    },
    {
      accessorKey: "Relai_3",
      header: "Relai 3",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.Relai_3}</span>
      ),
    },
    {
      accessorKey: "Relai_4",
      header: "Relai 4",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.Relai_4}</span>
      ),
    },
    {
      accessorKey: "Signal_Lu",
      header: "Signal lu",
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
      header: () => <div className="text-right">Taux réponse</div>,
      cell: ({ row }) => {
        const rate = row.original.Taux_Reponse
        const color =
          rate >= 95 ? "text-green-600" : rate >= 80 ? "text-yellow-600" : "text-red-600"

        return <div className={cn("text-right font-medium", color)}>{rate.toFixed(1)}%</div>
      },
    },
  ]
}

