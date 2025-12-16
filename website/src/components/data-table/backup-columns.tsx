export interface BackupRecord {
  id: string;
  etat: "Réussi" | "En cours" | "Échoué";
  dateHeure: string;
  details?: string;
}

export const backupColumns = [
  {
    accessorKey: "etat",
    header: "État",
    enableSorting: true,
    enableColumnFilter: true,
    cell: (info: any) => {
      const etat = info.getValue() as string;
      const colorMap: Record<string, string> = {
        "Réussi": "bg-green-100 text-green-800",
        "En cours": "bg-blue-100 text-blue-800",
        "Échoué": "bg-red-100 text-red-800",
      };
      return (
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${colorMap[etat] || ""}`}>
          {etat}
        </span>
      );
    },
  },
  {
    accessorKey: "dateHeure",
    header: "Date et Heure",
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
