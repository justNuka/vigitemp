'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { TanStackTable } from '@/components/data-table/tanstack-table';
import { useTranslations } from 'next-intl';

export type SensorRow = {
  Id_Sonde: number;
  Adresse_Sonde: string | null;
  Sonde_Numero_Serie: string | null;
  Port_Serie: string | null;
  Surveillance_Etat: string | null;
};

type SensorsTableProps = {
  sensors: SensorRow[];
  isLoading: boolean;
  selectedSensorId: number | null;
  onSelectSensor: (sensorId: number) => void;
};

export function SensorsTable({ sensors, isLoading, selectedSensorId, onSelectSensor }: SensorsTableProps) {
  const t = useTranslations('moduleSensorsTable');
  const columns: ColumnDef<SensorRow>[] = [
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
    <TanStackTable<SensorRow>
      columns={columns}
      data={sensors}
      showSearch={false}
      showPagination={false}
      maxHeight="16rem"
      emptyMessage={t('empty')}
      isLoading={isLoading}
      selectedRowId={selectedSensorId ?? undefined}
      onRowClick={(row) => onSelectSensor(row.Id_Sonde)}
    />
  );
}

