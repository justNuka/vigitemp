'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { TanStackTable } from '@/components/data-table/tanstack-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDateFr, formatDateTimeFr } from './date-format';
import { useLocale, useTranslations } from 'next-intl';
import { useAppTimezone } from '@/components/timezone-provider';

export type CalibrationRow = {
  Id_Etalonnage: number;
  Date_Heure_Etalonnage: Date | null;
  Date_Validite: Date | null;
  Operateur: string | null;
  Incertitude: string | null;
};

type CalibrationsPanelProps = {
  calibrations: CalibrationRow[];
  isLoading: boolean;
  selectedCalibrationId: number | null;
  onSelectCalibration: (id: number) => void;
};

export function CalibrationsPanel({
  calibrations,
  isLoading,
  selectedCalibrationId,
  onSelectCalibration,
}: CalibrationsPanelProps) {
  const t = useTranslations('sensorsPage');
  const locale = useLocale();
  const localeTag = locale.toLowerCase().startsWith('fr') ? 'fr-FR' : locale;
  const timezone = useAppTimezone();
  const warningWindowDays = 30;

  const getDaysUntilValidity = (date: Date) => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return Math.ceil((targetDay.getTime() - startOfToday.getTime()) / 86400000);
  };

  const renderValidityStatus = (validityDate: Date | null) => {
    if (!validityDate) return null;

    const daysLeft = getDaysUntilValidity(validityDate);
    if (daysLeft < 0) {
      const days = Math.abs(daysLeft);
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="destructive" className="text-[11px]">
                {t('panels.calibrations.validity_status.expired_days', { days })}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>{t('panels.calibrations.validity_status.expired_tooltip', { days })}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (daysLeft <= warningWindowDays) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className="border-amber-400 bg-amber-100 text-amber-900 dark:border-amber-500 dark:bg-amber-500/20 dark:text-amber-200 text-[11px]"
              >
                {t('panels.calibrations.validity_status.expiring_days', { days: daysLeft })}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>{t('panels.calibrations.validity_status.expiring_tooltip', { days: daysLeft })}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Badge
        variant="outline"
        className="border-emerald-400 bg-emerald-100 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-200 text-[11px]"
      >
        {t('panels.calibrations.validity_status.valid_days', { days: daysLeft })}
      </Badge>
    );
  };

  const columns: ColumnDef<CalibrationRow>[] = [
    {
      accessorKey: 'Date_Heure_Etalonnage',
      header: t('panels.calibrations.columns.date'),
      cell: ({ row }) => formatDateTimeFr(row.original.Date_Heure_Etalonnage, timezone, localeTag),
    },
    {
      accessorKey: 'Date_Validite',
      header: t('panels.calibrations.columns.validity'),
      cell: ({ row }) => {
        const validityDate = row.original.Date_Validite;
        return (
          <div className="flex flex-col gap-1">
            <span>{formatDateFr(validityDate, timezone, localeTag)}</span>
            {renderValidityStatus(validityDate)}
          </div>
        );
      },
    },
    {
      accessorKey: 'Operateur',
      header: t('panels.calibrations.columns.operator'),
      cell: ({ row }) => row.getValue('Operateur') || '-',
    },
    {
      accessorKey: 'Incertitude',
      header: t('panels.calibrations.columns.incertitude'),
      cell: ({ row }) => row.getValue('Incertitude') || '-',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('panels.calibrations.title')}</CardTitle>
      </CardHeader>
      <CardContent className="p-2 md:p-4 xl:p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : calibrations.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">{t('panels.calibrations.empty')}</div>
        ) : (
          <>
            <TanStackTable
              columns={columns}
              data={calibrations}
              showSearch={false}
              showPagination={false}
              maxHeight="16rem"
              selectedRowId={selectedCalibrationId ?? undefined}
              onRowClick={(row: CalibrationRow) => onSelectCalibration(row.Id_Etalonnage)}
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



