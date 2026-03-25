'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TanStackTable } from '@/components/data-table/tanstack-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from 'next-intl';

export type MeasurementPoint = {
  reference: string;
  value: string;
  incertitude: string;
};

type StandardMeasurementsTableProps = {
  mesures: MeasurementPoint[];
  selectedMesureIndex: number | null;
  onSelectMesure: (index: number) => void;
  onAdd: () => void;
  onUpdate: (index: number, field: keyof MeasurementPoint, value: string) => void;
  onRequestDelete: () => void;
};

type MeasurementRow = MeasurementPoint & { id: number; point: number };

export function StandardMeasurementsTable({
  mesures,
  selectedMesureIndex,
  onSelectMesure,
  onAdd,
  onUpdate,
  onRequestDelete,
}: StandardMeasurementsTableProps) {
  const t = useTranslations('standardsDialog');

  const tableData: MeasurementRow[] = mesures.map((mesure, index) => ({
    id: index,
    point: index + 1,
    ...mesure,
  }));

  const columns: ColumnDef<MeasurementRow>[] = [
    {
      accessorKey: 'point',
      header: t('measurements.columns.point'),
      size: 80,
      cell: ({ row }) => row.getValue('point'),
    },
    {
      accessorKey: 'reference',
      header: t('measurements.columns.reference'),
      cell: ({ row }) => (
        <Input
          type="number"
          step="0.01"
          value={(row.getValue('reference') as string) || ''}
          onChange={(e) => onUpdate(row.original.id, 'reference', e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="h-8"
        />
      ),
    },
    {
      accessorKey: 'value',
      header: t('measurements.columns.value'),
      cell: ({ row }) => (
        <Input
          type="number"
          step="0.01"
          value={(row.getValue('value') as string) || ''}
          onChange={(e) => onUpdate(row.original.id, 'value', e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="h-8"
        />
      ),
    },
    {
      accessorKey: 'incertitude',
      header: t('measurements.columns.incertitude'),
      cell: ({ row }) => (
        <Input
          type="number"
          step="0.01"
          value={(row.getValue('incertitude') as string) || ''}
          onChange={(e) => onUpdate(row.original.id, 'incertitude', e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="h-8"
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{t('measurements.title')}</h3>

      <TanStackTable<MeasurementRow>
        columns={columns}
        data={tableData}
        onRowClick={(row) => onSelectMesure(row.id)}
        selectedRowId={selectedMesureIndex}
        showSearch={false}
        showPagination={false}
        enableExport={false}
        enablePrint={false}
        maxHeight="16rem"
        emptyMessage={t('measurements.empty')}
      />

      <div className="flex gap-2">
        <Button onClick={onAdd} className="gap-2" size="sm">
          <Plus className="h-4 w-4" />
          {t('measurements.add')}
        </Button>
        <Button onClick={onRequestDelete} disabled={selectedMesureIndex === null} variant="outline" size="sm" className="gap-2">
          <Trash2 className="h-4 w-4" />
          {t('measurements.delete')}
        </Button>
      </div>
    </div>
  );
}
