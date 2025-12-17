export interface AcknowledgmentRecord {
  id: string;
  dateHeure: string;
  utilisateur: string;
  action: string;
  sonde?: string;
  alarme?: string;
}

export const acknowledgmentColumns = [
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
    accessorKey: "sonde",
    header: "Sonde",
    enableSorting: true,
    enableColumnFilter: true,
    cell: (info: any) => info.getValue() || "-",
  },
  {
    accessorKey: "alarme",
    header: "Alarme",
    enableSorting: true,
    enableColumnFilter: true,
    cell: (info: any) => info.getValue() || "-",
  },
];
