import type { ColumnDef } from "@tanstack/react-table"

export interface BackupRecord {
  id: string
  etat: "Réussi" | "En cours" | "Échoué"
  dateHeure: string
  details?: string
}

export const backupColumns: ColumnDef<BackupRecord>[] = [
  {
    accessorKey: "etat",
    header: "État",
    enableSorting: true,
    cell: ({ getValue }) => {
      const etat = String(getValue() ?? "")
      const colorMap: Record<string, string> = {
        Réussi: "bg-green-100 text-green-800",
        "En cours": "bg-blue-100 text-blue-800",
        Échoué: "bg-red-100 text-red-800",
      }

      return (
        <span
          className={`rounded-full px-2 py-1 text-sm font-medium ${colorMap[etat] || ""}`}
        >
          {etat}
        </span>
      )
    },
  },
  {
    accessorKey: "dateHeure",
    header: "Date et Heure",
    enableSorting: true,
  },
  {
    accessorKey: "details",
    header: "Détails",
    enableSorting: false,
    cell: ({ getValue }) => (getValue() ? String(getValue()) : "-"),
  },
]

