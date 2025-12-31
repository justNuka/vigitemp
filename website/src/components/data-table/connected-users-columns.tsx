import type { ColumnDef } from "@tanstack/react-table"

export interface ConnectedUser {
  id: string
  login: string
  nom: string
  prenom: string
  poste: string
  ip: string
}

export const connectedUsersColumns: ColumnDef<ConnectedUser>[] = [
  {
    accessorKey: "login",
    header: "Login",
    enableSorting: true,
  },
  {
    id: "nomComplet",
    header: "Nom et Prénom",
    enableSorting: true,
    cell: ({ row }) => `${row.original.prenom} ${row.original.nom}`,
  },
  {
    accessorKey: "poste",
    header: "Poste",
    enableSorting: true,
  },
  {
    accessorKey: "ip",
    header: "Adresse IP",
    enableSorting: true,
  },
]

