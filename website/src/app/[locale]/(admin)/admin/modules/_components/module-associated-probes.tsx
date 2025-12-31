'use client';

import { TanStackTable } from '@/components/data-table/tanstack-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { Sonde } from '@/hooks/useModules';

type AssociatedProbeRow = {
  Id_Sonde: number;
  Type: string;
  Sonde_Numero_Serie: string | null;
};

type ModuleAssociatedProbesProps = {
  sondes: Sonde[] | undefined;
  isLoading: boolean;
};

export function ModuleAssociatedProbes({ sondes, isLoading }: ModuleAssociatedProbesProps) {
  const columns: ColumnDef<AssociatedProbeRow>[] = [
    {
      accessorKey: 'Type',
      header: 'Type',
      cell: ({ row }) => row.getValue('Type') || '-',
    },
    {
      accessorKey: 'Sonde_Numero_Serie',
      header: 'Numéro de série',
      cell: ({ row }) => row.getValue('Sonde_Numero_Serie') || '-',
    },
  ];

  const data: AssociatedProbeRow[] = (sondes || []).map((sonde) => ({
    Id_Sonde: sonde.Id_Sonde,
    Type: '-',
    Sonde_Numero_Serie: sonde.Sonde_Numero_Serie,
  }));

  if (isLoading) {
    return <div className="text-sm text-muted-foreground text-center py-4">Chargement...</div>;
  }

  if (!sondes || sondes.length === 0) {
    return <div className="text-sm text-muted-foreground text-center py-4">Aucun matériel associé</div>;
  }

  return <TanStackTable columns={columns} data={data} showSearch={false} showPagination={false} maxHeight="16rem" />;
}

