'use client';

import { ColumnDef } from '@tanstack/react-table';
import { TanStackTable } from '@/components/data-table/tanstack-table';
import { getTypeIcon } from '@/lib/lieu-types';
import type { LocationRow } from '@/hooks/useLocations';

type LocationsTableProps = {
  locations: LocationRow[];
  isLoading: boolean;
  selectedLocationId?: number;
  onSelectLocation: (location: LocationRow) => void;
};

export function LocationsTable({
  locations,
  isLoading,
  selectedLocationId,
  onSelectLocation,
}: LocationsTableProps) {
  const columns: ColumnDef<LocationRow>[] = [
    {
      accessorKey: 'Nom_Lieu',
      header: 'Lieu',
    },
    {
      accessorKey: 'Type_Lieu',
      header: 'Type',
      cell: ({ row }) => {
        const typeValue = row.original.Type_Lieu;
        const { icon, label } = getTypeIcon(typeValue);
        return (
          <div className="flex items-center gap-2">
            {icon}
            <span>{label}</span>
          </div>
        );
      },
    },
    {
      id: 'site',
      header: 'Site',
      cell: ({ row }) => row.original.t_site?.Libelle_Site || '-',
    },
    {
      id: 'groupes',
      header: 'Groupe(s)',
      cell: ({ row }) => {
        const names = (row.original.t_lieu_groupe || [])
          .map((lg) => lg.t_groupe?.Nom_Groupe)
          .filter((n): n is string => !!n);

        const legacy = [row.original.t_groupe1?.Nom_Groupe, row.original.t_groupe2?.Nom_Groupe].filter(
          (n): n is string => !!n
        );

        const display = names.length > 0 ? names : legacy;
        return display.length > 0 ? display.join(', ') : '-';
      },
    },
    {
      accessorKey: 'Sonde_Numero_Serie',
      header: 'Sonde',
    },
    {
      accessorKey: 'Lieu_Etat',
      header: 'Etat du lieu',
      cell: ({ row }) => {
        const status = row.original.Lieu_Etat;
        if (status === 'S') return 'En surveillance';
        if (status === 'D') return 'Surveillance desactivee';
        return status || '-';
      },
    },
    {
      accessorKey: 'Consigne',
      header: 'Consigne',
      cell: ({ row }) => row.getValue('Consigne') || '-',
    },
    {
      accessorKey: 'Unite',
      header: 'Unité',
      cell: ({ row }) => row.original.Unite || '-',
    },
    {
      accessorKey: 'Frequence',
      header: 'Fréquence (mn)',
      cell: ({ row }) => (row.original.Frequence ? `${row.original.Frequence} mn` : '-'),
    },
    {
      accessorKey: 'Consigne_Sup',
      header: 'Max',
    },
    {
      accessorKey: 'Consigne_Inf',
      header: 'Min',
    },
    {
      accessorKey: 'Retard_Alarme_Haut',
      header: 'Retard alarme haut (mn)',
    },
    {
      accessorKey: 'Retard_Alarme_Bas',
      header: 'Retard alarme bas (mn)',
    },
  ];

  return (
    <TanStackTable<LocationRow>
      columns={columns}
      data={locations}
      searchPlaceholder="Rechercher les lieux..."
      pageSize={10}
      maxHeight="calc(100dvh - 25rem)"
      isLoading={isLoading}
      emptyMessage="Aucun lieu trouvé"
      onRowClick={(row) => onSelectLocation(row)}
      selectedRowId={selectedLocationId}
      headerClassName="!bg-sidebar !text-sidebar-foreground"
      headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
      tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
    />
  );
}
