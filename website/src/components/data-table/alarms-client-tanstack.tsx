"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchAlarmsPage, useAlarms } from "@/hooks/useAlarms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, RefreshCw, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDbDateTime } from "@/lib/date-display";
import { useAlarmMutations } from "@/components/data-table/alarms-mutations";
import { AlarmsFilters } from "@/components/data-table/alarms-filters";

interface AlarmRow {
  Id_Alarme: number;
  Type: "high" | "low" | "no-response" | "temperature";
  Libelle_Lieu: string;
  Date_Heure_Debut: string;
  Est_Alarme_Vrai: boolean | null;
  Date_Heure_Fin: string | null;
  Est_Acquittee: boolean | null;
  Min_Threshold: number | null;
  Max_Threshold: number | null;
  Unite: string | null;
  Derniere_Valeur: number | null;
  Status: "active" | "acknowledged" | "resolved";
  Count_30_Days: number | null;
}

const getAlarmStatus = (
  t: ReturnType<typeof useTranslations>,
  status: AlarmRow["Status"],
  dateHeureFin: string | null,
  estAcquittee: boolean | null
) => {
  if (status === "acknowledged" || estAcquittee) {
    return { label: t("status.acknowledged"), variant: "secondary" as const };
  }
  if (dateHeureFin || status === "resolved") {
    return { label: t("status.awaiting_ack"), variant: "default" as const };
  }
  return { label: t("status.active"), variant: "destructive" as const };
};

