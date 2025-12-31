"use client"

import type { ColumnDef } from "@tanstack/react-table"

export interface SystemLog {
  id: string
  dateHeure: string
  utilisateur: string
  action: string
  details?: string
}

export const systemLogsColumns: ColumnDef<SystemLog>[] = [
  {
    accessorKey: "dateHeure",
    header: "Date et Heure",
    enableSorting: true,
    cell: ({ getValue }) => {
      const value = getValue() as string
      if (!value) return "-"
      return <span className="font-mono text-sm">{value}</span>
    },
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
    accessorKey: "details",
    header: "Détails",
    enableSorting: false,
    cell: ({ getValue }) => (getValue() ? String(getValue()) : "-"),
  },
]

