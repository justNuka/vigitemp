'use client';

import { useEffect, useMemo, useState } from 'react';
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
  const locale = useLocale();
  const localeTag = locale.toLowerCase().startsWith('fr') ? 'fr-FR' : locale;
  const timezone = useAppTimezone();
  const [selectedExportIds, setSelectedExportIds] = useState<Set<number>>(new Set());
  const [isBulkExporting, setIsBulkExporting] = useState(false);

  useEffect(() => {
    const availableIds = new Set(adjustments.map((adjustment) => adjustment.Id_Ajustage));
    setSelectedExportIds((current) => {
      const next = new Set(Array.from(current).filter((id) => availableIds.has(id)));
      if (next.size === current.size && Array.from(next).every((id) => current.has(id))) {
        return current;
      }
      return next;
    });
  }, [adjustments]);

  const allSelected = adjustments.length > 0 && selectedExportIds.size === adjustments.length;
  const partiallySelected = selectedExportIds.size > 0 && !allSelected;

  const toggleAll = (checked: boolean) => {
    setSelectedExportIds(checked ? new Set(adjustments.map((adjustment) => adjustment.Id_Ajustage)) : new Set());
  };

  const toggleOne = (id: number, checked: boolean) => {
    setSelectedExportIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleBulkExport = async () => {
    if (selectedExportIds.size === 0 || isBulkExporting) return;

    setIsBulkExporting(true);
    try {
      const response = await fetch('/api/metrologie/ajustage/export/bulk', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedExportIds) }),
      });

      if (!response.ok) {
        throw new Error(t('panels.adjustments.bulk_export.error'));
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
      toast.success(t('panels.adjustments.bulk_export.success', { count: selectedExportIds.size }));
    } catch {
      toast.error(t('panels.adjustments.bulk_export.error'));
    } finally {
      setIsBulkExporting(false);
    }
  };

  const columns: ColumnDef<AdjustmentRow>[] = useMemo(() => [
    {
      id: 'select',
      header: () => (
        <div className="flex justify-center" onClick={(event) => event.stopPropagation()}>
          <Checkbox
            checked={allSelected ? true : partiallySelected ? 'indeterminate' : false}
            onCheckedChange={(checked) => toggleAll(checked === true)}
            aria-label={t('panels.adjustments.bulk_export.select_all')}
          />
        </div>
      ),
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-center" onClick={(event) => event.stopPropagation()}>
          <Checkbox
            checked={selectedExportIds.has(row.original.Id_Ajustage)}
            onCheckedChange={(checked) => toggleOne(row.original.Id_Ajustage, checked === true)}
            aria-label={t('panels.adjustments.bulk_export.select_row')}
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
  ], [allSelected, localeTag, partiallySelected, selectedExportIds, t, timezone]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">{t('panels.adjustments.title')}</CardTitle>
          <div className="flex items-center gap-2">
            {selectedExportIds.size > 0 ? (
              <span className="text-xs text-muted-foreground">
                {t('panels.adjustments.bulk_export.selected_count', { count: selectedExportIds.size })}
              </span>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-2"
              disabled={selectedExportIds.size === 0 || isBulkExporting}
              onClick={handleBulkExport}
            >
              <FileArchive className="h-3.5 w-3.5" />
              {isBulkExporting
                ? t('panels.adjustments.bulk_export.exporting')
                : t('panels.adjustments.bulk_export.action')}
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
