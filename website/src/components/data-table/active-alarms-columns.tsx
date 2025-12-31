import type { ColumnDef } from "@tanstack/react-table"

export interface ActiveAlarm {
  id: string
  sonde: string
  lieu: string
  valeur: string
  seuil: string
  duree: string
  statut: string
}

export const activeAlarmsColumns: ColumnDef<ActiveAlarm>[] = [
  {
    accessorKey: "sonde",
    header: "Sonde",
    enableSorting: true,
  },
  {
    accessorKey: "lieu",
    header: "Lieu / Temps",
    enableSorting: true,
    cell: ({ row }) => (
      <div className="text-sm">
        <p className="font-medium">{row.original.lieu}</p>
        <p className="text-xs text-muted-foreground">{row.original.duree}</p>
      </div>
    ),
  },
  {
    accessorKey: "valeur",
    header: "Valeur",
    enableSorting: true,
  },
  {
    accessorKey: "seuil",
    header: "Seuil",
    enableSorting: true,
  },
  {
    accessorKey: "statut",
    header: "Statut",
    enableSorting: true,
    cell: ({ getValue }) => (
      <span className="rounded-full bg-red-100 px-2 py-1 text-sm font-medium text-red-800">
        {String(getValue() ?? "")}
      </span>
    ),
  },
]

