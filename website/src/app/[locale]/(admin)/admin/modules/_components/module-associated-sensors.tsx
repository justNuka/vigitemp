'use client';

import { TanStackTable } from '@/components/data-table/tanstack-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { Sonde } from '@/hooks/useModules';
import { useTranslations } from 'next-intl';

type AssociatedSensorRow = {
  Id_Sonde: number;
  Type: string;
  Sonde_Numero_Serie: string | null;
};

type ModuleAssociatedSensorsProps = {
  sondes: Sonde[] | undefined;
  isLoading: boolean;
};

export function ModuleAssociatedSensors({ sondes, isLoading }: ModuleAssociatedSensorsProps) {
  const t = useTranslations('moduleAssociatedSensors');
  const columns: ColumnDef<AssociatedSensorRow>[] = [
    {
      accessorKey: 'Type',
      header: t('columns.type'),
      cell: ({ row }) => row.getValue('Type') || '-',
    },
    {
      accessorKey: 'Sonde_Numero_Serie',
      header: t('columns.serial'),
      cell: ({ row }) => row.getValue('Sonde_Numero_Serie') || '-',
    },
  ];

  const data: AssociatedSensorRow[] = (sondes || []).map((sonde) => ({
    Id_Sonde: sonde.Id_Sonde,
    Type: '-',
    Sonde_Numero_Serie: sonde.Sonde_Numero_Serie,
  }));

  if (isLoading) {
    return <div className="text-sm text-muted-foreground text-center py-4">{t('loading')}</div>;
  }

  if (!sondes || sondes.length === 0) {
    return <div className="text-sm text-muted-foreground text-center py-4">{t('empty')}</div>;
  }

  return <TanStackTable columns={columns} data={data} showSearch={false} showPagination={false} maxHeight="16rem" headerClassName="!bg-sidebar !text-sidebar-foreground" headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80" tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0" />;
}


