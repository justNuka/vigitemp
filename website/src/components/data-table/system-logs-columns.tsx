export interface SystemLog {
  id: string;
  dateHeure: string;
  utilisateur: string;
  action: string;
  details?: string;
}

export const systemLogsColumns = [
  {
    accessorKey: "dateHeure",
    header: "Date et Heure",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "utilisateur",
    header: "Utilisateur",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "action",
    header: "Action",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "details",
    header: "Détails",
    enableSorting: false,
    enableColumnFilter: true,
    cell: (info: any) => info.getValue() || "-",
  },
];
