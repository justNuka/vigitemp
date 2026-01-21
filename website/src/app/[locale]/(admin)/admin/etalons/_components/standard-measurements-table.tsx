'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TanStackTable } from '@/components/data-table/tanstack-table';
import type { ColumnDef } from '@tanstack/react-table';

export type MeasurementPoint = {
  point: number;
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

type MeasurementRow = MeasurementPoint & { id: number };

export function StandardMeasurementsTable({
  mesures,
  selectedMesureIndex,
  onSelectMesure,
  onAdd,
  onUpdate,
  onRequestDelete,
}: StandardMeasurementsTableProps) {
  const tableData: MeasurementRow[] = mesures.map((mesure, index) => ({
    id: index,
    ...mesure,
  }));

  const columns: ColumnDef<MeasurementRow>[] = [
    {
      accessorKey: 'point',
      header: 'Point',
      size: 80,
      cell: ({ row }) => row.getValue('point'),
    },
    {
      accessorKey: 'reference',
      header: 'T° reference',
      cell: ({ row }) => (
        <Input
          type="number"
          step="0.01"
          value={row.getValue('reference') as string}
          onChange={(e) => onUpdate(row.original.id, 'reference', e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="h-8"
        />
      ),
    },
    {
      accessorKey: 'value',
      header: 'T° lue',
      cell: ({ row }) => (
        <Input
          type="number"
          step="0.01"
          value={row.getValue('value') as string}
          onChange={(e) => onUpdate(row.original.id, 'value', e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="h-8"
        />
      ),
    },
    {
      accessorKey: 'incertitude',
      header: 'Incertitude',
      cell: ({ row }) => (
        <Input
          type="number"
          step="0.01"
          value={row.getValue('incertitude') as string}
          onChange={(e) => onUpdate(row.original.id, 'incertitude', e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="h-8"
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Tableau de mesures</h3>

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
        emptyMessage="Aucune mesure"
      />

      <div className="flex gap-2">
        <Button onClick={onAdd} className="bg-green-600 hover:bg-green-700" size="sm">
          Nouveau
        </Button>
        <Button onClick={onRequestDelete} disabled={selectedMesureIndex === null} variant="outline" size="sm">
          Supprimer
        </Button>
      </div>
    </div>
  );
}
