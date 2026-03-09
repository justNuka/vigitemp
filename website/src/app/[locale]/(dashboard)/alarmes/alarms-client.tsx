"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceStrict, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertTriangle, ArrowDown, ArrowUp, Bell, Clock, MessageSquare, RefreshCw, WifiOff } from "lucide-react";
import { useForm } from "react-hook-form";
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
import { formatDbDateTime } from "@/lib/date-display";
import { cn } from "@/lib/utils";

import { AlarmDetailsDialog } from "./_components/alarm-details-dialog";
import { AlarmStatusBadge } from "./_components/alarm-status-badge";
import { AlarmStatusTabs, type AlarmStatus } from "./_components/alarm-status-tabs";
import { AlarmTypeFilter, type AlarmRowType } from "./_components/alarm-type-filter";

interface Props {
  alarms: AlarmWithDetails[];
  statusFilter: AlarmStatus;
  stats: {
    active: number;
    acknowledged: number;
    resolved: number;
  };
  onStatusChange: (status: AlarmStatus) => void;
}

interface AlarmRow {
  id: string;
  type: AlarmRowType;
  location: AlarmWithDetails["location"];
  sensor: AlarmWithDetails["sensor"];
  value: number;
  threshold: number;
  triggeredAt: string | Date;
  status: string;
  comment: string | null;
}

const hasConfiguredThresholds = (alarm: { sensor: AlarmWithDetails["sensor"] }): boolean => {
  const sensorWithMeta = alarm.sensor as AlarmWithDetails["sensor"] & { hasThresholds?: boolean };
  return sensorWithMeta.hasThresholds !== false;
};

