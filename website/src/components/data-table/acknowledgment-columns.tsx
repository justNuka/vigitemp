import type { ColumnDef } from "@tanstack/react-table"

export interface AcknowledgmentRecord {
  id: string
  dateHeure: string
  utilisateur: string
  action: string
  sonde?: string
  alarme?: string
}

type Translator = (key: string) => string

export const getAcknowledgmentColumns = (
  t: Translator,
): ColumnDef<AcknowledgmentRecord>[] => [
  {
    accessorKey: "dateHeure",
    header: t("acknowledgments.columns.date_time"),
    enableSorting: true,
  },
  {
    accessorKey: "utilisateur",
    header: t("acknowledgments.columns.user"),
    enableSorting: true,
  },
  {
    accessorKey: "action",
    header: t("acknowledgments.columns.action"),
    enableSorting: true,
  },
  {
    accessorKey: "sonde",
    header: t("acknowledgments.columns.sensor"),
    enableSorting: true,
    cell: ({ getValue }) => (getValue() ? String(getValue()) : "-"),
  },
  {
    accessorKey: "alarme",
    header: t("acknowledgments.columns.alarm"),
    enableSorting: true,
    cell: ({ getValue }) => (getValue() ? String(getValue()) : "-"),
  },
]


