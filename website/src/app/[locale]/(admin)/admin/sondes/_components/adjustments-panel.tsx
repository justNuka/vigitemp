'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { TanStackTable } from '@/components/data-table/tanstack-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDateTimeFr } from './date-format';
import { useLocale, useTranslations } from 'next-intl';
import { useAppTimezone } from '@/components/timezone-provider';
import { Download, FileArchive, FileText } from 'lucide-react';
import { toast } from 'sonner';

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

function getDownloadFileName(contentDisposition: string | null) {
  const match = contentDisposition?.match(/filename="?([^";]+)"?/i);
  return match?.[1]?.trim() || 'Ajustages.zip';
}

export function AdjustmentsPanel({
  adjustments,
  isLoading,
  selectedAdjustmentId,
  onSelectAdjustment,
}: AdjustmentsPanelProps) {
  const t = useTranslations('sensorsPage');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const localeTag = locale.toLowerCase().startsWith('fr') ? 'fr-FR' : locale;
  const timezone = useAppTimezone();
  const [selectedExportIds, setSelectedExportIds] = useState<Set<number>>(new Set());
  const [isBulkExporting, setIsBulkExporting] = useState(false);

  const availableIds = new Set(adjustments.map((adjustment) => adjustment.Id_Ajustage));
  const effectiveSelectedIds = new Set(Array.from(selectedExportIds).filter((id) => availableIds.has(id)));
  const allSelected = adjustments.length > 0 && effectiveSelectedIds.size === adjustments.length;
  const partiallySelected = effectiveSelectedIds.size > 0 && !allSelected;

  const toggleAll = (checked: boolean) => {
    setSelectedExportIds(checked ? new Set(adjustments.map((adjustment) => adjustment.Id_Ajustage)) : new Set());
  };

  const toggleOne = (id: number, checked: boolean) => {
    setSelectedExportIds((current) => {
      const next = new Set(Array.from(current).filter((currentId) => availableIds.has(currentId)));
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleBulkExport = async () => {
    if (effectiveSelectedIds.size === 0 || isBulkExporting) return;

    setIsBulkExporting(true);
    try {
      const response = await fetch('/api/metrologie/ajustage/export/bulk', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(effectiveSelectedIds) }),
      });

      if (!response.ok) {
        throw new Error('bulk_adjustment_export_failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = getDownloadFileName(response.headers.get('Content-Disposition'));
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast.success(tCommon('success'));
    } catch {
      toast.error(tCommon('error'));
    } finally {
      setIsBulkExporting(false);
    }
  };

  const columns: ColumnDef<AdjustmentRow>[] = [
    {
      id: 'select',
      header: () => (
        <div className="flex justify-center" onClick={(event) => event.stopPropagation()}>
          <Checkbox
            checked={allSelected ? true : partiallySelected ? 'indeterminate' : false}
            onCheckedChange={(checked) => toggleAll(checked === true)}
            aria-label={tCommon('export')}
          />
        </div>
      ),
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-center" onClick={(event) => event.stopPropagation()}>
          <Checkbox
            checked={effectiveSelectedIds.has(row.original.Id_Ajustage)}
            onCheckedChange={(checked) => toggleOne(row.original.Id_Ajustage, checked === true)}
            aria-label={tCommon('export')}
          />
        </div>
      ),
    },
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">{t('panels.adjustments.title')}</CardTitle>
          <div className="flex items-center gap-2">
            {effectiveSelectedIds.size > 0 ? (
              <span className="min-w-6 rounded-full bg-muted px-2 py-0.5 text-center text-xs text-muted-foreground">
                {effectiveSelectedIds.size}
              </span>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-2"
              disabled={effectiveSelectedIds.size === 0 || isBulkExporting}
              onClick={handleBulkExport}
              title={t('panels.adjustments.actions.generate_file')}
            >
              <FileArchive className="h-3.5 w-3.5" />
              {isBulkExporting ? tCommon('loading') : tCommon('export')} XML
            </Button>
          </div>
        </div>
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
        )}
      </CardContent>
    </Card>
  );
}
