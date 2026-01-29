"use client"

import type { ColumnDef } from "@tanstack/react-table"

export interface SystemLog {
  id: string
  dateHeure: string
  utilisateur: string
  action: string
  details?: string
}

type Translator = (key: string) => string

export const getSystemLogsColumns = (
  t: Translator,
): ColumnDef<SystemLog>[] => [
  {
    accessorKey: "dateHeure",
    header: t("system_logs.columns.date_time"),
    enableSorting: true,
    cell: ({ getValue }) => {
      const value = getValue() as string
      if (!value) return "-"
      return <span className="font-mono text-sm">{value}</span>
    },
  },
  {
    accessorKey: "utilisateur",
    header: t("system_logs.columns.user"),
    enableSorting: true,
  },
  {
    accessorKey: "action",
    header: t("system_logs.columns.action"),
    enableSorting: true,
  },
  {
    accessorKey: "details",
    header: t("system_logs.columns.details"),
    enableSorting: false,
    cell: ({ getValue }) => (getValue() ? String(getValue()) : "-"),
  },
]

