'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { TanStackTable } from '@/components/data-table/tanstack-table';
import type { Group } from '@/hooks/useGroups';
import { useTranslations } from 'next-intl';

type GroupsTableProps = {
  groups: Group[];
  isLoading: boolean;
  selectedGroupId: number | null;
  onSelectGroup: (group: Group) => void;
};

export function GroupsTable({ groups, isLoading, selectedGroupId, onSelectGroup }: GroupsTableProps) {
  const t = useTranslations('groupsPage');
  const columns: ColumnDef<Group>[] = [
    {
      accessorKey: 'Id_Groupe',
      header: t('table.columns.number'),
      cell: ({ row }) => row.getValue('Id_Groupe'),
    },
    {
      accessorKey: 'Nom_Groupe',
      header: t('table.columns.name'),
      cell: ({ row }) => row.getValue('Nom_Groupe') || '-',
    },
    {
      accessorKey: 'Numero_Regroupement',
      header: t('table.columns.regroupement'),
      cell: ({ row }) => {
        const value = row.getValue('Numero_Regroupement');
        return value === '1' ? t('regroupement.one') : t('regroupement.two');
      },
    },
    {
      accessorKey: 'nombre_lieux',
      header: t('table.columns.locations'),
      cell: ({ row }) => <div className="text-right font-medium">{row.getValue('nombre_lieux')}</div>,
    },
  ];

  return (
    <TanStackTable
      columns={columns}
      data={groups}
      searchField={['Id_Groupe', 'Nom_Groupe', 'Numero_Regroupement']}
      searchPlaceholder={t('table.search_placeholder')}
      isLoading={isLoading}
      emptyMessage={t('table.empty')}
      maxHeight="calc(100dvh - 25rem)"
      selectedRowId={selectedGroupId ?? undefined}
      onRowClick={(row: Group) => onSelectGroup(row)}
      headerClassName="!bg-sidebar !text-sidebar-foreground"
      headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
      tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
    />
  );
}
