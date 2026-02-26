"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SensorCard } from "@/components/sensor-card";
import { MiniChart } from "@/components/mini-chart";
import { Link } from "@/i18n/navigation";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Clock,
  MessageSquare,
  Thermometer,
  TrendingUp,
} from "lucide-react";
import { alarmsApi, type AlarmWithDetails, type Measurement, type SensorWithLocation } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { ColumnDef } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppTimezone } from "@/components/timezone-provider";
import { AlarmAcknowledgeDialog } from "@/components/alarm-acknowledge-dialog";
import { markAlarmAcknowledgedInPaginatedSensorsCache } from "@/lib/surveillance-cache";
import { useAppAccess } from "@/components/access/app-access-provider";

interface DashboardClientProps {
  criticalSensors: SensorWithLocation[];
  activeAlarms: AlarmWithDetails[];
  sensorOverview: SensorWithLocation[];
  totalActiveAlarms: number;
  trendCountLast7d: number;
  trendMeasurements: Measurement[];
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

/**
 * Composant client pour les parties interactives du dashboard
 * Affiche alarmes actives, capteurs critiques, et aperçu des sondes
 */
export function DashboardClient({
  criticalSensors,
  activeAlarms,
  sensorOverview,
  totalActiveAlarms,
  trendCountLast7d,
  trendMeasurements,
}: DashboardClientProps) {
  const t = useTranslations("dashboardClient");
  const locale = useLocale();
  const dateLocale = locale.toLowerCase().startsWith("fr") ? fr : enUS;
  const localeTag = locale.toLowerCase().startsWith("fr") ? "fr-FR" : locale;
  const timezone = useAppTimezone();
  const formatTzDateTime = (value: string | Date) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString(localeTag, {
      timeZone: timezone,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const queryClient = useQueryClient();
  const { hasPermission } = useAppAccess();
  const canAcknowledgeAlarm = hasPermission("ALARM_ACK_ACCESS");
  const [localAlarms, setLocalAlarms] = useState(activeAlarms);
  const [activeCount, setActiveCount] = useState(totalActiveAlarms);
  const [selectedAlarm, setSelectedAlarm] = useState<AlarmWithDetails | null>(null);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  useEffect(() => {
    setLocalAlarms(activeAlarms);
    setActiveCount(totalActiveAlarms);
  }, [activeAlarms, totalActiveAlarms]);

  const handleAcknowledge = async (alarmId: string, commentValue: string) => {
    try {
      await alarmsApi.acknowledge(alarmId, commentValue);
      setLocalAlarms((prev) => prev.filter((alarm) => alarm.id !== alarmId));
      const acknowledgedId = Number(alarmId);
      if (Number.isFinite(acknowledgedId)) {
        markAlarmAcknowledgedInPaginatedSensorsCache(queryClient, acknowledgedId);
      }
      setActiveCount((prev) => {
        const next = Math.max(prev - 1, 0);
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("vigitemp:active-alarms", {
              detail: { count: next },
            }),
          );
        }
        return next;
      });
      toast.success(t("toast.ack_success"));
    } catch (error) {
      console.error("Acknowledge alarm error:", error);
      toast.error(t("toast.ack_error"));
    }
  };

  const displayedAlarms = localAlarms.slice(0, 5);

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
              isHigh ? "bg-destructive/12" : "bg-info/12"
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
      header: t("table.columns.location_sensor"),
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
        return (
          <div className="text-right font-mono text-muted-foreground">
            <div>
              {showThresholds && sup !== null && sup !== undefined
                ? t("table.thresholds.upper", { value: sup, unit: alarm.sensor.unit })
                : t("table.thresholds.upper_na")}
            </div>
            <div>
              {showThresholds && inf !== null && inf !== undefined
                ? t("table.thresholds.lower", { value: inf, unit: alarm.sensor.unit })
                : t("table.thresholds.lower_na")}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "triggeredAt",
      header: t("table.columns.triggered"),
      cell: ({ row }) => {
        const triggeredDate = new Date(row.getValue("triggeredAt") as string);
        return (
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">
                    {formatDistanceToNow(triggeredDate, { addSuffix: true, locale: dateLocale })}
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
          <AlarmStatusBadge status={row.getValue("status") as string} t={t} />
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">{t("table.columns.actions")}</div>,
      cell: ({ row }) => {
        const alarm = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            {alarm.comment && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title={alarm.comment}
                aria-label={t("table.actions.comment")}
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
                className="border-amber-300 bg-amber-300 text-slate-900 hover:bg-amber-200 hover:text-slate-900 dark:border-warning dark:bg-warning/20 dark:text-warning-foreground dark:hover:bg-warning/30"
                onClick={() => {
                  const fullAlarm = displayedAlarms.find((item) => item.id === alarm.id);
                  if (fullAlarm && canAcknowledgeAlarm) setSelectedAlarm(fullAlarm);
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

  const tableData: AlarmRow[] = displayedAlarms.map((alarm) => ({
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
  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section alarmes actives (2 colonnes) */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t("active_alarms.title")}
              {activeCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {activeCount}
                </Badge>
              )}
            </h2>
            <Link href="alarmes">
              <Button variant="ghost" size="sm" className="gap-1">
                {t("active_alarms.view_all")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <Card className="bg-white/90 border-slate-200 shadow-md dark:bg-card dark:border-border">
            <CardContent className="p-0">
              <TanStackTable<AlarmRow>
                columns={columns}
                data={tableData}
                searchPlaceholder={undefined}
                pageSize={5}
                isLoading={false}
                emptyMessage={t("active_alarms.empty")}
                selectedRowId={selectedAlarm?.id}
                onRowClick={(row: AlarmRow) => {
                  const fullAlarm = displayedAlarms.find((item) => item.id === row.id);
                  if (fullAlarm && canAcknowledgeAlarm) setSelectedAlarm(fullAlarm);
                }}
                showSearch={false}
                showPagination={false}
                containerClassName="border-slate-200"
                headerClassName="!bg-slate-800 text-white"
                headerCellClassName="!bg-slate-800 !text-white [&_svg]:!text-white !border-slate-700"
                bodyClassName="[&_tr:nth-child(odd)]:bg-white [&_tr:nth-child(even)]:bg-slate-50/70 dark:[&_tr:nth-child(odd)]:bg-muted/30 dark:[&_tr:nth-child(even)]:bg-background"
                tableClassName="text-slate-900 dark:text-card-foreground"
                toolbarClassName="rounded-lg border border-slate-200 bg-white/80 px-3 py-2 shadow-sm"
              />
            </CardContent>
          </Card>
        </section>

        {/* Section tendance récente (1 colonne) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t("trend.title")}
            </h2>
          </div>

          <Card className="bg-white/90 border-slate-200 shadow-md dark:bg-card dark:border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("trend.subtitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MiniChart
                measurements={trendMeasurements}
                height={120}
                className="rounded-lg overflow-hidden"
              />
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("trend.count", { count: trendCountLast7d })}
                </span>
                <Link href="surveillance">
                  <Button variant="ghost" size="sm" className="gap-1 -mr-2">
                    {t("trend.details")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <AlarmAcknowledgeDialog
        open={canAcknowledgeAlarm && !!selectedAlarm}
        alarm={
          selectedAlarm
            ? {
                id: selectedAlarm.id,
                locationId: selectedAlarm.locationId,
                locationName: selectedAlarm.location.name,
                sensorName: selectedAlarm.sensor.name,
                type: selectedAlarm.type,
                currentValue: selectedAlarm.sensor.currentValue,
                value: selectedAlarm.value,
                unit: selectedAlarm.sensor.unit,
                minThreshold: selectedAlarm.sensor.minThreshold,
                maxThreshold: selectedAlarm.sensor.maxThreshold,
                triggeredAt: selectedAlarm.triggeredAt,
                endedAt: selectedAlarm.resolvedAt,
              }
            : null
        }
        onOpenChange={(open) => {
          if (!open) setSelectedAlarm(null);
        }}
        onConfirm={async (alarmId, commentValue) => {
          await handleAcknowledge(alarmId, commentValue ?? "");
          setSelectedAlarm(null);
        }}
        isConfirming={isAcknowledging}
      />
    </main>
  );
}

function AlarmStatusBadge({ status, t }: { status: string; t: ReturnType<typeof useTranslations> }) {
  const configs: Record<
    string,
    { label: string; className: string }
  > = {
    active: {
      label: t("status.active"),
      className:
        "bg-red-500/90 text-white border-transparent dark:bg-destructive/12 dark:text-destructive-foreground dark:border-destructive/30",
    },
    acknowledged: {
      label: t("status.acknowledged"),
      className:
        "bg-slate-200 text-slate-700 border-transparent dark:bg-muted dark:text-muted-foreground",
    },
    resolved: {
      label: t("status.resolved"),
      className:
        "bg-slate-100 text-slate-600 border-slate-200 dark:bg-transparent dark:text-muted-foreground",
    },
  };

  const config = configs[status] || configs.active;

  return (
    <Badge className={cn("whitespace-nowrap", config.className)}>
      {config.label}
    </Badge>
  );
}



