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
    <Card className="overflow-hidden rounded-[10px] border-border bg-card shadow-[0_1px_2px_hsl(var(--shadow)/0.06)]">
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border px-3 py-2">
        <CardTitle className="text-[13px] font-semibold">{t('panels.locations.title')}</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <Input
          placeholder={t('panels.locations.search_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3 h-8 bg-[hsl(var(--primary-soft)/0.55)] text-[13px]"
        />
        <TanStackTable
          columns={columns}
          data={filtered}
          showSearch={false}
          showPagination={false}
          maxHeight="16rem"
          emptyMessage={groupSelected ? t('panels.locations.empty') : t('panels.locations.empty_unselected')}
        />
      </CardContent>
    </Card>
  );
}
