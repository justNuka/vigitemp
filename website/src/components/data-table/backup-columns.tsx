import type { ColumnDef } from "@tanstack/react-table"

export interface BackupRecord {
  id: string
  etat: "Réussi" | "En cours" | "Échoué"
  dateHeure: string
  details?: string
}

type Translator = (key: string) => string

export const getBackupColumns = (t: Translator): ColumnDef<BackupRecord>[] => [
  {
    accessorKey: "etat",
    header: t("backups.columns.status"),
    enableSorting: true,
    cell: ({ getValue }) => {
      const etat = String(getValue() ?? "")
      const colorMap: Record<string, string> = {
        Réussi: "bg-green-100 text-green-800",
        "En cours": "bg-blue-100 text-blue-800",
        Échoué: "bg-red-100 text-red-800",
      }
      const labelMap: Record<string, string> = {
        Réussi: t("backups.status.success"),
        "En cours": t("backups.status.in_progress"),
        Échoué: t("backups.status.failed"),
      }

      return (
        <span
          className={`rounded-full px-2 py-1 text-sm font-medium ${colorMap[etat] || ""}`}
        >
          {labelMap[etat] || etat}
        </span>
      )
    },
  },
  {
    accessorKey: "dateHeure",
    header: t("backups.columns.date_time"),
    enableSorting: true,
  },
  {
    accessorKey: "details",
    header: t("backups.columns.details"),
    enableSorting: false,
    cell: ({ getValue }) => (getValue() ? String(getValue()) : "-"),
  },
]

