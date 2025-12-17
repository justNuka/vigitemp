export interface ConnectedUser {
  id: string;
  login: string;
  nom: string;
  prenom: string;
  poste: string;
  ip: string;
}

export const connectedUsersColumns = [
  {
    accessorKey: "login",
    header: "Login",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "nomComplet",
    header: "Nom et Prénom",
    enableSorting: true,
    enableColumnFilter: true,
    cell: (info: any) => `${info.row.original.prenom} ${info.row.original.nom}`,
  },
  {
    accessorKey: "poste",
    header: "Poste",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "ip",
    header: "Adresse IP",
    enableSorting: true,
    enableColumnFilter: true,
  },
];
