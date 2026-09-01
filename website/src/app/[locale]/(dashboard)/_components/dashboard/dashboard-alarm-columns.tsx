import type { ColumnDef } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, Clock, MessageSquare, PowerOff, WifiOff } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Locale } from "date-fns"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDbDateTime, parseDbDateTime, serializeStoredDbDateTime } from "@/lib/date-display"
import { formatMeasureValue } from "@/lib/measurements"
import { cn } from "@/lib/utils"
import type { AlarmWithDetails } from "@/lib/api"
import { DashboardStatusBadge } from "./dashboard-status-badge"
import type { AlarmRow } from "./types"

type Translate = (key: string, values?: Record<string, string | number>) => string

const hasConfiguredThresholds = (alarm: { sensor: AlarmWithDetails["sensor"] }): boolean => {
  const sensorWithMeta = alarm.sensor as AlarmWithDetails["sensor"] & { hasThresholds?: boolean }
  return sensorWithMeta.hasThresholds !== false
}

function parseStoredAlarmDate(value: string | Date): Date | null {
  if (value instanceof Date) {
    const serialized = serializeStoredDbDateTime(value)
    return serialized ? parseDbDateTime(serialized) : null
  }

  const trimmed = value.trim()
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/i.test(trimmed)) {
    const serialized = serializeStoredDbDateTime(new Date(trimmed))
    return serialized ? parseDbDateTime(serialized) : null
  }

  return parseDbDateTime(trimmed)
}

export function buildAlarmRows(alarms: AlarmWithDetails[]): AlarmRow[] {
  return alarms.map((alarm) => ({
    id: alarm.id,
    type: alarm.type,
    location: alarm.location,
    sensor: alarm.sensor,
    value: alarm.value,
    threshold: alarm.threshold,
    triggeredAt: alarm.triggeredAt,
    status: alarm.status,
    comment: alarm.comment,
  }))
}

export function createDashboardAlarmColumns({
  t,
  dateLocale,
  canAcknowledgeAlarm,
  onSelectAlarm,
}: {
  t: Translate
  dateLocale: Locale
  canAcknowledgeAlarm: boolean
  onSelectAlarm: (alarmId: string) => void
}): ColumnDef<AlarmRow>[] {
  return [
    {
      accessorKey: "type",
      header: t("table.columns.type"),
      size: 60,
      cell: ({ row }) => {
        const type = row.getValue("type") as AlarmRow["type"]
        if (type === "no-response" || type === "module") {
          return (
            <div className="p-1.5 rounded-md w-fit bg-black/10">
              <WifiOff className="h-4 w-4 text-black" />
            </div>
          )
        }

        if (type === "sector") {
          return (
            <div className="p-1.5 rounded-md w-fit bg-amber-100">
              <PowerOff className="h-4 w-4 text-amber-700" />
            </div>
          )
        }

        const isHigh = type === "high"
        return (
          <div className={cn("p-1.5 rounded-md w-fit", isHigh ? "bg-destructive/12" : "bg-info/12")}>
            {isHigh ? (
              <ArrowUp className="h-4 w-4 text-destructive" />
            ) : (
              <ArrowDown className="h-4 w-4 text-info" />
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "location",
      header: t("table.columns.location_sensor"),
      cell: ({ row }) => {
        const alarm = row.original
        return (
          <div className="min-w-0">
            <p className="font-medium truncate">{alarm.location.name}</p>
            <p className="text-sm text-muted-foreground truncate">{alarm.sensor.name}</p>
          </div>
        )
      },
    },
    {
      id: "lastValue",
      header: () => <div className="text-right">{t("table.columns.last_value")}</div>,
      cell: ({ row }) => {
        const alarm = row.original
        const isTechnicalAlarm =
          alarm.type === "no-response" || alarm.type === "sector" || alarm.type === "module"
        const value = isTechnicalAlarm ? null : (alarm.sensor.currentValue ?? alarm.value ?? null)
        return <div className="text-right font-mono font-medium">{value !== null ? `${formatMeasureValue(value)} ${alarm.sensor.unit}` : "-"}</div>
      },
    },
    {
      id: "consignes",
      header: () => <div className="text-right">{t("table.columns.thresholds")}</div>,
      cell: ({ row }) => {
        const alarm = row.original
        const sup = alarm.sensor.maxThreshold
        const inf = alarm.sensor.minThreshold
        const showThresholds = hasConfiguredThresholds(alarm)
        return (
          <div className="text-right font-mono text-muted-foreground">
            <div>
              {showThresholds && sup !== null && sup !== undefined
                ? t("table.thresholds.upper", { value: formatMeasureValue(sup), unit: alarm.sensor.unit })
                : t("table.thresholds.upper_na")}
            </div>
            <div>
              {showThresholds && inf !== null && inf !== undefined
                ? t("table.thresholds.lower", { value: formatMeasureValue(inf), unit: alarm.sensor.unit })
                : t("table.thresholds.lower_na")}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "triggeredAt",
      header: t("table.columns.triggered"),
      cell: ({ row }) => {
        const rawTriggeredAt = row.getValue("triggeredAt") as string | Date
        const triggeredDate = parseStoredAlarmDate(rawTriggeredAt)
        if (!triggeredDate) return "-"
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
                  <p className="text-xs">{formatDbDateTime(triggeredDate, { format: "dateTimeSeconds" })}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: t("table.columns.status"),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <DashboardStatusBadge status={row.getValue("status") as string} t={t} />
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">{t("table.columns.actions")}</div>,
      cell: ({ row }) => {
        const alarm = row.original
        return (
          <div className="flex items-center justify-center gap-2">
            {alarm.comment ? (
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
            ) : null}
            {canAcknowledgeAlarm && alarm.status === "active" ? (
              <Button
                variant="outline"
                size="sm"
                className="border-amber-300 bg-amber-300 text-slate-900 hover:bg-amber-200 hover:text-slate-900 dark:border-warning dark:bg-warning/20 dark:text-warning-foreground dark:hover:bg-warning/30"
                onClick={() => onSelectAlarm(alarm.id)}
                data-testid={`button-acknowledge-${alarm.id}`}
              >
                {t("table.actions.acknowledge")}
              </Button>
            ) : null}
          </div>
        )
      },
    },
  ]
}