export function AlarmsClientTanStack() {
  const t = useTranslations("alarmsTanstack");
  const tButtons = useTranslations("buttons");
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [isRefreshing, startRefresh] = useTransition();
  const [typeFilters, setTypeFilters] = useState<AlarmRow["Type"][]>([]);
  const page = pagination.pageIndex + 1;
  const limit = pagination.pageSize;

  const { acknowledgeMutation } = useAlarmMutations();

  const formatDateTime = (date: string | null) => {
    if (!date) return t("date.na");
    return formatDbDateTime(date);
  };

  const columns = useMemo<ColumnDef<AlarmRow>[]>(
    () => [
      {
        accessorKey: "Type",
        header: t("columns.type"),
        cell: ({ row }) => {
          const type = row.getValue("Type") as AlarmRow["Type"];
          if (type === "no-response") {
            return (
              <div className="p-1.5 rounded-md w-fit bg-black/10">
                <WifiOff className="h-4 w-4 text-black" />
              </div>
            );
          }

          if (type === "high") {
            return (
              <div className="p-1.5 rounded-md w-fit bg-destructive/10">
                <ArrowUp className="h-4 w-4 text-destructive" />
              </div>
            );
          }

          if (type === "low") {
            return (
              <div className="p-1.5 rounded-md w-fit bg-[#26A5DA]/10">
                <ArrowDown className="h-4 w-4 text-[#26A5DA]" />
              </div>
            );
          }

          return <span className="text-xs text-muted-foreground">-</span>;
        },
      },
      {
        accessorKey: "Libelle_Lieu",
        header: t("columns.location"),
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue("Libelle_Lieu")}</span>
        ),
      },
      {
        accessorKey: "Derniere_Valeur",
        header: () => <div className="text-right">{t("columns.last_value")}</div>,
        cell: ({ row }) => {
          const value = row.getValue("Derniere_Valeur") as number | null;
          const unit = row.getValue("Unite") as string | null;
          return (
            <div className="text-right font-mono font-medium">
              {value !== null && value !== undefined ? `${value.toFixed(1)} ${unit ?? ""}` : "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "Min_Threshold",
        header: () => <div className="text-right">{t("columns.thresholds")}</div>,
        cell: ({ row }) => {
          const sup = row.getValue("Max_Threshold") as number | null;
          const inf = row.getValue("Min_Threshold") as number | null;
          const unit = row.getValue("Unite") as string | null;
          const hasSup = sup !== null && sup !== undefined;
          const hasInf = inf !== null && inf !== undefined;

          if (!hasSup && !hasInf) {
            return <div className="text-right font-mono text-muted-foreground">-</div>;
          }

          return (
            <div className="text-right font-mono text-muted-foreground">
              <div>{hasSup ? t("thresholds.sup", { value: sup, unit: unit ?? "" }) : t("thresholds.sup_empty")}</div>
              <div>{hasInf ? t("thresholds.inf", { value: inf, unit: unit ?? "" }) : t("thresholds.inf_empty")}</div>
            </div>
          );
        },
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
          const status = getAlarmStatus(
            t,
            row.getValue("Status"),
            row.getValue("Date_Heure_Fin"),
            row.getValue("Est_Acquittee")
          );
          return <Badge variant={status.variant}>{status.label}</Badge>;
        },
      },
      {
        accessorKey: "Count_30_Days",
        header: t("columns.count_30"),
        meta: {
          headerClassName: "!border-l border-white/25 !border-r border-white/25",
          cellClassName: "!border-l border-border !border-r border-border",
        },
        cell: ({ row }) => {
          const value = row.getValue("Count_30_Days") as number | null;
          return <span className="font-mono text-sm">{value ?? 0}</span>;
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
        id: "actions",
        header: () => <div className="text-center">{tButtons("acknowledge")}</div>,
        meta: {
          headerClassName: "!border-l border-white/25",
          cellClassName: "!border-l border-border",
        },
        cell: ({ row }) => {
          const alarm = row.original;
          if (alarm.Est_Acquittee) return null;
          return (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => acknowledgeMutation.mutate(alarm.Id_Alarme)}
                disabled={acknowledgeMutation.isPending}
                className="border-amber-300 bg-amber-300 text-slate-900 hover:bg-amber-200 hover:text-slate-900 dark:border-warning dark:bg-warning/20 dark:text-warning-foreground dark:hover:bg-warning/30"
              >
                {tButtons("acknowledge")}
              </Button>
            </div>
          );
        },
      },
    ],
    [acknowledgeMutation, t, tButtons]
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

  const tableData: AlarmRow[] = alarms
    .filter((alarm) => typeFilters.length === 0 || typeFilters.includes(alarm.Type))
    .map((alarm) => ({
      Id_Alarme: alarm.Id_Alarme,
      Type: alarm.Type,
      Libelle_Lieu: alarm.Libelle_Lieu || t("unknown_location"),
      Date_Heure_Debut: String(alarm.Date_Heure_Debut) || "",
      Est_Alarme_Vrai: alarm.Est_Alarme_Vrai,
      Date_Heure_Fin: alarm.Date_Heure_Fin ? String(alarm.Date_Heure_Fin) : null,
      Est_Acquittee: alarm.Est_Acquittee,
      Min_Threshold: alarm.Min_Threshold ?? null,
      Max_Threshold: alarm.Max_Threshold ?? null,
      Unite: alarm.Unite ?? null,
      Derniere_Valeur: alarm.Derniere_Valeur ?? null,
      Status: alarm.Status,
      Count_30_Days: alarm.Count_30_Days ?? null,
    }));

  const handleRefresh = () => {
    startRefresh(() => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
    });
  };

  const toggleTypeFilter = (type: AlarmRow["Type"], checked: boolean) => {
    setTypeFilters((prev) => {
      if (checked) {
        return prev.includes(type) ? prev : [...prev, type];
      }
      return prev.filter((item) => item !== type);
    });
  };

  const refreshButton = (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 border-primary/40"
      disabled={isRefreshing}
      data-testid="button-refresh"
    >
      <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
      <span className="hidden sm:inline">
        {isRefreshing ? t("refresh.loading") : t("refresh.label")}
      </span>
    </Button>
  );

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
          toolbarRight={
            <div className="flex items-center gap-2">
              <AlarmsFilters
                typeFilters={typeFilters}
                onToggleTypeFilter={toggleTypeFilter}
                onClearTypeFilters={() => setTypeFilters([])}
              />
              {refreshButton}
            </div>
          }
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
