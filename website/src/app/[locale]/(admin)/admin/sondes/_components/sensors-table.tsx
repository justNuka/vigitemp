'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Activity, FlaskConical, PowerOff, Ruler, Wrench } from "lucide-react";
import { TanStackTable } from '@/components/data-table/tanstack-table';
import { Badge } from '@/components/ui/badge';
import type { Sensor } from '@/hooks/useSensors';
import { useLocale, useTranslations } from 'next-intl';
import { formatDbDateTime, parseDbDateTime } from '@/lib/date-display';

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
  Module_Libelle: string | null;
  Module_Port: string | null;
  Surveillance_Etat: string | null;
  Surveillance_Etat_Libelle: string | null;
  Lieu: string | null;
  Date_Validite_Etalonnage: string | Date | null;
};

type SensorsTableProps = {
  sensors: SensorRow[];
  isLoading: boolean;
  selectedSensorId: number | null;
  onSelectSensor: (sensorId: number) => void;
  onEditSensor?: (sensorId: number) => void;
  warningWindowDays?: number;
};

export function SensorsTable({ sensors, isLoading, selectedSensorId, onSelectSensor, onEditSensor, warningWindowDays = 30 }: SensorsTableProps) {
  const t = useTranslations('sensorsPage');
  const locale = useLocale();

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


  const parseDate = (value: string | Date | null | undefined): Date | null => {
    return parseDbDateTime(value);
  };

  const getCalibrationValidityState = (value: string | Date | null) => {
    const date = parseDate(value);
    if (!date) {
      return {
        tone: "none" as const,
      };
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const validityDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.ceil((validityDay.getTime() - startOfToday.getTime()) / 86400000);

    if (diffDays < 0) {
      return {
        tone: "expired" as const,
      };
    }

    if (diffDays <= warningWindowDays) {
      return {
        tone: "warning" as const,
      };
    }

    return {
      tone: "ok" as const,
    };
  };


  const formatValidityDate = (value: string | Date | null) => {
    return formatDbDateTime(value, {
      format: 'date',
      locale: locale.toLowerCase().startsWith('fr') ? 'fr-FR' : locale,
    });
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
        const rawPort = item.Module_Port ?? item.Port_Serie ?? null;
        const normalizedPort = rawPort
          ? /^COM/i.test(rawPort)
            ? rawPort.toUpperCase()
            : `COM${rawPort}`
          : null;
        const moduleName = item.Module_Libelle || (item.Id_Module ? `Module ${item.Id_Module}` : '-');
        return <span>{normalizedPort ? `${moduleName} (${normalizedPort})` : moduleName}</span>;
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
      accessorKey: 'Date_Validite_Etalonnage',
      header: t('table.columns.calibration_validity'),
      cell: ({ row }) => {
        const value = row.original.Date_Validite_Etalonnage;
        const validity = getCalibrationValidityState(value);
        const text = formatValidityDate(value);

        if (validity.tone === 'none') {
          return <span>-</span>;
        }

        if (validity.tone === 'ok') {
          return (
            <Badge className="border-emerald-500/40 bg-emerald-500/15 text-emerald-700" variant="outline">
              {text}
            </Badge>
          );
        }

        if (validity.tone === 'warning') {
          return (
            <Badge className="border-amber-500/40 bg-amber-500/15 text-amber-700" variant="outline">
              {text}
            </Badge>
          );
        }

        return (
          <Badge className="border-red-500/40 bg-red-500/15 text-red-700" variant="outline">
            {text}
          </Badge>
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
      onRowDoubleClick={(row: SensorRow) => onEditSensor?.(row.Id_Sonde)}
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
    Module_Libelle: s.Module_Libelle ?? null,
    Module_Port: s.Module_Port ?? null,
    Surveillance_Etat: s.Surveillance_Etat,
    Surveillance_Etat_Libelle: s.Surveillance_Etat_Libelle,
    Lieu: s.Lieu,
    Date_Validite_Etalonnage: s.Date_Validite_Etalonnage ?? null,
  }));
}


