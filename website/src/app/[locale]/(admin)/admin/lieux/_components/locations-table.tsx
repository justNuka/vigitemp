'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, PowerOff } from "lucide-react";
import { TanStackTable } from '@/components/data-table/tanstack-table';
import { Badge } from '@/components/ui/badge';
import { getTypeIcon } from '@/lib/lieu-types';
import { formatNumber } from '@/lib/number-display';
import type { LocationRow } from '@/hooks/useLocations';
import { useTranslations } from 'next-intl';

type LieuStatusTheme = {
  label: string;
  className: string;
  Icon: typeof CheckCircle2;
};

const getLieuStatusTheme = (
  t: ReturnType<typeof useTranslations>,
  status: string | null
): LieuStatusTheme | null => {
  if (status === "S") {
    return {
      label: t('status.active'),
      className: "border-emerald-500/40 bg-emerald-500/15 text-emerald-700",
      Icon: CheckCircle2,
    };
  }
  if (status === "D") {
    return {
      label: t('status.disabled'),
      className: "border-red-500/40 bg-red-500/15 text-red-700",
      Icon: PowerOff,
    };
  }
  return null;
};

type LocationsTableProps = {
  locations: LocationRow[];
  isLoading: boolean;
  selectedLocationId?: number;
  onSelectLocation: (location: LocationRow) => void;
  onEditLocation?: (location: LocationRow) => void;
};

function formatFrequencyMinutes(value: number) {
  return formatNumber(value, { locale: 'fr-FR', maximumDecimals: 2 });
}

export function LocationsTable({
  locations,
  isLoading,
  selectedLocationId,
  onSelectLocation,
  onEditLocation,
}: LocationsTableProps) {
  const t = useTranslations('locationsTable');
  const typeLabels = {
    bain_marie: t('types.bain_marie'),
    etuve: t('types.etuve'),
    ambiance: t('types.ambiance'),
    frigo_congel: t('types.frigo_congel'),
    autre: t('types.autre'),
  } as const;

  const columns: ColumnDef<LocationRow>[] = [
    {
      accessorKey: 'Nom_Lieu',
      header: t('columns.location'),
    },
    {
      accessorKey: 'Type_Lieu',
      header: t('columns.type'),
      cell: ({ row }) => {
        const typeValue = row.original.Type_Lieu;
        const { icon, label } = getTypeIcon(typeValue, 'w-4 h-4', typeLabels);
        return (
          <div className="flex items-center gap-2">
            {icon}
            <span>{label}</span>
          </div>
        );
      },
    },
    {
      id: 'site',
      header: t('columns.site'),
      cell: ({ row }) => row.original.t_site?.Libelle_Site || t('placeholders.na'),
    },
    {
      id: 'groupes',
      header: t('columns.groups'),
      cell: ({ row }) => {
        const names = (row.original.t_lieu_groupe || [])
          .map((lg) => lg.t_groupe?.Nom_Groupe)
          .filter((n): n is string => !!n);

        return names.length > 0 ? names.join(', ') : t('placeholders.na');
      },
    },
    {
      accessorKey: 'Sonde_Numero_Serie',
      header: t('columns.sensor'),
      cell: ({ row }) => {
        const serial = row.original.Sonde_Numero_Serie;
        if (!serial) {
          return <Badge variant="secondary">{t('placeholders.no_sensor')}</Badge>;
        }
        return serial;
      },
    },
    {
      accessorKey: 'Lieu_Etat',
      header: t('columns.status'),
      cell: ({ row }) => {
        const theme = getLieuStatusTheme(t, row.original.Lieu_Etat);
        if (!theme) return row.original.Lieu_Etat || t('placeholders.na');
        const Icon = theme.Icon;
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${theme.className}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {theme.label}
          </span>
        );
      },
    },
    {
      accessorKey: 'Consigne',
      header: t('columns.setpoint'),
      cell: ({ row }) => row.getValue('Consigne') || t('placeholders.na'),
    },
    {
      accessorKey: 'Unite',
      header: t('columns.unit'),
      cell: ({ row }) => row.original.Unite || t('placeholders.na'),
    },
    {
      accessorKey: 'Frequence',
      header: t('columns.frequency'),
      cell: ({ row }) =>
        row.original.Frequence === null || row.original.Frequence === undefined
          ? t('placeholders.na')
          : `${formatFrequencyMinutes(row.original.Frequence)} min`,
    },
    {
      id: 'planning',
      header: t('columns.planning'),
      cell: ({ row }) => {
        const count = row.original.Planning_Regles_Count ?? 0;
        return count > 0 ? t('planning_value', { count }) : t('placeholders.na');
      },
    },
    {
      id: 'tolerances',
      header: t('columns.tolerances'),
      cell: ({ row }) => {
        const sup = row.original.Consigne_Sup;
        const inf = row.original.Consigne_Inf;
        if (sup === null && inf === null) return t('placeholders.na');
        return `Sup: ${sup ?? '-'} / Inf: ${inf ?? '-'}`;
      },
    },
    {
      id: 'alarm_delays',
      header: t('columns.alarm_delays'),
      cell: ({ row }) => {
        const high = row.original.Retard_Alarme_Haut;
        const low = row.original.Retard_Alarme_Bas;
        if (high === null && low === null) return t('placeholders.na');
        return `Haut: ${high ?? '-'} / Bas: ${low ?? '-'}`;
      },
    },
  ];

  return (
    <TanStackTable<LocationRow>
      columns={columns}
      data={locations}
      searchPlaceholder={t('search_placeholder')}
      pageSize={200}
      maxHeight="calc(100dvh - 25rem)"
      isLoading={isLoading}
      emptyMessage={t('empty')}
      onRowClick={(row) => onSelectLocation(row)}
      onRowDoubleClick={(row) => onEditLocation?.(row)}
      selectedRowId={selectedLocationId}
      headerClassName="!bg-sidebar !text-sidebar-foreground"
      headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
      tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
    />
  );
}


