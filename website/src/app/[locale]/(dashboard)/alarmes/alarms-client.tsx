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
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { alarmsApi, type AlarmWithDetails } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { ColumnDef } from "@tanstack/react-table";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

export function AlarmsClient({ alarms, statusFilter, stats, onStatusChange }: Props) {
  const t = useTranslations("alarmsPage");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isRefreshing, startTransition] = useTransition();
  const [selectedAlarm, setSelectedAlarm] = useState<AlarmWithDetails | null>(null);

  const commentSchema = z.object({
    comment: z.string().max(200, t("validation.comment_max", { max: 200 })).optional(),
  });

  type CommentFormValues = z.infer<typeof commentSchema>;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { comment: "" },
  });

  const comment = watch("comment") ?? "";

  const acknowledgeMutation = useMutation({
    mutationFn: ({ id, commentValue }: { id: string; commentValue?: string }) =>
      alarmsApi.acknowledge(id, commentValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
      toast.success(t("toast.acknowledge_success"));
      router.refresh();
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

  const statusTabs = (
    <Tabs
      value={statusFilter}
      onValueChange={(v: string) => onStatusChange(v as AlarmStatus)}
      className="w-full sm:w-auto"
    >
      <TabsList className="grid grid-cols-3 w-full sm:w-auto bg-primary/10 text-primary">
        <TabsTrigger
          value="active"
          data-testid="tab-active"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <span className="flex items-center gap-1">
            {t("tabs.active")}
            {stats.active > 0 && (
              <span className="">({stats.active})</span>
            )}
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="resolved"
          data-testid="tab-resolved"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          {t("tabs.resolved")} ({stats.resolved})
        </TabsTrigger>
        <TabsTrigger
          value="acknowledged"
          data-testid="tab-acknowledged"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          {t("tabs.acknowledged")} ({stats.acknowledged})
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );

  const columns: ColumnDef<AlarmRow>[] = [
    {
      accessorKey: "type",
      header: t("table.columns.type"),
      size: 60,
      cell: ({ row }) => {
        const isHigh = row.getValue("type") === "high";
        return (
          <div
            className={cn(
              "p-1.5 rounded-md w-fit",
              isHigh ? "bg-destructive/10" : "bg-info/10"
            )}
          >
            {isHigh ? (
              <ArrowUp className="h-4 w-4 text-destructive" />
            ) : (
              <ArrowDown className="h-4 w-4 text-info" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "location",
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
        return (
          <div className="text-right font-mono text-muted-foreground">
            <div>
              {sup !== null && sup !== undefined
                ? t("thresholds.sup", { value: sup, unit: alarm.sensor.unit })
                : t("thresholds.sup_empty")}
            </div>
            <div>
              {inf !== null && inf !== undefined
                ? t("thresholds.inf", { value: inf, unit: alarm.sensor.unit })
                : t("thresholds.inf_empty")}
            </div>
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
            <span title={format(triggeredDate, "dd/MM/yyyy HH:mm:ss", { locale: fr })}>
              {formatDistanceToNow(triggeredDate, { addSuffix: true, locale: fr })}
            </span>
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
            {alarm.status === "active" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const fullAlarm = alarms.find((item) => item.id === alarm.id);
                  if (fullAlarm) setSelectedAlarm(fullAlarm);
                }}
                data-testid={`button-acknowledge-${alarm.id}`}
              >
                {t("table.actions.acknowledge")}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const tableData: AlarmRow[] = alarms.map((alarm) => ({
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
      reset({ comment: "" });
    } catch {
      // toast already handled
    }
  };

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      {alarms.length === 0 ? (
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
            <div className="mb-4 flex justify-end">{refreshButton}</div>
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
              <div className="flex justify-end">{refreshButton}</div>
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
                const fullAlarm = alarms.find((item) => item.id === row.id);
                if (fullAlarm) setSelectedAlarm(fullAlarm);
              }}
              toolbarRight={refreshButton}
              maxHeight="calc(100dvh - 25rem)"
              headerClassName="!bg-sidebar !text-sidebar-foreground"
              headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
              tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
            />
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedAlarm} onOpenChange={() => setSelectedAlarm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              {t("dialog.title")}
            </DialogTitle>
            <DialogDescription>
              {selectedAlarm && (
                <>
                  {t("dialog.description", {
                    sensor: selectedAlarm.sensor.name,
                    location: selectedAlarm.location.name,
                  })}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{t("dialog.last_value_label")}</p>
                <p className="text-xl font-bold font-mono">
                  {selectedAlarm?.sensor.currentValue ?? selectedAlarm?.value ?? "-"} {selectedAlarm?.sensor.unit}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{t("dialog.thresholds_label")}</p>
                <p className="text-sm font-mono text-muted-foreground">
                  {t("dialog.sup_value", {
                    value: selectedAlarm?.sensor.maxThreshold ?? "-",
                    unit: selectedAlarm?.sensor.unit ?? "",
                  })}
                </p>
                <p className="text-sm font-mono text-muted-foreground">
                  {t("dialog.inf_value", {
                    value: selectedAlarm?.sensor.minThreshold ?? "-",
                    unit: selectedAlarm?.sensor.unit ?? "",
                  })}
                </p>
              </div>
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
                rows={3}
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
            <Button
              onClick={handleSubmit(handleDialogAcknowledge)}
              disabled={acknowledgeMutation.isPending || isSubmitting}
              data-testid="button-confirm-acknowledge"
            >
              {acknowledgeMutation.isPending ? t("dialog.confirming") : t("dialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
