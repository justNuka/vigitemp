import type { ColumnDef } from "@tanstack/react-table"

export interface ConnectedUser {
  id: string
  login: string
  nom: string
  prenom: string
  poste: string
  ip: string
}

type Translator = (key: string) => string

export const getConnectedUsersColumns = (
  t: Translator,
): ColumnDef<ConnectedUser>[] => [
  {
    accessorKey: "login",
    header: t("connected_users.columns.login"),
    enableSorting: true,
  },
  {
    id: "nomComplet",
    header: t("connected_users.columns.full_name"),
    enableSorting: true,
    cell: ({ row }) => `${row.original.prenom} ${row.original.nom}`,
  },
  {
    accessorKey: "poste",
    header: t("connected_users.columns.station"),
    enableSorting: true,
  },
  {
    accessorKey: "ip",
    header: t("connected_users.columns.ip"),
    enableSorting: true,
  },
]

