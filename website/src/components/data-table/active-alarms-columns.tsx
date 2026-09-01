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

type Translator = (key: string) => string

export const getActiveAlarmsColumns = (
  t: Translator,
): ColumnDef<ActiveAlarm>[] => [
  {
    accessorKey: "sonde",
    header: t("active_alarms.columns.sensor"),
    enableSorting: true,
  },
  {
    accessorKey: "lieu",
    header: t("active_alarms.columns.location_time"),
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
    header: t("active_alarms.columns.value"),
    enableSorting: true,
  },
  {
    accessorKey: "seuil",
    header: t("active_alarms.columns.threshold"),
    enableSorting: true,
  },
  {
    accessorKey: "statut",
    header: t("active_alarms.columns.status"),
    enableSorting: true,
    cell: ({ getValue }) => (
      <span className="rounded-full bg-red-100 px-2 py-1 text-sm font-medium text-red-800">
        {String(getValue() ?? "")}
      </span>
    ),
  },
]


