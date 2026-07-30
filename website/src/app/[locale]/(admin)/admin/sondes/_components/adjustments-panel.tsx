'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { TanStackTable } from '@/components/data-table/tanstack-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatDateTimeFr } from './date-format';
import { useLocale, useTranslations } from 'next-intl';
import { useAppTimezone } from '@/components/timezone-provider';
import { Download, FileText } from 'lucide-react';

export type AdjustmentRow = {
  Id_Ajustage: number;
  Date_Heure_Ajustage: Date | null;
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
  const t = useTranslations('sensorsPage');
  const locale = useLocale();
  const localeTag = locale.toLowerCase().startsWith('fr') ? 'fr-FR' : locale;
  const timezone = useAppTimezone();
  const columns: ColumnDef<AdjustmentRow>[] = [
    {
      accessorKey: 'Date_Heure_Ajustage',
      header: t('panels.adjustments.columns.date'),
      cell: ({ row }) => formatDateTimeFr(row.original.Date_Heure_Ajustage, timezone, localeTag),
    },
    {
      accessorKey: 'Operateur',
      header: t('panels.adjustments.columns.operator'),
      cell: ({ row }) => row.getValue('Operateur') || '-',
    },
    {
      accessorKey: 'Unite',
      header: t('panels.adjustments.columns.unit'),
      cell: ({ row }) => row.getValue('Unite') || '-',
    },
    {
      accessorKey: 'Nb_Decimale',
      header: t('panels.adjustments.columns.decimals'),
      cell: ({ row }) => row.original.Nb_Decimale ?? '-',
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2" onClick={(event) => event.stopPropagation()}>
          <Button asChild variant="outline" size="sm" className="h-8 whitespace-nowrap">
            <a
              href={`/api/metrologie/ajustage/export/${row.original.Id_Ajustage}`}
              download
              title={t('panels.adjustments.actions.generate_file')}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              XML
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-8 whitespace-nowrap">
            <a
              href={`/api/metrologie/ajustage/report/${row.original.Id_Ajustage}`}
              download
              title={t('panels.adjustments.actions.print')}
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              PDF
            </a>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('panels.adjustments.title')}</CardTitle>
      </CardHeader>
      <CardContent className="p-2 md:p-4 xl:p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : adjustments.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">{t('panels.adjustments.empty')}</div>
        ) : (
          <>
            <TanStackTable
              columns={columns}
              data={adjustments}
              showSearch={false}
              showPagination={false}
              maxHeight="16rem"
              selectedRowId={selectedAdjustmentId ?? undefined}
              onRowClick={(row: AdjustmentRow) => onSelectAdjustment(row.Id_Ajustage)}
              headerClassName="!bg-sidebar !text-sidebar-foreground"
              headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
              tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}



