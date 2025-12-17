export interface ActiveAlarm {
  id: string;
  sonde: string;
  lieu: string;
  valeur: string;
  seuil: string;
  duree: string;
  statut: string;
}

export const activeAlarmsColumns = [
  {
    accessorKey: "sonde",
    header: "Sonde",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "lieu",
    header: "Lieu / Temps",
    enableSorting: true,
    enableColumnFilter: true,
    cell: (info: any) => (
      <div className="text-sm">
        <p className="font-medium">{info.row.original.lieu}</p>
        <p className="text-muted-foreground text-xs">{info.row.original.duree}</p>
      </div>
    ),
  },
  {
    accessorKey: "valeur",
    header: "Valeur",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "seuil",
    header: "Seuil",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "statut",
    header: "Statut",
    enableSorting: true,
    enableColumnFilter: true,
    cell: (info: any) => (
      <span className="px-2 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
        {info.getValue()}
      </span>
    ),
  },
];
