"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { formatDistanceStrict } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDbDateTime, parseDbDateTime } from "@/lib/date-display";
import { formatMeasureValue } from "@/lib/measurements";
import { cn } from "@/lib/utils";

export type AcknowledgeDialogAlarm = {
  id: string;
  locationId: string;
  locationName: string;
  sensorName: string;
  type?: "high" | "low" | "no-response" | "sector" | "module" | "ended";
  currentValue?: number | null;
  value?: number | null;
  unit?: string | null;
  minThreshold?: number | null;
  maxThreshold?: number | null;
  triggeredAt?: string | Date | null;
  endedAt?: string | Date | null;
};

type AlarmDetailPayload = {
  id: number
  locationId: number | null
  locationName: string | null
  sensorName: string | null
  type?: "high" | "low" | "no-response" | "sector" | "module" | "ended"
  currentValue?: number | null
  value?: number | null
  unit?: string | null
  minThreshold?: number | null
  maxThreshold?: number | null
  triggeredAt?: string | null
  endedAt?: string | null
}

type Props = {
  open: boolean;
  alarm: AcknowledgeDialogAlarm | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (alarmIds: string[], comment?: string, options?: { closeAfter: boolean }) => Promise<void>;
  isConfirming?: boolean;
  selectionMode?: "single" | "multiple";
};

type RelatedAlarmRow = {
  id: number
  type?: AcknowledgeDialogAlarm["type"] | "temperature"
  status?: "active" | "acknowledged" | "resolved"
  timestamp?: string | null
  resolvedAt?: string | null
  currentValue?: number | null
  unit?: string | null
}

