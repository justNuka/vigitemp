'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { TanStackTable } from '@/components/data-table/tanstack-table';

export type ProbeRow = {
  Id_Sonde: number;
  Adresse_Sonde: string | null;
  Sonde_Numero_Serie: string | null;
  Port_Serie: string | null;
  Etat_Sonde: string | null;
};

type ProbesTableProps = {
  probes: ProbeRow[];
  isLoading: boolean;
  selectedProbeId: number | null;
  onSelectProbe: (probeId: number) => void;
};

export function ProbesTable({ probes, isLoading, selectedProbeId, onSelectProbe }: ProbesTableProps) {
  const columns: ColumnDef<ProbeRow>[] = [
    {
      accessorKey: 'Adresse_Sonde',
      header: 'Adresse',
      cell: ({ row }) => <span className="font-medium">{row.getValue('Adresse_Sonde') || '-'}</span>,
    },
    {
      accessorKey: 'Sonde_Numero_Serie',
      header: 'Numéro de série',
      cell: ({ row }) => row.getValue('Sonde_Numero_Serie') || '-',
    },
    {
      accessorKey: 'Port_Serie',
      header: 'Port série',
      cell: ({ row }) => row.getValue('Port_Serie') || '-',
    },
    {
      accessorKey: 'Etat_Sonde',
      header: 'État',
      cell: ({ row }) => row.getValue('Etat_Sonde') || '-',
    },
  ];

  return (
    <TanStackTable<ProbeRow>
      columns={columns}
      data={probes}
      showSearch={false}
      showPagination={false}
      maxHeight="16rem"
      emptyMessage="Aucun matériel associé à ce module"
      isLoading={isLoading}
      selectedRowId={selectedProbeId ?? undefined}
      onRowClick={(row) => onSelectProbe(row.Id_Sonde)}
    />
  );
}

