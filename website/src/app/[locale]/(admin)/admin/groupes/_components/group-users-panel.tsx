'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { TanStackTable } from '@/components/data-table/tanstack-table';
import type { GroupUser } from '@/hooks/useGroupUsers';

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
      header: 'Nom',
      cell: ({ row }) => row.getValue('Nom_Complet') || '-',
    },
  ];

  return (
    <div>
      <h3 className="font-semibold mb-3">Utilisateur(s) associé(s)</h3>
      <Input
        placeholder="Rechercher un utilisateur..."
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
        emptyMessage={groupSelected ? 'Aucun utilisateur' : 'Sélectionnez un groupe'}
      />
    </div>
  );
}

