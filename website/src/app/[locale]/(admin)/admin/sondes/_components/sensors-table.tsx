'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Activity, FlaskConical, PowerOff, Ruler, Wrench } from "lucide-react";
import { TanStackTable } from '@/components/data-table/tanstack-table';
import type { Sensor } from '@/hooks/useSensors';
import { useTranslations } from 'next-intl';

type StatusTheme = {
  label: string;
  className: string;
  Icon: typeof Activity;
};

export type SensorRow = {
  Id_Sonde: number;
  Adresse_Sonde: string | null;
  Sonde_Numero_Serie: string | null;
  Port_Serie: string | null;
  Id_Module: number | null;
  Surveillance_Etat: string | null;
  Surveillance_Etat_Libelle: string | null;
  Lieu: string | null;
};

type SensorsTableProps = {
  sensors: SensorRow[];
  isLoading: boolean;
  selectedSensorId: number | null;
  onSelectSensor: (sensorId: number) => void;
};

export function SensorsTable({ sensors, isLoading, selectedSensorId, onSelectSensor }: SensorsTableProps) {
  const t = useTranslations('sensorsPage');

  const statusThemes: Record<string, StatusTheme> = {
    surveillance: {
      label: t('status.surveillance'),
      className: "border-emerald-500/40 bg-emerald-500/15 text-emerald-700",
      Icon: Activity,
    },
    calibrage: {
      label: t('status.calibrage'),
      className: "border-amber-500/40 bg-amber-500/15 text-amber-700",
      Icon: Wrench,
    },
    etalonnage: {
      label: t('status.etalonnage'),
      className: "border-sky-500/40 bg-sky-500/15 text-sky-700",
      Icon: Ruler,
    },
    test: {
      label: t('status.test'),
      className: "border-violet-500/40 bg-violet-500/15 text-violet-700",
      Icon: FlaskConical,
    },
    desactivee: {
      label: t('status.disabled'),
      className: "border-red-500/40 bg-red-500/15 text-red-700",
      Icon: PowerOff,
    },
    unknown: {
      label: t('status.unknown'),
      className: "border-slate-400/40 bg-slate-400/10 text-slate-600",
      Icon: PowerOff,
    },
  };

  const getSensorStatusTheme = (status: string | null, label: string | null): StatusTheme => {
    const raw = `${label ?? ""} ${status ?? ""}`.trim().toLowerCase();
    if (!raw) return statusThemes.unknown;
    if (raw === "s" || raw.includes("surveill")) return statusThemes.surveillance;
    if (raw === "d" || raw.includes("desactiv")) return statusThemes.desactivee;
    if (raw.includes("calibr")) return statusThemes.calibrage;
    if (raw.includes("etalonn")) return statusThemes.etalonnage;
    if (raw.includes("test")) return statusThemes.test;
    return statusThemes.unknown;
  };

  const columns: ColumnDef<SensorRow>[] = [
    {
      accessorKey: 'Adresse_Sonde',
      header: t('table.columns.address'),
      cell: ({ row }) => <span className="font-medium">{row.getValue('Adresse_Sonde') || '-'}</span>,
    },
    {
      accessorKey: 'Sonde_Numero_Serie',
      header: t('table.columns.serial'),
      cell: ({ row }) => row.getValue('Sonde_Numero_Serie') || '-',
    },
    {
      accessorKey: 'Port_Serie',
      header: t('table.columns.port'),
      cell: ({ row }) => row.getValue('Port_Serie') || '-',
    },
    {
      header: t('table.columns.module'),
      cell: ({ row }) => {
        const item = row.original;
        const moduleDisplay = item.Port_Serie ? `${item.Id_Module || '-'} (${item.Port_Serie})` : item.Id_Module || '-';
        return <span>{moduleDisplay}</span>;
      },
    },
    {
      accessorKey: 'Surveillance_Etat',
      header: t('table.columns.state'),
      cell: ({ row }) => {
        const theme = getSensorStatusTheme(
          row.original.Surveillance_Etat,
          row.original.Surveillance_Etat_Libelle,
        );
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
      accessorKey: 'Lieu',
      header: t('table.columns.location'),
      cell: ({ row }) => row.getValue('Lieu') || '-',
    },
  ];

  return (
    <TanStackTable
      columns={columns}
      data={sensors}
      searchField={[
        'Adresse_Sonde',
        'Sonde_Numero_Serie',
        'Lieu',
        'Surveillance_Etat_Libelle',
        'Surveillance_Etat',
      ]}
      searchPlaceholder={t('table.search_placeholder')}
      isLoading={isLoading}
      maxHeight="60vh"
      emptyMessage={t('table.empty')}
      selectedRowId={selectedSensorId ?? undefined}
      onRowClick={(row: SensorRow) => onSelectSensor(row.Id_Sonde)}
      headerClassName="!bg-sidebar !text-sidebar-foreground"
      headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
      tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
    />
  );
}

export function toSensorRows(sensors: Sensor[]): SensorRow[] {
  return (sensors || []).map((s) => ({
    Id_Sonde: s.Id_Sonde,
    Adresse_Sonde: s.Adresse_Sonde,
    Sonde_Numero_Serie: s.Sonde_Numero_Serie,
    Port_Serie: s.Port_Serie,
    Id_Module: s.Id_Module,
    Surveillance_Etat: s.Surveillance_Etat,
    Surveillance_Etat_Libelle: s.Surveillance_Etat_Libelle,
    Lieu: s.Lieu,
  }));
}

