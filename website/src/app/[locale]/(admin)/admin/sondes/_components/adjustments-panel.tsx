'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { TanStackTable } from '@/components/data-table/tanstack-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTimeFr } from './date-format';

export type AdjustmentRow = {
  Id_Calibrage: number;
  Date_Heure_Calibrage: Date | null;
  Operateur: string | null;
  Unite: string | null;
  Nb_Decimale: number | null;
};

type AdjustmentsPanelProps = {
  adjustments: AdjustmentRow[];
  isLoading: boolean;
  selectedAdjustmentId: number | null;
  onSelectAdjustment: (id: number) => void;
};

export function AdjustmentsPanel({
  adjustments,
  isLoading,
  selectedAdjustmentId,
  onSelectAdjustment,
}: AdjustmentsPanelProps) {
  const columns: ColumnDef<AdjustmentRow>[] = [
    {
      accessorKey: 'Date_Heure_Calibrage',
      header: 'Date',
      cell: ({ row }) => formatDateTimeFr(row.original.Date_Heure_Calibrage),
    },
    {
      accessorKey: 'Operateur',
      header: 'Opérateur',
      cell: ({ row }) => row.getValue('Operateur') || '-',
    },
    {
      accessorKey: 'Unite',
      header: 'Unité',
      cell: ({ row }) => row.getValue('Unite') || '-',
    },
    {
      accessorKey: 'Nb_Decimale',
      header: 'Décimales',
      cell: ({ row }) => row.getValue('Nb_Decimale') || '-',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Calibrages</CardTitle>
      </CardHeader>
      <CardContent className="p-2 md:p-4 xl:p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : adjustments.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">Aucun calibrage</div>
        ) : (
          <>
            <TanStackTable
              columns={columns}
              data={adjustments}
              showSearch={false}
              showPagination={false}
              maxHeight="16rem"
              selectedRowId={selectedAdjustmentId ?? undefined}
              onRowClick={(row: AdjustmentRow) => onSelectAdjustment(row.Id_Calibrage)}
              headerClassName="!bg-sidebar !text-sidebar-foreground"
              headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
              tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
            />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={!selectedAdjustmentId} className="flex-1">
                Générer fichier
              </Button>
              <Button size="sm" variant="outline" disabled={!selectedAdjustmentId} className="flex-1">
                Imprimer
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

