"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Clock,
  Filter,
  MessageSquare,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import { alarmsApi, type AlarmWithDetails } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceStrict, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocale, useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MonitoringDetailsModal from "@/components/monitoring-details-modal";
import { useAppAccess } from "@/components/access/app-access-provider";
import { formatDbDateTime } from "@/lib/date-display";

type AlarmStatus = "active" | "acknowledged" | "resolved";

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
  type: "high" | "low" | "no-response" | "ended";
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
  const [typeFilters, setTypeFilters] = useState<AlarmRow["type"][]>([]);
  const formatTzDateTime = (value: string | Date) => formatDbDateTime(value);
  const [commentOptions, setCommentOptions] = useState<
    { id: number; type: string | null; text: string }[]
  >([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string>("");
  const [showGraph, setShowGraph] = useState(false);
  const [alarmCount30, setAlarmCount30] = useState<number | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  useEffect(() => {
    setLocalAlarms(alarms);
  }, [alarms]);

  const commentSchema = z.object({
    comment: z.string().max(200, t("validation.comment_max", { max: 200 })).optional(),
  });

  type CommentFormValues = z.infer<typeof commentSchema>;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>({
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
        if (!isActive) return;
        const data = Array.isArray(payload?.data) ? payload.data : [];
        setCommentOptions(data);
      })
      .catch(() => {
        if (!isActive) return;
        setCommentOptions([]);
      })
      .finally(() => {
        if (!isActive) return;
        setIsCommentsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [selectedAlarm]);
  useEffect(() => {
    if (!selectedAlarm) return;
    let isActive = true;
    setIsStatsLoading(true);
    fetch(`/api/alarmes/${selectedAlarm.id}/stats`)
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!isActive) return;
        setAlarmCount30(typeof payload?.data?.count === "number" ? payload.data.count : null);
      })
      .catch(() => {
        if (!isActive) return;
        setAlarmCount30(null);
      })
      .finally(() => {
        if (!isActive) return;
        setIsStatsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [selectedAlarm]);

  const acknowledgeMutation = useMutation({
    mutationFn: ({ id, commentValue }: { id: string; commentValue?: string }) =>
      alarmsApi.acknowledge(id, commentValue),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
      setLocalAlarms((prev) => {
        if (statusFilter !== "acknowledged") {
          return prev.filter((alarm) => alarm.id !== variables.id);
        }
        return prev.map((alarm) =>
          alarm.id === variables.id
            ? { ...alarm, status: "acknowledged" as const }
            : alarm
        );
      });
      toast.success(t("toast.acknowledge_success"));
    },
    onError: () => {
      toast.error(t("toast.acknowledge_error"));
    },
  });

  const handleAcknowledge = async (id: string, commentValue?: string) => {
    await acknowledgeMutation.mutateAsync({ id, commentValue });
  };

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
    toast.success(t("toast.refreshed"));
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


  const toggleTypeFilter = (type: AlarmRow["type"], checked: boolean) => {
    setTypeFilters((prev) => {
      if (checked) {
        return prev.includes(type) ? prev : [...prev, type];
      }
      return prev.filter((item) => item !== type);
    });
  };

  const filterButton = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 border-primary/40"
          data-testid="button-filter-type"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">{t("filters.type_label")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t("filters.type_label")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={typeFilters.length === 0}
          onSelect={(e) => e.preventDefault()}
          onCheckedChange={(checked) => {
            if (checked) setTypeFilters([]);
          }}
        >
          {t("filters.all")}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={typeFilters.includes("high")}
          onSelect={(e) => e.preventDefault()}
          onCheckedChange={(checked) => toggleTypeFilter("high", checked === true)}
        >
          {t("filters.high")}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={typeFilters.includes("low")}
          onSelect={(e) => e.preventDefault()}
          onCheckedChange={(checked) => toggleTypeFilter("low", checked === true)}
        >
          {t("filters.low")}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={typeFilters.includes("no-response")}
          onSelect={(e) => e.preventDefault()}
          onCheckedChange={(checked) => toggleTypeFilter("no-response", checked === true)}
        >
          {t("filters.no_response")}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={typeFilters.includes("ended")}
          onSelect={(e) => e.preventDefault()}
          onCheckedChange={(checked) => toggleTypeFilter("ended", checked === true)}
        >
          {t("filters.ended")}
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const activeTabDisabled = stats.active === 0 && statusFilter !== "active";
  const resolvedTabDisabled = stats.resolved === 0 && statusFilter !== "resolved";
  const acknowledgedTabDisabled = stats.acknowledged === 0 && statusFilter !== "acknowledged";

  const statusTabs = (
    <Tabs
      value={statusFilter}
      onValueChange={(v: string) => onStatusChange(v as AlarmStatus)}
      className="w-full sm:w-auto"
    >
      <TabsList className="grid grid-cols-3 w-full sm:w-auto bg-primary/10 text-primary">
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <TabsTrigger
                value="active"
                data-testid="tab-active"
                disabled={activeTabDisabled}
                className={cn(
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  activeTabDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <span className="flex items-center gap-1">
                  {t("tabs.active")}
                  {stats.active > 0 && <span className="">({stats.active})</span>}
                </span>
              </TabsTrigger>
            </span>
          </TooltipTrigger>
          {activeTabDisabled ? <TooltipContent>{t("tabs.empty_tooltip")}</TooltipContent> : null}
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <TabsTrigger
                value="resolved"
                data-testid="tab-resolved"
                disabled={resolvedTabDisabled}
                className={cn(
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  resolvedTabDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {t("tabs.resolved")} ({stats.resolved})
              </TabsTrigger>
            </span>
          </TooltipTrigger>
          {resolvedTabDisabled ? <TooltipContent>{t("tabs.empty_tooltip")}</TooltipContent> : null}
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <TabsTrigger
                value="acknowledged"
                data-testid="tab-acknowledged"
                disabled={acknowledgedTabDisabled}
                className={cn(
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  acknowledgedTabDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {t("tabs.acknowledged")} ({stats.acknowledged})
              </TabsTrigger>
            </span>
          </TooltipTrigger>
          {acknowledgedTabDisabled ? <TooltipContent>{t("tabs.empty_tooltip")}</TooltipContent> : null}
        </Tooltip>
      </TabsList>
    </Tabs>
  );

  const columns: ColumnDef<AlarmRow>[] = [
    {
      accessorKey: "type",
      header: t("table.columns.type"),
      size: 60,
      cell: ({ row }) => {
        const type = row.getValue("type") as AlarmRow["type"];
        if (type === "no-response") {
          return (
            <div className="p-1.5 rounded-md w-fit bg-black/10">
              <WifiOff className="h-4 w-4 text-black" />
            </div>
          );
        }

        const isHigh = type === "high";
        return (
          <div
            className={cn(
              "p-1.5 rounded-md w-fit",
              isHigh ? "bg-destructive/10" : "bg-[#26A5DA]/10"
            )}
          >
            {isHigh ? (
              <ArrowUp className="h-4 w-4 text-destructive" />
            ) : (
              <ArrowDown className="h-4 w-4 text-[#26A5DA]" />
            )}
          </div>
        );
      },
    },
    {
      id: "location",
      accessorFn: (row) => `${row.location.name} ${row.sensor.name}`,
      header: t("table.columns.location"),
      cell: ({ row }) => {
        const alarm = row.original;
        return (
          <div className="min-w-0">
            <p className="font-medium truncate">{alarm.location.name}</p>
            <p className="text-sm text-muted-foreground truncate">
              {alarm.sensor.name}
            </p>
          </div>
        );
      },
    },
        {
      id: "lastValue",
          header: () => <div className="text-right">{t("table.columns.last_value")}</div>,
      cell: ({ row }) => {
        const alarm = row.original;
        const value = alarm.sensor.currentValue ?? alarm.value ?? null;
        return (
          <div className="text-right font-mono font-medium">
            {value !== null ? `${value.toFixed(1)} ${alarm.sensor.unit}` : "-"}
          </div>
        );
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

        if (!hasSup && !hasInf) {
          return <div className="text-right font-mono text-muted-foreground">-</div>;
        }

        return (
          <div className="text-right font-mono text-muted-foreground">
            <div>{hasSup ? t("thresholds.sup", { value: sup, unit: alarm.sensor.unit }) : t("thresholds.sup_empty")}</div>
            <div>{hasInf ? t("thresholds.inf", { value: inf, unit: alarm.sensor.unit }) : t("thresholds.inf_empty")}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "triggeredAt",
      header: t("table.columns.triggered_at"),
      cell: ({ row }) => {
        const triggeredDate = new Date(row.getValue("triggeredAt") as string);
        return (
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">
                    {formatDistanceToNow(triggeredDate, { addSuffix: true, locale: fr })}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{formatTzDateTime(triggeredDate)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: t("table.columns.status"),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <AlarmStatusBadge status={row.getValue("status") as string} />
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">{t("table.columns.actions")}</div>,
      cell: ({ row }) => {
        const alarm = row.original;
        return (
          <div className="flex items-center justify-center gap-1">
            {alarm.comment && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title={alarm.comment}
                aria-label={t("table.actions.comment_aria")}
                type="button"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="sr-only">{alarm.comment}</span>
              </Button>
            )}
            {canAcknowledgeAlarm && alarm.status === "active" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const fullAlarm = alarms.find((item) => item.id === alarm.id);
                  if (fullAlarm && canAcknowledgeAlarm) setSelectedAlarm(fullAlarm);
                }}
                data-testid={`button-acknowledge-${alarm.id}`}
                className="border-amber-300 bg-amber-300 text-slate-900 hover:bg-amber-200 hover:text-slate-900 dark:border-warning dark:bg-warning/20 dark:text-warning-foreground dark:hover:bg-warning/30"
              >
                {t("table.actions.acknowledge")}
              </Button>
            )}
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
    } catch {
      // toast already handled
    }
  };

  const alarmTypeLabel = useMemo(() => {
    if (!selectedAlarm) return "-";
    if (selectedAlarm.type === "high") return t("dialog.type_high");
    if (selectedAlarm.type === "low") return t("dialog.type_low");
    if (selectedAlarm.type === "no-response") return t("dialog.type_no_response");
    return t("dialog.type_other");
  }, [selectedAlarm, t]);

  const formattedStart = useMemo(() => {
    if (!selectedAlarm?.triggeredAt) return t("dialog.na");
    return formatTzDateTime(selectedAlarm.triggeredAt);
  }, [selectedAlarm, t]);

  const formattedEnd = useMemo(() => {
    if (!selectedAlarm) return t("dialog.na");
    if (!selectedAlarm.resolvedAt) return t("dialog.end_in_progress");
    return formatTzDateTime(selectedAlarm.resolvedAt);
  }, [selectedAlarm, t]);

  const formattedDuration = useMemo(() => {
    if (!selectedAlarm?.triggeredAt) return t("dialog.na");
    const start = new Date(selectedAlarm.triggeredAt);
    if (!selectedAlarm.resolvedAt) {
      return formatDistanceToNow(start, { addSuffix: true, locale: fr });
    }
    const end = new Date(selectedAlarm.resolvedAt);
    return formatDistanceStrict(start, end, { locale: fr });
  }, [selectedAlarm, t]);

  const focusRange = useMemo(() => {
    if (!selectedAlarm?.triggeredAt) return null;
    const start = new Date(selectedAlarm.triggeredAt);
    const end = selectedAlarm.resolvedAt ? new Date(selectedAlarm.resolvedAt) : new Date(selectedAlarm.triggeredAt);
    const padMs = 60 * 60 * 1000;
    return {
      from: new Date(start.getTime() - padMs),
      to: new Date(end.getTime() + padMs),
    };
  }, [selectedAlarm]);

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      {localAlarms.length === 0 ? (
        <Card>
          <CardHeader className="space-y-4">
            <CardTitle>
              {statusFilter === "active" && t("titles.active")}
              {statusFilter === "acknowledged" && t("titles.acknowledged")}
              {statusFilter === "resolved" && t("titles.resolved")}
            </CardTitle>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {statusTabs}
              <div className="flex justify-end">{refreshButton}</div>
            </div>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={AlertTriangle}
              title={
                statusFilter === "active"
                  ? t("empty_state.active_title")
                  : statusFilter === "acknowledged"
                  ? t("empty_state.acknowledged_title")
                  : t("empty_state.resolved_title")
              }
              description={
                statusFilter === "active"
                  ? t("empty_state.active_description")
                  : t("empty_state.other_description")
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="space-y-4">
            <CardTitle>
              {statusFilter === "active" && t("titles.active")}
              {statusFilter === "acknowledged" && t("titles.acknowledged")}
              {statusFilter === "resolved" && t("titles.resolved")}
            </CardTitle>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {statusTabs}
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
              toolbarRight={<div className="flex items-center gap-2">{filterButton}{refreshButton}</div>}
              maxHeight="calc(100dvh - 25rem)"
              headerClassName="!bg-sidebar !text-sidebar-foreground"
              headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
              tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
            />
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedAlarm} onOpenChange={() => setSelectedAlarm(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[92dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              {t("dialog.title")}
            </DialogTitle>
            {selectedAlarm ? (
              <DialogDescription>
                <span className="block">
                  {t("dialog.location_label")}: {selectedAlarm.location.name}
                </span>
                <span className="block">
                  {t("dialog.sensor_label")}: {selectedAlarm.sensor.name}
                </span>
              </DialogDescription>
            ) : null}
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs uppercase text-muted-foreground">{t("dialog.type_label")}</p>
                <p className="text-sm font-medium">{alarmTypeLabel}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">{t("dialog.last_value_label")}</p>
                <p className="text-sm font-mono font-semibold">
                  {selectedAlarm?.sensor.currentValue ?? selectedAlarm?.value ?? "-"} {selectedAlarm?.sensor.unit}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">{t("dialog.start_label")}</p>
                <p className="text-sm font-medium">{formattedStart}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">{t("dialog.end_label")}</p>
                <p className="text-sm font-medium">{formattedEnd}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">{t("dialog.duration_label")}</p>
                <p className="text-sm font-medium">{formattedDuration}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">{t("dialog.count_30_label")}</p>
                <p className="text-sm font-medium">
                  {isStatsLoading
                    ? t("dialog.loading")
                    : alarmCount30 !== null
                      ? t("dialog.count_30_value", { count: alarmCount30 })
                      : t("dialog.na")}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">{t("dialog.thresholds_label")}</p>
                <p className="text-sm font-mono text-muted-foreground">
                  {selectedAlarm && hasConfiguredThresholds(selectedAlarm)
                    ? t("dialog.sup_value", {
                        value: selectedAlarm.sensor.maxThreshold ?? "-",
                        unit: selectedAlarm.sensor.unit ?? "",
                      })
                    : "-"}
                </p>
                <p className="text-sm font-mono text-muted-foreground">
                  {selectedAlarm && hasConfiguredThresholds(selectedAlarm)
                    ? t("dialog.inf_value", {
                        value: selectedAlarm.sensor.minThreshold ?? "-",
                        unit: selectedAlarm.sensor.unit ?? "",
                      })
                    : "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-md border border-dashed border-border px-3 py-2">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{t("dialog.graph_label")}</p>
                <p className="text-xs text-muted-foreground">{t("dialog.graph_hint")}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowGraph((prev) => !prev)}
              >
                {showGraph ? t("dialog.graph_hide") : t("dialog.graph_show")}
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="comment-template">
                {t("dialog.comment_select_label")}
              </label>
              <Select
                value={selectedCommentId}
                onValueChange={(value) => {
                  setSelectedCommentId(value);
                  const selected = commentOptions.find((item) => String(item.id) === value);
                  if (selected) {
                    setValue("comment", selected.text, { shouldDirty: true, shouldTouch: true });
                  }
                }}
                disabled={isCommentsLoading}
              >
                <SelectTrigger id="comment-template">
                  <SelectValue placeholder={t("dialog.comment_select_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {commentOptions.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      {t("dialog.comment_select_empty")}
                    </SelectItem>
                  ) : (
                    commentOptions.map((option) => (
                      <SelectItem key={option.id} value={String(option.id)}>
                        {option.text}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="comment" className="text-sm font-medium">
                {t("dialog.comment_label")}
              </label>
              <Textarea
                id="comment"
                placeholder={t("dialog.comment_placeholder")}
                {...register("comment")}
                maxLength={200}
                rows={4}
                aria-invalid={!!errors.comment}
                aria-describedby={errors.comment ? "comment-error" : undefined}
                data-testid="input-alarm-comment"
              />
              {errors.comment?.message && (
                <p id="comment-error" className="text-sm text-destructive">
                  {String(errors.comment.message)}
                </p>
              )}
              <p className="text-xs text-muted-foreground text-right">
                {t("dialog.comment_count", { count: comment.length })}
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedAlarm(null)}
              data-testid="button-cancel-acknowledge"
            >
              {t("dialog.cancel")}
            </Button>
            {canAcknowledgeAlarm ? (
              <Button
                onClick={handleSubmit(handleDialogAcknowledge)}
                disabled={acknowledgeMutation.isPending || isSubmitting}
                data-testid="button-confirm-acknowledge"
              >
                {acknowledgeMutation.isPending ? t("dialog.confirming") : t("dialog.confirm")}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedAlarm && showGraph ? (
        <MonitoringDetailsModal
          isOpen={showGraph}
          onClose={() => setShowGraph(false)}
          idLieu={Number(selectedAlarm.locationId)}
          nomLieu={selectedAlarm.location.name}
          sondeNumeroSerie={selectedAlarm.sensor.name}
          consigneSup={selectedAlarm.sensor.maxThreshold ?? null}
          consigneInf={selectedAlarm.sensor.minThreshold ?? null}
          consigne={selectedAlarm.threshold ?? null}
          unite={selectedAlarm.sensor.unit}
          isSurveillanceActive={false}
          initialRange={focusRange ?? undefined}
        />
      ) : null}
    </main>
  );
}

function AlarmStatusBadge({ status }: { status: string }) {
  const t = useTranslations("alarmsPage");
  const configs: Record<
    string,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    active: { label: t("status.active"), variant: "destructive" },
    acknowledged: { label: t("status.acknowledged"), variant: "secondary" },
    resolved: { label: t("status.resolved"), variant: "outline" },
  };

  const config = configs[status] || configs.active;

  return (
    <Badge variant={config.variant} className="whitespace-nowrap">
      {config.label}
    </Badge>
  );
}




