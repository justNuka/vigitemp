'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { TanStackTable } from '@/components/data-table/tanstack-table';
import type { Probe } from '@/hooks/useProbes';

export type ProbeRow = {
  Id_Sonde: number;
  Adresse_Sonde: string | null;
  Sonde_Numero_Serie: string | null;
  Port_Serie: string | null;
  Id_Module: number | null;
  Etat_Sonde: string | null;
  Etat_Libelle: string | null;
  Lieu: string | null;
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
      header: 'Module',
      cell: ({ row }) => {
        const item = row.original;
        const moduleDisplay = item.Port_Serie ? `${item.Id_Module || '-'} (${item.Port_Serie})` : item.Id_Module || '-';
        return <span>{moduleDisplay}</span>;
      },
    },
    {
      accessorKey: 'Etat_Sonde',
      header: 'État',
      cell: ({ row }) => row.original.Etat_Libelle || row.getValue('Etat_Sonde') || '-',
    },
    {
      accessorKey: 'Lieu',
      header: 'Lieu',
      cell: ({ row }) => row.getValue('Lieu') || '-',
    },
  ];

  return (
    <TanStackTable
      columns={columns}
      data={probes}
      searchField={['Adresse_Sonde', 'Sonde_Numero_Serie', 'Lieu', 'Etat_Libelle', 'Etat_Sonde']}
      searchPlaceholder="Adresse, numéro de série..."
      isLoading={isLoading}
      maxHeight="60vh"
      emptyMessage="Aucune sonde trouvée"
      selectedRowId={selectedProbeId ?? undefined}
      onRowClick={(row: ProbeRow) => onSelectProbe(row.Id_Sonde)}
    />
  );
}

export function toProbeRows(probes: Probe[]): ProbeRow[] {
  return (probes || []).map((s) => ({
    Id_Sonde: s.Id_Sonde,
    Adresse_Sonde: s.Adresse_Sonde,
    Sonde_Numero_Serie: s.Sonde_Numero_Serie,
    Port_Serie: s.Port_Serie,
    Id_Module: s.Id_Module,
    Etat_Sonde: s.Etat_Sonde,
    Etat_Libelle: s.Etat_Libelle,
    Lieu: s.Lieu,
  }));
}

