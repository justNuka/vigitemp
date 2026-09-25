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
    <Card className="overflow-hidden rounded-[10px] border-border bg-card shadow-[0_1px_2px_hsl(var(--shadow)/0.06)]">
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border px-3 py-2">
        <CardTitle className="text-[13px] font-semibold">{t('panels.users.title')}</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <Input
          placeholder={t('panels.users.search_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3 h-8 bg-[hsl(var(--primary-soft)/0.55)] text-[13px]"
        />
        <TanStackTable
          columns={columns}
          data={tableData}
          showSearch={false}
          showPagination={false}
          maxHeight="16rem"
          emptyMessage={groupSelected ? t('panels.users.empty') : t('panels.users.empty_unselected')}
        />
      </CardContent>
    </Card>
  );
}
