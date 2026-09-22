"use client";

import { useCallback, useEffect, useMemo, useState, useTransition, type Dispatch, type SetStateAction } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceStrict, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertTriangle, ArrowDown, ArrowUp, Bell, Clock, MessageSquare, PowerOff, RefreshCw, WifiOff } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";

import { useAppAccess } from "@/components/access/app-access-provider";
import { EmptyState } from "@/components/empty-state";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { alarmsApi, type AlarmWithDetails } from "@/lib/api";
import { formatDbDateTime, parseDbDateTime } from "@/lib/date-display";
import { formatMeasureValue } from "@/lib/measurements";
import { markAlarmAcknowledgedInPaginatedSensorsCache } from "@/lib/surveillance-cache";
import { cn } from "@/lib/utils";

import { AlarmDetailsDialog } from "./_components/alarm-details-dialog";
import { AlarmStatusBadge } from "./_components/alarm-status-badge";
import { AlarmStatusTabs, type AlarmStatus } from "./_components/alarm-status-tabs";
import { AlarmTypeFilter, type AlarmRowType } from "./_components/alarm-type-filter";
import { formatAlarmGroupNames } from "./alarm-groups";

interface Props {
  alarms: AlarmWithDetails[];
  statusFilter: AlarmStatus;
  initialLocationId?: string | null;
  stats: {
    active: number;
    acknowledged: number;
    resolved: number;
    total?: number;
  };
  onStatusChange: (status: AlarmStatus) => void;
  onStatsChange?: Dispatch<SetStateAction<{
    active: number;
    acknowledged: number;
    resolved: number;
    total: number;
  }>>;
}

interface AlarmRow {
  id: string;
  type: AlarmRowType;
  location: AlarmWithDetails["location"];
  sensor: AlarmWithDetails["sensor"];
  value: number | null;
  threshold: number | null;
  triggeredAt: string | Date;
  status: string;
  comment: string | null;
  groups: string;
  searchText: string;
}

const hasConfiguredThresholds = (alarm: { sensor: AlarmWithDetails["sensor"] }): boolean => {
  const sensorWithMeta = alarm.sensor as AlarmWithDetails["sensor"] & { hasThresholds?: boolean };
  return sensorWithMeta.hasThresholds !== false;
};

