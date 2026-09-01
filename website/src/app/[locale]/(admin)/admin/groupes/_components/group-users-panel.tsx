'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TanStackTable } from '@/components/data-table/tanstack-table';
import type { GroupUser } from '@/hooks/useGroupUsers';
import { useTranslations } from 'next-intl';

type GroupUsersPanelProps = {
  groupSelected: boolean;
  users: GroupUser[];
};

type GroupUserRow = {
  Id_Utilisateur: number;
  Nom_Complet: string;
};

export function GroupUsersPanel({ groupSelected, users }: GroupUsersPanelProps) {
  const [search, setSearch] = useState('');
  const t = useTranslations('groupsPage');

  const tableData = useMemo<GroupUserRow[]>(() => {
    const needle = search.toLowerCase();
    return (users || [])
      .map((u) => ({
        Id_Utilisateur: u.Id_Utilisateur,
        Nom_Complet: `${u.Prenom || ''} ${u.Nom || ''}`.trim(),
      }))
      .filter((u) => (needle ? u.Nom_Complet.toLowerCase().includes(needle) : true));
  }, [search, users]);

  const columns: ColumnDef<GroupUserRow>[] = [
    {
      accessorKey: 'Nom_Complet',
      header: t('panels.users.columns.name'),
      cell: ({ row }) => row.getValue('Nom_Complet') || '-',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('panels.users.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          placeholder={t('panels.users.search_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />
        <TanStackTable
          columns={columns}
          data={tableData}
          showSearch={false}
          showPagination={false}
          maxHeight="16rem"
          emptyMessage={groupSelected ? t('panels.users.empty') : t('panels.users.empty_unselected')}
          headerClassName="!bg-sidebar !text-sidebar-foreground"
          headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
          tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
        />
      </CardContent>
    </Card>
  );
}
