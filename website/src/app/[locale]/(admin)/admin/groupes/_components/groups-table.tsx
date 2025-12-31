'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { TanStackTable } from '@/components/data-table/tanstack-table';
import type { Group } from '@/hooks/useGroups';

type GroupsTableProps = {
  groups: Group[];
  isLoading: boolean;
  selectedGroupId: number | null;
  onSelectGroup: (group: Group) => void;
};

export function GroupsTable({ groups, isLoading, selectedGroupId, onSelectGroup }: GroupsTableProps) {
  const columns: ColumnDef<Group>[] = [
    {
      accessorKey: 'Id_Groupe',
      header: 'Numéro',
      cell: ({ row }) => row.getValue('Id_Groupe'),
    },
    {
      accessorKey: 'Nom_Groupe',
      header: 'Nom du groupe',
      cell: ({ row }) => row.getValue('Nom_Groupe') || '-',
    },
    {
      accessorKey: 'Numero_Regroupement',
      header: 'Regroupement',
      cell: ({ row }) => {
        const value = row.getValue('Numero_Regroupement');
        return value === '1' ? 'Regroupement 1' : 'Regroupement 2';
      },
    },
    {
      accessorKey: 'nombre_lieux',
      header: 'Lieux associés',
      cell: ({ row }) => <div className="text-right font-medium">{row.getValue('nombre_lieux')}</div>,
    },
  ];

  return (
    <TanStackTable
      columns={columns}
      data={groups}
      searchField={['Id_Groupe', 'Nom_Groupe', 'Numero_Regroupement']}
      searchPlaceholder="Numéro, nom du groupe..."
      isLoading={isLoading}
      emptyMessage="Aucun groupe trouvé"
      maxHeight="60vh"
      selectedRowId={selectedGroupId ?? undefined}
      onRowClick={(row: Group) => onSelectGroup(row)}
    />
  );
}