export function AlarmAcknowledgeDialog({
  open,
  alarm,
  onOpenChange,
  onConfirm,
  isConfirming = false,
  selectionMode = "multiple",
}: Props) {
  const t = useTranslations("alarmsPage");
  const locale = useLocale();
  const router = useRouter();
  const baseAlarm: AcknowledgeDialogAlarm = useMemo(
    () =>
      alarm ?? {
        id: "",
        locationId: "",
        locationName: "",
        sensorName: "",
      },
    [alarm],
  );
  const [commentOptions, setCommentOptions] = useState<{ id: number; text: string }[]>([]);
  const [selectedCommentId, setSelectedCommentId] = useState<string>("");
  const [alarmCount30, setAlarmCount30] = useState<number | null>(null);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [alarmDetails, setAlarmDetails] = useState<AlarmDetailPayload | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [relatedAlarms, setRelatedAlarms] = useState<RelatedAlarmRow[]>([]);
  const [isRelatedAlarmsLoading, setIsRelatedAlarmsLoading] = useState(false);
  const [selectedAlarmIds, setSelectedAlarmIds] = useState<string[]>([]);
  const [focusedAlarmId, setFocusedAlarmId] = useState<string | null>(null);
  const [relatedTypeFilter, setRelatedTypeFilter] = useState<string>("all");
  const alarmId = alarm?.id ?? null;
  const alarmLocationId = alarm?.locationId ?? null;

  const commentSchema = z.object({
    comment: z.string().max(200, t("validation.comment_max", { max: 200 })).optional(),
  });

  type CommentFormValues = z.infer<typeof commentSchema>;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { comment: "" },
  });

  const comment = useWatch({ control, name: "comment" }) ?? "";
  const confirmDisabled =
    isConfirming ||
    isSubmitting ||
    (selectionMode === "multiple" && selectedAlarmIds.length === 0)

  const submitAcknowledgement = (closeAfter: boolean) =>
    handleSubmit(async ({ comment: commentValue }) => {
      if (!alarm) return
      const targetAlarmIds =
        selectionMode === "single"
          ? [focusedAlarmId ?? alarm.id]
          : selectedAlarmIds.length > 0
            ? selectedAlarmIds
            : [alarm.id]

      await onConfirm(targetAlarmIds, commentValue, { closeAfter })

      if (closeAfter) return

      const acknowledgedIds = new Set(targetAlarmIds)
      const remainingAlarms = relatedAlarms.filter((row) => !acknowledgedIds.has(String(row.id)))
      const nextFocusedId = remainingAlarms[0] ? String(remainingAlarms[0].id) : null

      setRelatedAlarms(remainingAlarms)
      setFocusedAlarmId(nextFocusedId)
      setSelectedAlarmIds(nextFocusedId ? [nextFocusedId] : [])
      setSelectedCommentId("")
      reset({ comment: "" })

      if (!nextFocusedId) {
        onOpenChange(false)
      }
    })

  useEffect(() => {
    if (!open) return;

    window.dispatchEvent(new CustomEvent("vigitemp:alarm-acknowledge-dialog", { detail: { open } }));

    return () => {
      window.dispatchEvent(new CustomEvent("vigitemp:alarm-acknowledge-dialog", { detail: { open: false } }));
    };
  }, [open]);

  useEffect(() => {
    if (open) return;
    reset({ comment: "" });
    setSelectedCommentId("");
    setAlarmCount30(null);
    setAlarmDetails(null);
    setRelatedAlarms([]);
    setSelectedAlarmIds([]);
    setFocusedAlarmId(null);
    setRelatedTypeFilter("all");
  }, [open, reset]);

  useEffect(() => {
    if (!open || !alarm) return;
    let isActive = true;
    const initId = window.setTimeout(() => {
      reset({ comment: "" });
      setSelectedCommentId("");
      setAlarmCount30(null);
      setAlarmDetails(null);
      setRelatedAlarms([]);
      setSelectedAlarmIds([alarm.id]);
      setFocusedAlarmId(alarm.id);
      setRelatedTypeFilter("all");
      setIsCommentsLoading(true);
      setIsStatsLoading(true);
      setIsRelatedAlarmsLoading(true);
    }, 0);

    fetch("/api/alarmes/commentaires-acquittement")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!isActive) return;
        const data = Array.isArray(payload?.data) ? payload.data : [];
        setCommentOptions(
          data.map((item: any) => ({ id: Number(item.id), text: String(item.text ?? "") }))
        );
      })
      .catch(() => {
        if (!isActive) return;
        setCommentOptions([]);
      })
      .finally(() => {
        if (!isActive) return;
        setIsCommentsLoading(false);
      });

    fetch(`/api/alarmes/${alarm.id}/stats`)
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

    const rawLocationId = Number(alarm.locationId);
    if (selectionMode === "single") {
      setRelatedAlarms([]);
      setSelectedAlarmIds([alarm.id]);
      setFocusedAlarmId(alarm.id);
      setIsRelatedAlarmsLoading(false);
    } else if (Number.isFinite(rawLocationId) && rawLocationId > 0) {
      fetch(`/api/alarmes?locationId=${encodeURIComponent(String(rawLocationId))}&limit=200`)
        .then((res) => (res.ok ? res.json() : null))
        .then((payload) => {
          if (!isActive) return;
          const rows = Array.isArray(payload?.data?.data) ? payload.data.data : [];
          const nextRows: RelatedAlarmRow[] = rows
            .map((row: any) => ({
              id: Number(row.id),
              type: row.type,
              status: row.status,
              timestamp: row.timestamp ?? null,
              resolvedAt: row.resolvedAt ?? null,
              currentValue: row.currentValue ?? null,
              unit: row.unit ?? null,
            }))
            .filter((row: RelatedAlarmRow) => Number.isFinite(row.id) && row.status !== "acknowledged");
          setRelatedAlarms(nextRows);
          const firstSelectableId = nextRows[0]?.id ? String(nextRows[0].id) : alarm.id;
          const currentId = nextRows.some((row) => String(row.id) === alarm.id) ? alarm.id : firstSelectableId;
          setSelectedAlarmIds([currentId]);
          setFocusedAlarmId(currentId);
        })
        .catch(() => {
          if (!isActive) return;
          setRelatedAlarms([]);
          setSelectedAlarmIds([alarm.id]);
          setFocusedAlarmId(alarm.id);
        })
        .finally(() => {
          if (!isActive) return;
          setIsRelatedAlarmsLoading(false);
        });
    } else {
      setRelatedAlarms([]);
      setSelectedAlarmIds([alarm.id]);
      setFocusedAlarmId(alarm.id);
      setIsRelatedAlarmsLoading(false);
    }

    return () => {
      isActive = false;
      window.clearTimeout(initId);
    };
  }, [alarm, alarmId, alarmLocationId, open, reset, selectionMode]);

  useEffect(() => {
    if (!open) return;
    reset({ comment: "" });
    setSelectedCommentId("");
  }, [alarmId, open, reset]);

  useEffect(() => {
    if (!open || !focusedAlarmId) return;

    let isActive = true;
    setIsDetailLoading(true);

    fetch(`/api/alarmes/${focusedAlarmId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!isActive) return;
        setAlarmDetails(payload?.data ?? null);
      })
      .catch(() => {
        if (!isActive) return;
        setAlarmDetails(null);
      })
      .finally(() => {
        if (!isActive) return;
        setIsDetailLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [focusedAlarmId, open]);

  const resolvedAlarm = useMemo<AcknowledgeDialogAlarm>(() => ({
    ...baseAlarm,
    locationId: String(alarmDetails?.locationId ?? baseAlarm.locationId),
    locationName: alarmDetails?.locationName || baseAlarm.locationName,
    sensorName: alarmDetails?.sensorName || baseAlarm.sensorName,
    type: alarmDetails?.type ?? baseAlarm.type,
    currentValue: alarmDetails?.currentValue ?? baseAlarm.currentValue ?? null,
    value: alarmDetails?.value ?? baseAlarm.value ?? null,
    unit: alarmDetails?.unit ?? baseAlarm.unit ?? null,
    minThreshold: alarmDetails?.minThreshold ?? baseAlarm.minThreshold ?? null,
    maxThreshold: alarmDetails?.maxThreshold ?? baseAlarm.maxThreshold ?? null,
    triggeredAt: alarmDetails?.triggeredAt ?? baseAlarm.triggeredAt ?? null,
    endedAt: alarmDetails?.endedAt ?? baseAlarm.endedAt ?? null,
  }), [alarmDetails, baseAlarm]);

  const formattedStart = useMemo(() => {
    if (!resolvedAlarm.triggeredAt) return "-";
    return formatDbDateTime(resolvedAlarm.triggeredAt, { format: "dateTimeSeconds" });
  }, [resolvedAlarm.triggeredAt]);

  const formattedEnd = useMemo(() => {
    if (!resolvedAlarm.endedAt) return t("dialog.end_in_progress");
    return formatDbDateTime(resolvedAlarm.endedAt, { format: "dateTimeSeconds" });
  }, [resolvedAlarm.endedAt, t]);

  const formattedDuration = useMemo(() => {
    if (!resolvedAlarm.triggeredAt) return "-";
    const start = parseDbDateTime(resolvedAlarm.triggeredAt);
    if (!start || Number.isNaN(start.getTime())) return "-";
    const end = resolvedAlarm.endedAt ? parseDbDateTime(resolvedAlarm.endedAt) : new Date();
    if (!end || Number.isNaN(end.getTime())) return "-";
    return formatDistanceStrict(start, end, {
      locale: locale.toLowerCase().startsWith("fr") ? fr : undefined,
    });
  }, [locale, resolvedAlarm.endedAt, resolvedAlarm.triggeredAt]);

  const formattedCurrentValue = useMemo(() => {
    const value = resolvedAlarm.currentValue ?? resolvedAlarm.value ?? null;
    if (value === null) return "-";
    const formatted = formatMeasureValue(value, null, locale);
    return resolvedAlarm.unit ? `${formatted} ${resolvedAlarm.unit}` : formatted;
  }, [locale, resolvedAlarm.currentValue, resolvedAlarm.unit, resolvedAlarm.value]);

  const formattedThresholdSup = useMemo(() => {
    if (resolvedAlarm.maxThreshold === null || resolvedAlarm.maxThreshold === undefined) {
      return t("dialog.sup_value", { value: "-", unit: resolvedAlarm.unit ?? "" });
    }
    return t("dialog.sup_value", {
      value: formatMeasureValue(resolvedAlarm.maxThreshold, null, locale),
      unit: resolvedAlarm.unit ?? "",
    });
  }, [locale, resolvedAlarm.maxThreshold, resolvedAlarm.unit, t]);

  const formattedThresholdInf = useMemo(() => {
    if (resolvedAlarm.minThreshold === null || resolvedAlarm.minThreshold === undefined) {
      return t("dialog.inf_value", { value: "-", unit: resolvedAlarm.unit ?? "" });
    }
    return t("dialog.inf_value", {
      value: formatMeasureValue(resolvedAlarm.minThreshold, null, locale),
      unit: resolvedAlarm.unit ?? "",
    });
  }, [locale, resolvedAlarm.minThreshold, resolvedAlarm.unit, t]);

  const alarmTypeLabel = useMemo(() => {
    switch (resolvedAlarm.type) {
      case "high":
        return t("dialog.type_high");
      case "low":
        return t("dialog.type_low");
      case "no-response":
        return t("dialog.type_no_response");
      case "sector":
        return t("dialog.type_sector");
      case "module":
        return t("dialog.type_module");
      case "ended":
        return t("dialog.type_ended");
      default:
        return t("dialog.type_other");
    }
  }, [resolvedAlarm.type, t]);

  const getTypeLabel = (type: RelatedAlarmRow["type"]) => {
    switch (type) {
      case "high":
        return t("dialog.type_high");
      case "low":
        return t("dialog.type_low");
      case "no-response":
        return t("dialog.type_no_response");
      case "sector":
        return t("dialog.type_sector");
      case "module":
        return t("dialog.type_module");
      case "ended":
        return t("dialog.type_ended");
      default:
        return t("dialog.type_other");
    }
  };

  const getStatusLabel = (status: RelatedAlarmRow["status"]) => {
    switch (status) {
      case "active":
        return t("status.active");
      case "resolved":
        return t("status.resolved");
      case "acknowledged":
        return t("status.acknowledged");
      default:
        return t("dialog.na");
    }
  };

  const allRelatedAlarms = useMemo<RelatedAlarmRow[]>(
    () =>
      relatedAlarms.length > 0
        ? relatedAlarms
        : [
            {
              id: Number(baseAlarm.id),
              type: resolvedAlarm.type,
              status: "active" as const,
              timestamp: resolvedAlarm.triggeredAt ? String(resolvedAlarm.triggeredAt) : null,
              currentValue: resolvedAlarm.currentValue ?? resolvedAlarm.value ?? null,
              unit: resolvedAlarm.unit ?? null,
            },
          ],
    [baseAlarm.id, relatedAlarms, resolvedAlarm.currentValue, resolvedAlarm.triggeredAt, resolvedAlarm.type, resolvedAlarm.unit, resolvedAlarm.value],
  );

  const relatedTypeOptions = useMemo(() => {
    const types = Array.from(new Set(allRelatedAlarms.map((row) => row.type).filter(Boolean)));
    return types;
  }, [allRelatedAlarms]);

  const visibleRelatedAlarms = useMemo(() => {
    if (relatedTypeFilter === "all") {
      return allRelatedAlarms;
    }
    return allRelatedAlarms.filter((row) => row.type === relatedTypeFilter);
  }, [allRelatedAlarms, relatedTypeFilter]);

  const visibleRelatedAlarmIds = useMemo(() => visibleRelatedAlarms.map((row) => String(row.id)), [visibleRelatedAlarms]);
  const allVisibleSelected =
    visibleRelatedAlarmIds.length > 0 && visibleRelatedAlarmIds.every((id) => selectedAlarmIds.includes(id));
  const someVisibleSelected = visibleRelatedAlarmIds.some((id) => selectedAlarmIds.includes(id));

  const toggleSelectedAlarm = (alarmId: string, checked: boolean) => {
    setSelectedAlarmIds((current) => {
      if (checked) {
        return current.includes(alarmId) ? current : [...current, alarmId];
      }
      const next = current.filter((id) => id !== alarmId);
      return next.length > 0 ? next : current;
    });
  };

  const toggleAllVisibleAlarms = (checked: boolean) => {
    setSelectedAlarmIds((current) => {
      if (checked) {
        return Array.from(new Set([...current, ...visibleRelatedAlarmIds]));
      }

      const next = current.filter((id) => !visibleRelatedAlarmIds.includes(id));
      return next.length > 0 ? next : current;
    });
  };

  if (!alarm) return null;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          onOpenChange(nextOpen);
          if (!nextOpen) {
            reset({ comment: "" });
            setSelectedCommentId("");
          }
        }}
      >
        <DialogContent
          key={alarm?.id ?? "alarm-acknowledge-empty"}
          className="sm:max-w-4xl max-h-[92dvh] overflow-y-auto border-border bg-card shadow-2xl"
        >
          <DialogHeader className="pb-3 border-b border-border/50">
            <DialogTitle className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-destructive/10 text-destructive shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </span>
              {t("dialog.title")}
            </DialogTitle>
            <DialogDescription className="pl-12">
              <span className="block font-medium text-foreground/80">{alarm.locationName}</span>
              <span className="block text-muted-foreground">{alarm.sensorName}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectionMode === "multiple" ? (
            <div className="rounded-xl border border-border/60 bg-background">
              <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">{t("dialog.related_alarms_title")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("dialog.selected_alarms_count", { count: selectedAlarmIds.length })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={relatedTypeFilter} onValueChange={setRelatedTypeFilter}>
                    <SelectTrigger className="h-8 w-45">
                      <SelectValue placeholder={t("dialog.related_type_filter_placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("dialog.related_type_filter_all")}</SelectItem>
                      {relatedTypeOptions.map((type) => (
                        <SelectItem key={type} value={String(type)}>
                          {getTypeLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={visibleRelatedAlarmIds.length === 0}
                    onClick={() => toggleAllVisibleAlarms(!allVisibleSelected)}
                  >
                    {allVisibleSelected ? t("dialog.deselect_all") : t("dialog.select_all")}
                  </Button>
                  {isRelatedAlarmsLoading ? (
                    <span className="text-xs text-muted-foreground">{t("dialog.loading")}</span>
                  ) : null}
                </div>
              </div>
              <div className="max-h-56 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted/80 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="w-10 px-3 py-2 text-left">
                        <Checkbox
                          checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
                          onCheckedChange={(next) => toggleAllVisibleAlarms(next === true)}
                          aria-label={t("dialog.select_all")}
                        />
                      </th>
                      <th className="px-3 py-2 text-left">{t("dialog.alarm_column")}</th>
                      <th className="px-3 py-2 text-left">{t("dialog.status_column")}</th>
                      <th className="px-3 py-2 text-left">{t("dialog.start_label")}</th>
                      <th className="px-3 py-2 text-left">{t("dialog.last_value_label")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRelatedAlarms.map((row) => {
                      const rowId = String(row.id);
                      const checked = selectedAlarmIds.includes(rowId);
                      const isFocused = rowId === (focusedAlarmId ?? alarm.id);
                      const value =
                        row.currentValue === null || row.currentValue === undefined
                          ? t("dialog.na")
                          : `${formatMeasureValue(row.currentValue, null, locale)} ${row.unit ?? ""}`.trim();
                      return (
                        <tr
                          key={row.id}
                          className={cn(
                            "cursor-pointer border-t border-border/50 transition-colors",
                            isFocused && "bg-primary/10",
                          )}
                          onClick={() => setFocusedAlarmId(rowId)}
                        >
                          <td className="px-3 py-2 align-middle">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(next) => toggleSelectedAlarm(rowId, next === true)}
                              onClick={(event) => event.stopPropagation()}
                              aria-label={t("dialog.select_alarm_aria", { id: row.id })}
                            />
                          </td>
                          <td className="px-3 py-2 font-medium">#{row.id} - {getTypeLabel(row.type)}</td>
                          <td className="px-3 py-2 text-muted-foreground">{getStatusLabel(row.status)}</td>
                          <td className="px-3 py-2 text-muted-foreground">{row.timestamp ? formatDbDateTime(row.timestamp, { format: "dateTimeSeconds" }) : "-"}</td>
                          <td className="px-3 py-2 font-mono">{value}</td>
                        </tr>
                      );
                    })}
                    {visibleRelatedAlarms.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-6 text-center text-sm text-muted-foreground">
                          {t("dialog.related_alarms_empty")}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
            ) : null}

            <div className="grid gap-3 rounded-xl border border-border/50 bg-muted/40 p-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{t("dialog.type_label")}</p>
                <p className="text-sm font-medium">{alarmTypeLabel}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{t("dialog.last_value_label")}</p>
                <p className="text-sm font-mono font-semibold text-primary">
                  {formattedCurrentValue}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{t("dialog.start_label")}</p>
                <p className="text-sm font-medium">{formattedStart}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{t("dialog.end_label")}</p>
                <p className="text-sm font-medium">{formattedEnd}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{t("dialog.duration_label")}</p>
                <p className="text-sm font-medium">{formattedDuration}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{t("dialog.count_30_label")}</p>
                <p className="text-sm font-medium">
                  {isStatsLoading || isDetailLoading
                    ? t("dialog.loading")
                    : alarmCount30 !== null
                      ? t("dialog.count_30_value", { count: alarmCount30 })
                      : t("dialog.na")}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{t("dialog.thresholds_label")}</p>
                <p className="text-sm font-mono text-muted-foreground">
                  {formattedThresholdSup}
                </p>
                <p className="text-sm font-mono text-muted-foreground">
                  {formattedThresholdInf}
                </p>
              </div>
            </div>

            {Number(resolvedAlarm.locationId) > 0 && alarmCount30 !== null && alarmCount30 > 1 ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
                <span>{t("dialog.location_alarms_notice")}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => {
                    window.location.href = `/${locale}/alarmes?status=active&locationId=${encodeURIComponent(resolvedAlarm.locationId)}`
                  }}
                >
                  {t("dialog.view_location_alarms")}
                </Button>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{t("dialog.graph_label")}</p>
                <p className="text-xs text-muted-foreground">{t("dialog.graph_hint")}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
                onClick={() => {
                  const targetLocationId = Number(resolvedAlarm.locationId);
                  const targetAlarmId = Number(focusedAlarmId ?? alarm.id);
                  if (!Number.isFinite(targetLocationId) || targetLocationId <= 0 || !Number.isFinite(targetAlarmId) || targetAlarmId <= 0) {
                    return;
                  }
                  const targetUrl = `/${locale}/alarmes/analyse?locationId=${encodeURIComponent(String(targetLocationId))}&alarmId=${encodeURIComponent(String(targetAlarmId))}`;
                  if (typeof window !== "undefined") {
                    window.open(targetUrl, "_blank", "noopener,noreferrer");
                    return;
                  }
                  router.push(targetUrl);
                }}
              >
                {t("dialog.graph_show")}
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
              {errors.comment?.message ? (
                <p id="comment-error" className="text-sm text-destructive">
                  {String(errors.comment.message)}
                </p>
              ) : null}
              <p className="text-xs text-muted-foreground text-right">
                {t("dialog.comment_count", { count: comment.length })}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-acknowledge">
              {t("dialog.cancel")}
            </Button>
            <Button
              variant="outline"
              onClick={submitAcknowledgement(false)}
              disabled={confirmDisabled}
              data-testid="button-confirm-acknowledge-stay"
            >
              {isConfirming
                ? t("dialog.confirming")
                : selectionMode === "multiple" && selectedAlarmIds.length > 1
                  ? t("dialog.confirm_many_stay", { count: selectedAlarmIds.length })
                  : t("dialog.confirm_stay")}
            </Button>
            <Button
              onClick={submitAcknowledgement(true)}
              disabled={confirmDisabled}
              data-testid="button-confirm-acknowledge-close"
            >
              {isConfirming
                ? t("dialog.confirming")
                : selectionMode === "multiple" && selectedAlarmIds.length > 1
                  ? t("dialog.confirm_many_close", { count: selectedAlarmIds.length })
                  : t("dialog.confirm_close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
}