export function AlarmsClient({ alarms, statusFilter, initialLocationId = null, stats, onStatusChange, onStatsChange }: Props) {
  const t = useTranslations("alarmsPage");
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = useAppAccess();
  const canAcknowledgeAlarm = hasPermission("ALARM_ACK_ACCESS");
  const [isRefreshing, startTransition] = useTransition();
  const [selectedAlarm, setSelectedAlarm] = useState<AlarmWithDetails | null>(null);
  const [durationNow, setDurationNow] = useState(() => new Date());
  const [localAlarms, setLocalAlarms] = useState<AlarmWithDetails[]>(alarms);
  const [typeFilters, setTypeFilters] = useState<AlarmRowType[]>([]);
  const [locationFilterId, setLocationFilterId] = useState<string | null>(initialLocationId);
  const [commentOptions, setCommentOptions] = useState<{ id: number; type: string | null; text: string }[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string>("");
  const [showGraph, setShowGraph] = useState(false);
  const [alarmCount30, setAlarmCount30] = useState<number | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [visibleRowCount, setVisibleRowCount] = useState<number>(0);
  const formatTzDateTime = (value: string | Date) => formatDbDateTime(value, { format: "dateTimeSeconds" });
  const normalizeCommentOptions = useCallback((raw: unknown): { id: number; type: string | null; text: string }[] => {
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const candidate = item as Record<string, unknown>;
        const idValue = candidate.id ?? candidate.Id_Commentaire;
        const id = typeof idValue === "number" ? idValue : Number(idValue);
        if (!Number.isFinite(id)) return null;
        const textValue = candidate.text ?? candidate.Texte ?? "";
        const text = typeof textValue === "string" ? textValue : String(textValue ?? "");
        const typeValue = candidate.type ?? candidate.Type_Commentaire ?? null;
        const type = typeof typeValue === "string" ? typeValue : null;
        return { id, type, text };
      })
      .filter((item): item is { id: number; type: string | null; text: string } => item !== null);
  }, []);

  useEffect(() => {
    setLocalAlarms(alarms);
  }, [alarms]);

  useEffect(() => {
    setLocationFilterId(initialLocationId);
  }, [initialLocationId]);

  const commentSchema = z.object({
    comment: z.string().max(200, t("validation.comment_max", { max: 200 })).optional(),
  });

  type CommentFormValues = z.infer<typeof commentSchema>;

  const { register, handleSubmit, reset, control, setValue, formState: { errors, isSubmitting } } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { comment: "" },
  });

  const comment = useWatch({ control, name: "comment" }) ?? "";

  useEffect(() => {
    if (!selectedAlarm) return;
    setShowGraph(false);
    setSelectedCommentId("");
    setAlarmCount30(null);
    reset({ comment: "" });
    let isActive = true;
    setIsCommentsLoading(true);
    fetch("/api/alarmes/commentaires-acquittement")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (isActive) setCommentOptions(normalizeCommentOptions(payload?.data));
      })
      .catch(() => {
        if (isActive) setCommentOptions([]);
      })
      .finally(() => {
        if (isActive) setIsCommentsLoading(false);
      });

    return () => { isActive = false; };
  }, [normalizeCommentOptions, reset, selectedAlarm]);

  useEffect(() => {
    if (!selectedAlarm) return;
    let isActive = true;
    setIsStatsLoading(true);
    fetch(`/api/alarmes/${selectedAlarm.id}/stats`)
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (isActive) setAlarmCount30(typeof payload?.data?.count === "number" ? payload.data.count : null);
      })
      .catch(() => {
        if (isActive) setAlarmCount30(null);
      })
      .finally(() => {
        if (isActive) setIsStatsLoading(false);
      });

    return () => { isActive = false; };
  }, [selectedAlarm]);

  const acknowledgeMutation = useMutation({
    mutationFn: ({ id, commentValue }: { id: string; commentValue?: string }) => alarmsApi.acknowledge(id, commentValue),
    onSuccess: (_data, variables) => {
      const acknowledgedAlarm =
        localAlarms.find((alarm) => alarm.id === variables.id) ??
        alarms.find((alarm) => alarm.id === variables.id) ??
        null;

      const acknowledgedAlarmId = Number(variables.id);
      markAlarmAcknowledgedInPaginatedSensorsCache(queryClient, acknowledgedAlarmId);
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["alarms"] }),
        queryClient.invalidateQueries({ queryKey: ["capteurs", "paginated"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "alarmes-actives"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "alarms-count"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
      setLocalAlarms((prev) => prev.filter((alarm) => alarm.id !== variables.id));

      if (acknowledgedAlarm) {
        onStatsChange?.((prev) => {
          const next = { ...prev };

          if (acknowledgedAlarm.status === "active") {
            next.active = Math.max(next.active - 1, 0);
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("vigitemp:active-alarms", { detail: { count: next.active } }));
            }
          } else if (acknowledgedAlarm.status === "resolved") {
            next.resolved = Math.max(next.resolved - 1, 0);
          } else if (acknowledgedAlarm.status === "acknowledged") {
            next.acknowledged = Math.max(next.acknowledged - 1, 0);
          }

          next.total = next.active + next.acknowledged + next.resolved;
          return next;
        });
      }

      toast.success(t("toast.acknowledge_success"));
    },
    onError: () => toast.error(t("toast.acknowledge_error")),
  });

  const handleAcknowledge = async (id: string, commentValue?: string) => {
    await acknowledgeMutation.mutateAsync({ id, commentValue });
  };

  const handleRefresh = () => {
    startTransition(() => router.refresh());
    toast.success(t("toast.refreshed"));
  };

  const toggleTypeFilter = (type: AlarmRowType, checked: boolean) => {
    setTypeFilters((prev) => checked ? (prev.includes(type) ? prev : [...prev, type]) : prev.filter((item) => item !== type));
  };

  const refreshButton = (
    <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2" disabled={isRefreshing} data-testid="button-refresh">
      <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
      <span className="hidden sm:inline">{isRefreshing ? t("refresh.loading") : t("refresh.label")}</span>
    </Button>
  );

  const hasHiddenLocationFilter = Boolean(locationFilterId);
  const hiddenLocationFilterLabel = useMemo(() => {
    if (!locationFilterId) return null;
    const matchingAlarm = localAlarms.find((alarm) => alarm.locationId === locationFilterId);
    return matchingAlarm?.location?.name ?? locationFilterId;
  }, [localAlarms, locationFilterId]);

  const clearImplicitFilters = useCallback(() => {
    setLocationFilterId(null);
    setTypeFilters([]);
    router.replace(`/${locale}/alarmes?status=${statusFilter}`);
  }, [locale, router, statusFilter]);

  const getAlarmTypeExportLabel = (type: AlarmRowType) => {
    if (type === "high") return t("dialog.type_high");
    if (type === "low") return t("dialog.type_low");
    if (type === "no-response") return t("dialog.type_no_response");
    if (type === "sector") return t("dialog.type_sector");
    if (type === "module") return t("dialog.type_module");
    return t("dialog.type_other");
  };

  const getAlarmValueExport = (alarm: AlarmRow) => {
    if (alarm.type === "no-response" || alarm.type === "sector" || alarm.type === "module") return "-";
    const value = alarm.value ?? alarm.sensor.currentValue ?? null;
    return value === null ? "-" : `${formatMeasureValue(value)} ${alarm.sensor.unit}`;
  };

  const getThresholdsExport = (alarm: AlarmRow) => {
    const sup = alarm.sensor.maxThreshold;
    const inf = alarm.sensor.minThreshold;
    const showThresholds = hasConfiguredThresholds(alarm);
    const hasSup = showThresholds && sup !== null && sup !== undefined;
    const hasInf = showThresholds && inf !== null && inf !== undefined;
    if (!hasSup && !hasInf) return "-";
    return [
      hasSup ? t("thresholds.sup", { value: formatMeasureValue(sup), unit: alarm.sensor.unit }) : t("thresholds.sup_empty"),
      hasInf ? t("thresholds.inf", { value: formatMeasureValue(inf), unit: alarm.sensor.unit }) : t("thresholds.inf_empty"),
    ].join(" / ");
  };

  const columns: ColumnDef<AlarmRow>[] = [
    {
      accessorKey: "type",
      header: t("table.columns.type"),
      size: 60,
      meta: {
        exportLabel: t("table.columns.type"),
        exportValue: (row: AlarmRow) => getAlarmTypeExportLabel(row.type),
      },
      cell: ({ row }) => {
        const type = row.getValue("type") as AlarmRowType;
        if (type === "no-response" || type === "module") {
          return <div className="p-1.5 rounded-md w-fit bg-black/10"><WifiOff className="h-4 w-4 text-black" /></div>;
        }
        if (type === "sector") {
          return <div className="p-1.5 rounded-md w-fit bg-amber-100"><PowerOff className="h-4 w-4 text-amber-700" /></div>;
        }
        const isHigh = type === "high";
        return <div className={cn("p-1.5 rounded-md w-fit", isHigh ? "bg-destructive/10" : "bg-[#26A5DA]/10")}>{isHigh ? <ArrowUp className="h-4 w-4 text-destructive" /> : <ArrowDown className="h-4 w-4 text-[#26A5DA]" />}</div>;
      },
    },
    {
      id: "location",
      accessorFn: (row) => `${row.location.name} ${row.sensor.name}`,
      header: t("table.columns.location"),
      meta: {
        exportLabel: t("table.columns.location"),
        exportValue: (row: AlarmRow) => `${row.location.name} / ${row.sensor.name}`,
      },
      cell: ({ row }) => <div className="min-w-0"><p className="font-medium truncate">{row.original.location.name}</p><p className="text-sm text-muted-foreground truncate">{row.original.sensor.name}</p></div>,
    },
    {
      id: "lastValue",
      header: () => <div className="text-right">{t("table.columns.triggered_value")}</div>,
      meta: {
        exportLabel: t("table.columns.triggered_value"),
        exportValue: (row: AlarmRow) => getAlarmValueExport(row),
      },
      cell: ({ row }) => {
        const alarm = row.original;
        const value = alarm.type === "no-response" || alarm.type === "sector" || alarm.type === "module" ? null : (alarm.value ?? alarm.sensor.currentValue ?? null);
        return <div className="text-right font-mono font-medium">{value !== null ? `${formatMeasureValue(value)} ${alarm.sensor.unit}` : "-"}</div>;
      },
    },
    {
      id: "consignes",
      header: () => <div className="text-right">{t("table.columns.thresholds")}</div>,
      meta: {
        exportLabel: t("table.columns.thresholds"),
        exportValue: (row: AlarmRow) => getThresholdsExport(row),
      },
      cell: ({ row }) => {
        const alarm = row.original;
        const sup = alarm.sensor.maxThreshold;
        const inf = alarm.sensor.minThreshold;
        const showThresholds = hasConfiguredThresholds(alarm);
        const hasSup = showThresholds && sup !== null && sup !== undefined;
        const hasInf = showThresholds && inf !== null && inf !== undefined;
        if (!hasSup && !hasInf) return <div className="text-right font-mono text-muted-foreground">-</div>;
        return <div className="text-right font-mono text-muted-foreground"><div>{hasSup ? t("thresholds.sup", { value: formatMeasureValue(sup), unit: alarm.sensor.unit }) : t("thresholds.sup_empty")}</div><div>{hasInf ? t("thresholds.inf", { value: formatMeasureValue(inf), unit: alarm.sensor.unit }) : t("thresholds.inf_empty")}</div></div>;
      },
    },
    {
      accessorKey: "groups",
      header: t("table.columns.group"),
      size: 150,
      meta: {
        exportLabel: t("table.columns.group"),
        exportValue: (row: AlarmRow) => row.groups || "-",
      },
      cell: ({ row }) => {
        const groups = row.original.groups;
        return groups ? (
          <div className="max-w-48 text-sm" title={groups}>
            <span className="line-clamp-2">{groups}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "triggeredAt",
      header: t("table.columns.triggered_at"),
      meta: {
        exportLabel: t("table.columns.triggered_at"),
        exportValue: (row: AlarmRow) => formatDbDateTime(row.triggeredAt, { format: "dateTimeSeconds" }),
      },
      cell: ({ row }) => {
        const rawTriggeredAt = row.getValue("triggeredAt") as string | Date;
        const triggeredDate = parseDbDateTime(rawTriggeredAt);
        if (!triggeredDate) return "-";
        return <div className="flex items-center gap-1.5 text-sm"><Clock className="h-3.5 w-3.5 text-muted-foreground" /><TooltipProvider><Tooltip><TooltipTrigger asChild><span className="cursor-help">{formatDistanceToNow(triggeredDate, { addSuffix: true, locale: fr })}</span></TooltipTrigger><TooltipContent><p className="text-xs">{formatDbDateTime(rawTriggeredAt, { format: "dateTimeSeconds" })}</p></TooltipContent></Tooltip></TooltipProvider></div>;
      },
    },
    {
      accessorKey: "status",
      header: t("table.columns.status"),
      meta: {
        exportLabel: t("table.columns.status"),
        exportValue: (row: AlarmRow) => {
          if (row.status === "acknowledged") return t("status.acknowledged");
          if (row.status === "resolved") return t("status.resolved");
          return t("status.active");
        },
      },
      cell: ({ row }) => <div className="flex justify-center"><AlarmStatusBadge status={row.getValue("status") as string} /></div>,
    },
    {
      id: "actions",
      header: () => <div className="text-center">{t("table.columns.actions")}</div>,
      cell: ({ row }) => {
        const alarm = row.original;
        return (
          <div className="flex items-center justify-center gap-1">
            {alarm.comment ? (
              <Button variant="ghost" size="icon" className="h-8 w-8" title={alarm.comment} aria-label={t("table.actions.comment_aria")} type="button">
                <MessageSquare className="h-4 w-4" />
                <span className="sr-only">{alarm.comment}</span>
              </Button>
             ) : null}
            {canAcknowledgeAlarm && alarm.status === "active" ? (
              <Button variant="outline" size="sm" className="gap-2 border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 hover:text-amber-900 dark:border-amber-300/60 dark:bg-amber-300/20 dark:text-amber-100 dark:hover:bg-amber-300/30" onClick={() => {
                const fullAlarm = alarms.find((item) => item.id === alarm.id);
                if (fullAlarm) setSelectedAlarm(fullAlarm);
              }} data-testid={`button-acknowledge-${alarm.id}`}>
                {t("table.actions.acknowledge")}
              </Button>
            ) : null}
          </div>
        );
      },
    },
  ];

  const alarmsByStatus = useMemo(() => localAlarms, [localAlarms]);

  const tableData: AlarmRow[] = alarmsByStatus
    .filter((alarm) => {
      if (locationFilterId && alarm.locationId !== locationFilterId) return false;
      if (typeFilters.length === 0) return true;
      return typeFilters.some((type) => alarm.type === type);
    })
    .map((alarm) => {
      const groups = formatAlarmGroupNames(
        alarm.location.groupNames?.length
          ? alarm.location.groupNames
          : [alarm.location.siteGroup],
      );

      return {
        id: alarm.id,
        type: alarm.type,
        location: alarm.location,
        sensor: alarm.sensor,
        value: alarm.value,
        threshold: alarm.threshold,
        triggeredAt: alarm.triggeredAt,
        status: alarm.status,
        comment: alarm.comment,
        groups,
        searchText: [
          alarm.location.name,
          alarm.sensor.name,
          groups,
          alarm.status,
        ].filter(Boolean).join(" "),
      };
    });

  useEffect(() => {
    setVisibleRowCount(tableData.length);
  }, [tableData.length]);

  const statsForTabs = stats;

  const handleDialogAcknowledge = async (values: CommentFormValues) => {
    if (!selectedAlarm) return;
    try {
      await handleAcknowledge(selectedAlarm.id, values.comment || "");
      setSelectedAlarm(null);
      setSelectedCommentId("");
      reset({ comment: "" });
    } catch {}
  };

  const alarmTypeLabel = useMemo(() => {
    if (!selectedAlarm) return "-";
    if (selectedAlarm.type === "high") return t("dialog.type_high");
    if (selectedAlarm.type === "low") return t("dialog.type_low");
    if (selectedAlarm.type === "no-response") return t("dialog.type_no_response");
    if (selectedAlarm.type === "sector") return t("dialog.type_sector");
    if (selectedAlarm.type === "module") return t("dialog.type_module");
    return t("dialog.type_other");
  }, [selectedAlarm, t]);

  const formattedStart = useMemo(() => !selectedAlarm?.triggeredAt ? t("dialog.na") : formatTzDateTime(selectedAlarm.triggeredAt), [selectedAlarm, t]);
  const formattedEnd = useMemo(() => !selectedAlarm ? t("dialog.na") : !selectedAlarm.resolvedAt ? t("dialog.end_in_progress") : formatTzDateTime(selectedAlarm.resolvedAt), [selectedAlarm, t]);
  const formattedDuration = useMemo(() => {
    if (!selectedAlarm?.triggeredAt) return t("dialog.na");
    const start = parseDbDateTime(selectedAlarm.triggeredAt);
    const end = selectedAlarm.resolvedAt ? parseDbDateTime(selectedAlarm.resolvedAt) : durationNow;
    if (!start || !end) return t("dialog.na");
    return formatDistanceStrict(start, end, {
      locale: fr,
      roundingMethod: "floor",
    });
  }, [durationNow, selectedAlarm, t]);
  const focusRange = useMemo(() => {
    if (!selectedAlarm?.triggeredAt) return null;
    const start = parseDbDateTime(selectedAlarm.triggeredAt);
    const end = selectedAlarm.resolvedAt ? parseDbDateTime(selectedAlarm.resolvedAt) : new Date();
    if (!start || !end) return null;
    const padMs = 60 * 60 * 1000;
    return { from: new Date(start.getTime() - padMs), to: new Date(end.getTime() + padMs) };
  }, [selectedAlarm]);

  const resultsLabel = useMemo(() => {
    try {
      return t("table.results_with_total", {
        visible: visibleRowCount,
        total: alarmsByStatus.length,
      });
    } catch {
      return `${visibleRowCount} / ${alarmsByStatus.length}`;
    }
  }, [alarmsByStatus.length, t, visibleRowCount]);

  const cardTitle = statusFilter === "active" ? t("titles.active") : t("titles.resolved");
  const handleCloseDialog = useCallback(() => {
    setSelectedAlarm(null);
    setSelectedCommentId("");
    setShowGraph(false);
    reset({ comment: "" });
  }, [reset]);

  useEffect(() => {
    if (!selectedAlarm || selectedAlarm.resolvedAt) return;

    setDurationNow(new Date());
    const intervalId = window.setInterval(() => {
      setDurationNow(new Date());
    }, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [selectedAlarm]);

  const content = tableData.length === 0 ? (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-4 bg-linear-to-r from-primary/5 to-transparent border-b border-border/50">
        <CardTitle className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
            <Bell className="h-4 w-4" />
          </span>
          {cardTitle}
        </CardTitle>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <AlarmStatusTabs statusFilter={statusFilter} stats={statsForTabs} onStatusChange={onStatusChange} t={t} />
          <div className="flex justify-end gap-2">
            <AlarmTypeFilter
              typeFilters={typeFilters}
              onToggleType={toggleTypeFilter}
              onReset={() => setTypeFilters([])}
              t={t}
            />
            {refreshButton}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <EmptyState icon={AlertTriangle} title={statusFilter === "active" ? t("empty_state.active_title") : t("empty_state.resolved_title")} description={statusFilter === "active" ? t("empty_state.active_description") : t("empty_state.other_description")} />
      </CardContent>
    </Card>
  ) : (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-4 bg-linear-to-r from-primary/5 to-transparent border-b border-border/50">
        <CardTitle className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
            <Bell className="h-4 w-4" />
          </span>
          {cardTitle}
        </CardTitle>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <AlarmStatusTabs statusFilter={statusFilter} stats={statsForTabs} onStatusChange={onStatusChange} t={t} />
        </div>
      </CardHeader>
      <CardContent>
          {hasHiddenLocationFilter ? (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#26A5DA]/35 bg-[#26A5DA]/8 px-3 py-2 text-sm text-[#075776] dark:border-[#26A5DA]/45 dark:bg-[#26A5DA]/12 dark:text-sky-50">
              <div className="flex flex-wrap items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="font-medium">{t("filters.active_label")}</span>
                <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-[#075776] dark:bg-slate-900/40 dark:text-sky-50">
                  {t("filters.active_location", { value: hiddenLocationFilterLabel ?? locationFilterId ?? "-" })}
                </span>
                {typeFilters.length > 0 ? (
                  <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-[#075776] dark:bg-slate-900/40 dark:text-sky-50">
                    {t("filters.active_types", {
                      value: typeFilters.map((type) => t(`filter.types.${type}`)).join(", "),
                    })}
                  </span>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2 text-[#075776] hover:bg-[#26A5DA]/14 hover:text-[#075776] dark:text-sky-50 dark:hover:bg-[#26A5DA]/18"
                onClick={clearImplicitFilters}
              >
                {t("filters.clear")}
              </Button>
            </div>
          ) : null}
          <TanStackTable<AlarmRow>
            columns={columns}
            data={tableData}
          searchField="searchText"
          searchPlaceholder={t("table.search_placeholder")}
          pageSize={500}
          isLoading={isRefreshing}
          emptyMessage={t("table.empty")}
          resultsLabel={resultsLabel}
          selectedRowId={selectedAlarm?.id}
          onRowClick={(row: AlarmRow) => {
            const fullAlarm = localAlarms.find((item) => item.id === row.id);
            if (fullAlarm && canAcknowledgeAlarm) setSelectedAlarm(fullAlarm);
          }}
            toolbarRight={<div className="flex items-center gap-2"><AlarmTypeFilter typeFilters={typeFilters} onToggleType={toggleTypeFilter} onReset={() => setTypeFilters([])} t={t} />{refreshButton}</div>}
            onFilteredRowCountChange={setVisibleRowCount}
            maxHeight="calc(100dvh - 25rem)"
            headerClassName="!bg-sidebar !text-sidebar-foreground"
            headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
            tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0 [&_tbody_tr]:transition-colors [&_tbody_tr]:duration-150"
          />
      </CardContent>
    </Card>
  );

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      {content}
        <AlarmDetailsDialog
        selectedAlarm={selectedAlarm}
        open={!!selectedAlarm}
        showGraph={showGraph}
        setShowGraph={setShowGraph}
        commentOptions={commentOptions}
        isCommentsLoading={isCommentsLoading}
        selectedCommentId={selectedCommentId}
        setSelectedCommentId={setSelectedCommentId}
        setValue={setValue}
        register={register}
        errors={errors}
        comment={comment}
        handleSubmit={handleSubmit}
        handleDialogAcknowledge={handleDialogAcknowledge}
        canAcknowledgeAlarm={canAcknowledgeAlarm}
        acknowledgePending={acknowledgeMutation.isPending}
        isSubmitting={isSubmitting}
        t={t}
        alarmTypeLabel={alarmTypeLabel}
        formattedStart={formattedStart}
        formattedEnd={formattedEnd}
        formattedDuration={formattedDuration}
        isStatsLoading={isStatsLoading}
        alarmCount30={alarmCount30}
        focusRange={focusRange}
        onClose={handleCloseDialog}
      />
    </main>
  );
}
