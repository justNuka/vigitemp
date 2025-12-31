'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { TanStackTable } from '@/components/data-table/tanstack-table';
import type { GroupLocation } from '@/hooks/useGroupLocations';

type GroupLocationsPanelProps = {
  groupSelected: boolean;
  locations: GroupLocation[];
};

export function GroupLocationsPanel({ groupSelected, locations }: GroupLocationsPanelProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return locations;
    const needle = search.toLowerCase();
    return locations.filter((l) => l.Nom_Lieu?.toLowerCase().includes(needle));
  }, [locations, search]);

  const columns: ColumnDef<GroupLocation>[] = [
    {
      accessorKey: 'Nom_Lieu',
      header: 'Nom du lieu',
      cell: ({ row }) => row.getValue('Nom_Lieu') || '-',
    },
  ];

  return (
    <div>
      <h3 className="font-semibold mb-3">Lieu(x) associé(s)</h3>
      <Input
        placeholder="Rechercher un lieu..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3"
      />
      <TanStackTable
        columns={columns}
        data={filtered}
        showSearch={false}
        showPagination={false}
        maxHeight="16rem"
        emptyMessage={groupSelected ? 'Aucun lieu' : 'Sélectionnez un groupe'}
      />
    </div>
  );
}

