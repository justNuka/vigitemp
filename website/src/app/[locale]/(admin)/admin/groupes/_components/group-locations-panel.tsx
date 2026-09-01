'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TanStackTable } from '@/components/data-table/tanstack-table';
import type { GroupLocation } from '@/hooks/useGroupLocations';
import { useTranslations } from 'next-intl';

type GroupLocationsPanelProps = {
  groupSelected: boolean;
  locations: GroupLocation[];
};

export function GroupLocationsPanel({ groupSelected, locations }: GroupLocationsPanelProps) {
  const [search, setSearch] = useState('');
  const t = useTranslations('groupsPage');

  const filtered = useMemo(() => {
    if (!search) return locations;
    const needle = search.toLowerCase();
    return locations.filter((l) => l.Nom_Lieu?.toLowerCase().includes(needle));
  }, [locations, search]);

  const columns: ColumnDef<GroupLocation>[] = [
    {
      accessorKey: 'Nom_Lieu',
      header: t('panels.locations.columns.name'),
      cell: ({ row }) => row.getValue('Nom_Lieu') || '-',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('panels.locations.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          placeholder={t('panels.locations.search_placeholder')}
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
          emptyMessage={groupSelected ? t('panels.locations.empty') : t('panels.locations.empty_unselected')}
          headerClassName="!bg-sidebar !text-sidebar-foreground"
          headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
          tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
        />
      </CardContent>
    </Card>
  );
}
