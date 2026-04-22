"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { formatDistanceStrict } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import MonitoringDetailsModal from "@/components/monitoring-details-modal";
import { formatDbDateTime, parseDbDateTime } from "@/lib/date-display";
import { formatMeasureValue } from "@/lib/measurements";

export type AcknowledgeDialogAlarm = {
  id: string;
  locationId: string;
  locationName: string;
  sensorName: string;
  type?: "high" | "low" | "no-response" | "sector" | "ended";
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
  type?: "high" | "low" | "no-response" | "sector" | "ended"
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
  onConfirm: (alarmId: string, comment?: string) => Promise<void>;
  isConfirming?: boolean;
};

export function AlarmAcknowledgeDialog({
  open,
  alarm,
  onOpenChange,
  onConfirm,
  isConfirming = false,
}: Props) {
  const t = useTranslations("alarmsPage");
  const locale = useLocale();
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
  const [showGraph, setShowGraph] = useState(false);
  const [alarmCount30, setAlarmCount30] = useState<number | null>(null);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [alarmDetails, setAlarmDetails] = useState<AlarmDetailPayload | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

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

  useEffect(() => {
    if (!open || !alarm) return;
    let isActive = true;
    const initId = window.setTimeout(() => {
      setSelectedCommentId("");
      setAlarmCount30(null);
      setShowGraph(false);
      setAlarmDetails(null);
      setIsCommentsLoading(true);
      setIsStatsLoading(true);
      setIsDetailLoading(true);
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

    fetch(`/api/alarmes/${alarm.id}`)
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
      window.clearTimeout(initId);
    };
  }, [open, alarm]);

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
    return formatDbDateTime(resolvedAlarm.triggeredAt);
  }, [resolvedAlarm.triggeredAt]);

  const formattedEnd = useMemo(() => {
    if (!resolvedAlarm.endedAt) return t("dialog.end_in_progress");
    return formatDbDateTime(resolvedAlarm.endedAt);
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
      case "ended":
        return t("dialog.type_ended");
      default:
        return t("dialog.type_other");
    }
  }, [resolvedAlarm.type, t]);

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
            setShowGraph(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[92dvh] overflow-y-auto border-border bg-card shadow-2xl">
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

            <div className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{t("dialog.graph_label")}</p>
                <p className="text-xs text-muted-foreground">{t("dialog.graph_hint")}</p>
              </div>
              <Button type="button" variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary" onClick={() => setShowGraph((prev) => !prev)}>
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
              onClick={handleSubmit(async ({ comment: commentValue }) => {
                await onConfirm(alarm.id, commentValue);
              })}
              disabled={isConfirming || isSubmitting}
              data-testid="button-confirm-acknowledge"
            >
              {isConfirming ? t("dialog.confirming") : t("dialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showGraph ? (
        <MonitoringDetailsModal
          isOpen={showGraph}
          onClose={() => setShowGraph(false)}
          idLieu={Number(alarm.locationId)}
          nomLieu={resolvedAlarm.locationName}
          sondeNumeroSerie={resolvedAlarm.sensorName}
          consigneSup={resolvedAlarm.maxThreshold ?? null}
          consigneInf={resolvedAlarm.minThreshold ?? null}
          consigne={resolvedAlarm.maxThreshold ?? null}
          unite={resolvedAlarm.unit ?? ""}
          isSurveillanceActive={false}
        />
      ) : null}
    </>
  );
}
