'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { TanStackTable } from '@/components/data-table/tanstack-table';
import { useTranslations } from 'next-intl';

export type ProbeRow = {
  Id_Sonde: number;
  Adresse_Sonde: string | null;
  Sonde_Numero_Serie: string | null;
  Port_Serie: string | null;
  Surveillance_Etat: string | null;
};

type ProbesTableProps = {
  probes: ProbeRow[];
  isLoading: boolean;
  selectedProbeId: number | null;
  onSelectProbe: (probeId: number) => void;
};

export function ProbesTable({ probes, isLoading, selectedProbeId, onSelectProbe }: ProbesTableProps) {
  const t = useTranslations('moduleProbesTable');
  const columns: ColumnDef<ProbeRow>[] = [
    {
      accessorKey: 'Adresse_Sonde',
      header: t('columns.address'),
      cell: ({ row }) => <span className="font-medium">{row.getValue('Adresse_Sonde') || '-'}</span>,
    },
    {
      accessorKey: 'Sonde_Numero_Serie',
      header: t('columns.serial'),
      cell: ({ row }) => row.getValue('Sonde_Numero_Serie') || '-',
    },
    {
      accessorKey: 'Port_Serie',
      header: t('columns.port'),
      cell: ({ row }) => row.getValue('Port_Serie') || '-',
    },
    {
      accessorKey: 'Surveillance_Etat',
      header: t('columns.status'),
      cell: ({ row }) => row.getValue('Surveillance_Etat') || '-',
    },
  ];

  return (
    <TanStackTable<ProbeRow>
      columns={columns}
      data={probes}
      showSearch={false}
      showPagination={false}
      maxHeight="16rem"
      emptyMessage={t('empty')}
      isLoading={isLoading}
      selectedRowId={selectedProbeId ?? undefined}
      onRowClick={(row) => onSelectProbe(row.Id_Sonde)}
    />
  );
}