export function AlarmsClient({ alarms, statusFilter, stats, onStatusChange }: Props) {
  const t = useTranslations("alarmsPage");
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = useAppAccess();
  const canAcknowledgeAlarm = hasPermission("ALARM_ACK_ACCESS");
  const [isRefreshing, startTransition] = useTransition();
  const [selectedAlarm, setSelectedAlarm] = useState<AlarmWithDetails | null>(null);
  const [localAlarms, setLocalAlarms] = useState<AlarmWithDetails[]>(alarms);
  const [typeFilters, setTypeFilters] = useState<AlarmRowType[]>([]);
  const [commentOptions, setCommentOptions] = useState<{ id: number; type: string | null; text: string }[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string>("");
  const [showGraph, setShowGraph] = useState(false);
  const [alarmCount30, setAlarmCount30] = useState<number | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const formatTzDateTime = (value: string | Date) => formatDbDateTime(value);

  useEffect(() => {
    setLocalAlarms(alarms);
  }, [alarms]);

  const commentSchema = z.object({
    comment: z.string().max(200, t("validation.comment_max", { max: 200 })).optional(),
  });

  type CommentFormValues = z.infer<typeof commentSchema>;

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { comment: "" },
  });

  const comment = watch("comment") ?? "";

  useEffect(() => {
    if (!selectedAlarm) return;
    setShowGraph(false);
    setSelectedCommentId("");
    setAlarmCount30(null);
    let isActive = true;
    setIsCommentsLoading(true);
    fetch("/api/alarmes/commentaires-acquittement")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (isActive) setCommentOptions(Array.isArray(payload?.data) ? payload.data : []);
      })
      .catch(() => {
        if (isActive) setCommentOptions([]);
      })
      .finally(() => {
        if (isActive) setIsCommentsLoading(false);
      });

    return () => { isActive = false; };
  }, [selectedAlarm]);

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
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
      setLocalAlarms((prev) => statusFilter !== "acknowledged" ? prev.filter((alarm) => alarm.id !== variables.id) : prev.map((alarm) => alarm.id === variables.id ? { ...alarm, status: "acknowledged" as const } : alarm));
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
    <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 border-primary/40" disabled={isRefreshing} data-testid="button-refresh">
      <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
      <span className="hidden sm:inline">{isRefreshing ? t("refresh.loading") : t("refresh.label")}</span>
    </Button>
  );

  const columns: ColumnDef<AlarmRow>[] = [
    {
      accessorKey: "type",
      header: t("table.columns.type"),
      size: 60,
      cell: ({ row }) => {
        const type = row.getValue("type") as AlarmRowType;
        if (type === "no-response") {
          return <div className="p-1.5 rounded-md w-fit bg-black/10"><WifiOff className="h-4 w-4 text-black" /></div>;
        }
        const isHigh = type === "high";
        return <div className={cn("p-1.5 rounded-md w-fit", isHigh ? "bg-destructive/10" : "bg-[#26A5DA]/10")}>{isHigh ? <ArrowUp className="h-4 w-4 text-destructive" /> : <ArrowDown className="h-4 w-4 text-[#26A5DA]" />}</div>;
      },
    },
    {
      id: "location",
      accessorFn: (row) => `${row.location.name} ${row.sensor.name}`,
      header: t("table.columns.location"),
      cell: ({ row }) => <div className="min-w-0"><p className="font-medium truncate">{row.original.location.name}</p><p className="text-sm text-muted-foreground truncate">{row.original.sensor.name}</p></div>,
    },
    {
      id: "lastValue",
      header: () => <div className="text-right">{t("table.columns.last_value")}</div>,
      cell: ({ row }) => {
        const alarm = row.original;
        const value = alarm.sensor.currentValue ?? alarm.value ?? null;
        return <div className="text-right font-mono font-medium">{value !== null ? `${value.toFixed(1)} ${alarm.sensor.unit}` : "-"}</div>;
      },
    },
    {
      id: "consignes",
      header: () => <div className="text-right">{t("table.columns.thresholds")}</div>,
      cell: ({ row }) => {
        const alarm = row.original;
        const sup = alarm.sensor.maxThreshold;
        const inf = alarm.sensor.minThreshold;
        const showThresholds = hasConfiguredThresholds(alarm);
        const hasSup = showThresholds && sup !== null && sup !== undefined;
        const hasInf = showThresholds && inf !== null && inf !== undefined;
        if (!hasSup && !hasInf) return <div className="text-right font-mono text-muted-foreground">-</div>;
        return <div className="text-right font-mono text-muted-foreground"><div>{hasSup ? t("thresholds.sup", { value: sup, unit: alarm.sensor.unit }) : t("thresholds.sup_empty")}</div><div>{hasInf ? t("thresholds.inf", { value: inf, unit: alarm.sensor.unit }) : t("thresholds.inf_empty")}</div></div>;
      },
    },
    {
      accessorKey: "triggeredAt",
      header: t("table.columns.triggered_at"),
      cell: ({ row }) => {
        const triggeredDate = new Date(row.getValue("triggeredAt") as string);
        return <div className="flex items-center gap-1.5 text-sm"><Clock className="h-3.5 w-3.5 text-muted-foreground" /><TooltipProvider><Tooltip><TooltipTrigger asChild><span className="cursor-help">{formatDistanceToNow(triggeredDate, { addSuffix: true, locale: fr })}</span></TooltipTrigger><TooltipContent><p className="text-xs">{formatTzDateTime(triggeredDate)}</p></TooltipContent></Tooltip></TooltipProvider></div>;
      },
    },
    { accessorKey: "status", header: t("table.columns.status"), cell: ({ row }) => <div className="flex justify-center"><AlarmStatusBadge status={row.getValue("status") as string} /></div> },
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
              <Button variant="outline" size="sm" onClick={() => {
                const fullAlarm = alarms.find((item) => item.id === alarm.id);
                if (fullAlarm) setSelectedAlarm(fullAlarm);
              }} data-testid={`button-acknowledge-${alarm.id}`} className="border-amber-300 bg-amber-300 text-slate-900 hover:bg-amber-200 hover:text-slate-900 dark:border-warning dark:bg-warning/20 dark:text-warning-foreground dark:hover:bg-warning/30">
                {t("table.actions.acknowledge")}
              </Button>
            ) : null}
          </div>
        );
      },
    },
  ];

  const tableData: AlarmRow[] = localAlarms
    .filter((alarm) => typeFilters.length === 0 || typeFilters.includes(alarm.type))
    .map((alarm) => ({
      id: alarm.id,
      type: alarm.type,
      location: alarm.location,
      sensor: alarm.sensor,
      value: alarm.value,
      threshold: alarm.threshold,
      triggeredAt: alarm.triggeredAt,
      status: alarm.status,
      comment: alarm.comment,
    }));

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
    return t("dialog.type_other");
  }, [selectedAlarm, t]);

  const formattedStart = useMemo(() => !selectedAlarm?.triggeredAt ? t("dialog.na") : formatTzDateTime(selectedAlarm.triggeredAt), [selectedAlarm, t]);
  const formattedEnd = useMemo(() => !selectedAlarm ? t("dialog.na") : !selectedAlarm.resolvedAt ? t("dialog.end_in_progress") : formatTzDateTime(selectedAlarm.resolvedAt), [selectedAlarm, t]);
  const formattedDuration = useMemo(() => {
    if (!selectedAlarm?.triggeredAt) return t("dialog.na");
    const start = new Date(selectedAlarm.triggeredAt);
    if (!selectedAlarm.resolvedAt) return formatDistanceToNow(start, { addSuffix: true, locale: fr });
    return formatDistanceStrict(start, new Date(selectedAlarm.resolvedAt), { locale: fr });
  }, [selectedAlarm, t]);
  const focusRange = useMemo(() => {
    if (!selectedAlarm?.triggeredAt) return null;
    const start = new Date(selectedAlarm.triggeredAt);
    const end = selectedAlarm.resolvedAt ? new Date(selectedAlarm.resolvedAt) : new Date(selectedAlarm.triggeredAt);
    const padMs = 60 * 60 * 1000;
    return { from: new Date(start.getTime() - padMs), to: new Date(end.getTime() + padMs) };
  }, [selectedAlarm]);

  const cardTitle = statusFilter === "active" ? t("titles.active") : statusFilter === "acknowledged" ? t("titles.acknowledged") : t("titles.resolved");

  const content = localAlarms.length === 0 ? (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-4 bg-linear-to-r from-primary/5 to-transparent border-b border-border/50">
        <CardTitle className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
            <Bell className="h-4 w-4" />
          </span>
          {cardTitle}
        </CardTitle>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <AlarmStatusTabs statusFilter={statusFilter} stats={stats} onStatusChange={onStatusChange} t={t} />
          <div className="flex justify-end">{refreshButton}</div>
        </div>
      </CardHeader>
      <CardContent>
        <EmptyState icon={AlertTriangle} title={statusFilter === "active" ? t("empty_state.active_title") : statusFilter === "acknowledged" ? t("empty_state.acknowledged_title") : t("empty_state.resolved_title")} description={statusFilter === "active" ? t("empty_state.active_description") : t("empty_state.other_description")} />
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
          <AlarmStatusTabs statusFilter={statusFilter} stats={stats} onStatusChange={onStatusChange} t={t} />
        </div>
      </CardHeader>
      <CardContent>
        <TanStackTable<AlarmRow>
          columns={columns}
          data={tableData}
          searchPlaceholder={t("table.search_placeholder")}
          pageSize={20}
          isLoading={isRefreshing}
          emptyMessage={t("table.empty")}
          selectedRowId={selectedAlarm?.id}
          onRowClick={(row: AlarmRow) => {
            const fullAlarm = localAlarms.find((item) => item.id === row.id);
            if (fullAlarm && canAcknowledgeAlarm) setSelectedAlarm(fullAlarm);
          }}
          toolbarRight={<div className="flex items-center gap-2"><AlarmTypeFilter typeFilters={typeFilters} onToggleType={toggleTypeFilter} onReset={() => setTypeFilters([])} t={t} />{refreshButton}</div>}
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
        onClose={() => setSelectedAlarm(null)}
      />
    </main>
  );
}
