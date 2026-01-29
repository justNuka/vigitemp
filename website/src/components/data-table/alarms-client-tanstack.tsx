"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchAlarmsPage, useAlarms } from "@/hooks/useAlarms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";

interface AlarmRow {
  Id_Alarme: number;
  Libelle_Lieu: string;
  Date_Heure_Debut: string;
  Est_Alarme_Vrai: boolean | null;
  Date_Heure_Fin: string | null;
  Est_Acquittee: boolean | null;
}

const getAlarmStatus = (
  t: ReturnType<typeof useTranslations>,
  dateHeureFin: string | null
) => {
  if (dateHeureFin) {
    return { label: t("status.awaiting_ack"), variant: "default" as const };
  }
  return { label: t("status.active"), variant: "destructive" as const };
};

const getAcknowledgmentStatus = (
  t: ReturnType<typeof useTranslations>,
  estAcquittee: boolean | null
) => {
  if (estAcquittee === null) return { label: t("ack_status.na"), variant: "secondary" as const };
  return estAcquittee
    ? { label: t("ack_status.acknowledged"), variant: "default" as const }
    : { label: t("ack_status.not_acknowledged"), variant: "outline" as const };
};

export function AlarmsClientTanStack() {
  const t = useTranslations("alarmsTanstack");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const page = pagination.pageIndex + 1;
  const limit = pagination.pageSize;

  const dateLocale = useMemo(
    () => (locale.toLowerCase().startsWith("fr") ? fr : enUS),
    [locale]
  );

  const formatDateTime = (date: string | null) => {
    if (!date) return t("date.na");
    return format(new Date(date), "dd/MM/yyyy HH:mm:ss", { locale: dateLocale });
  };

  const columns = useMemo<ColumnDef<AlarmRow>[]>(
    () => [
      {
        accessorKey: "Libelle_Lieu",
        header: t("columns.location"),
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue("Libelle_Lieu")}</span>
        ),
      },
      {
        accessorKey: "Date_Heure_Debut",
        header: t("columns.start"),
        meta: {
          headerClassName: "!border-l border-white/25 !border-r border-white/25",
          cellClassName: "!border-l border-border !border-r border-border",
        },
        cell: ({ row }) => formatDateTime(row.getValue("Date_Heure_Debut")),
      },
      {
        accessorKey: "Est_Alarme_Vrai",
        header: t("columns.status"),
        meta: {
          headerClassName: "!border-l border-white/25 !border-r border-white/25",
          cellClassName: "!border-l border-border !border-r border-border",
        },
        cell: ({ row }) => {
          const status = getAlarmStatus(t, row.getValue("Date_Heure_Fin"));
          return <Badge variant={status.variant}>{status.label}</Badge>;
        },
      },
      {
        accessorKey: "Date_Heure_Fin",
        header: t("columns.end"),
        meta: {
          headerClassName: "!border-l border-white/25",
          cellClassName: "!border-l border-border",
        },
        cell: ({ row }) => formatDateTime(row.getValue("Date_Heure_Fin")),
      },
      {
        accessorKey: "Est_Acquittee",
        header: t("columns.acknowledged"),
        meta: {
          headerClassName: "!border-l border-white/25",
          cellClassName: "!border-l border-border",
        },
        cell: ({ row }) => {
          const status = getAcknowledgmentStatus(t, row.getValue("Est_Acquittee"));
          return <Badge variant={status.variant}>{status.label}</Badge>;
        },
      },
    ],
    [t, dateLocale]
  );

  const { data, isLoading, isFetching } = useAlarms({ page, limit });
  const alarms = data?.data ?? [];
  const total = data?.pagination.total ?? alarms.length;
  const pageCount = data?.pagination.pages ?? 1;

  useEffect(() => {
    if (!data?.pagination) return;
    if (data.pagination.page >= data.pagination.pages) return;
    const nextPage = data.pagination.page + 1;
    queryClient.prefetchQuery({
      queryKey: ["alarms", nextPage, limit],
      queryFn: () => fetchAlarmsPage(nextPage, limit),
      staleTime: 30_000,
    });
  }, [data?.pagination, limit, queryClient]);

  const tableData: AlarmRow[] = alarms.map((alarm) => ({
    Id_Alarme: alarm.Id_Alarme,
    Libelle_Lieu: alarm.Libelle_Lieu || t("unknown_location"),
    Date_Heure_Debut: String(alarm.Date_Heure_Debut) || "",
    Est_Alarme_Vrai: alarm.Est_Alarme_Vrai,
    Date_Heure_Fin: alarm.Date_Heure_Fin ? String(alarm.Date_Heure_Fin) : null,
    Est_Acquittee: alarm.Est_Acquittee,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="p-2 md:p-4 xl:p-4">
        <TanStackTable
          columns={columns}
          data={tableData}
          searchField="Libelle_Lieu"
          searchPlaceholder={t("search_placeholder")}
          pageSize={15}
          maxHeight="60vh"
          isLoading={isLoading || isFetching}
          emptyMessage={t("empty")}
          manualPagination
          pageCount={pageCount}
          totalRows={total}
          paginationState={pagination}
          onPaginationChange={(updater) => {
            setPagination((prev) => {
              const next = typeof updater === "function" ? updater(prev) : updater;
              if (next.pageSize !== prev.pageSize) {
                return { pageIndex: 0, pageSize: next.pageSize };
              }
              return next;
            });
          }}
          headerClassName="!bg-sidebar !text-sidebar-foreground"
          headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
          tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_tbody_td]:!border-b [&_tbody_td]:!border-border"
        />
      </CardContent>
    </Card>
  );
}
