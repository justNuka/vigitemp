import type { ColumnDef } from "@tanstack/react-table"

export interface AcknowledgmentRecord {
  id: string
  dateHeure: string
  utilisateur: string
  action: string
  sonde?: string
  alarme?: string
}

export const acknowledgmentColumns: ColumnDef<AcknowledgmentRecord>[] = [
  {
    accessorKey: "dateHeure",
    header: "Date et Heure",
    enableSorting: true,
  },
  {
    accessorKey: "utilisateur",
    header: "Utilisateur",
    enableSorting: true,
  },
  {
    accessorKey: "action",
    header: "Action",
    enableSorting: true,
  },
  {
    accessorKey: "sonde",
    header: "Sonde",
    enableSorting: true,
    cell: ({ getValue }) => (getValue() ? String(getValue()) : "-"),
  },
  {
    accessorKey: "alarme",
    header: "Alarme",
    enableSorting: true,
    cell: ({ getValue }) => (getValue() ? String(getValue()) : "-"),
  },
]

