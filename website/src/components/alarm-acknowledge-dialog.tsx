"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
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
import { formatDbDateTime } from "@/lib/date-display";

export type AcknowledgeDialogAlarm = {
  id: string;
  locationId: string;
  locationName: string;
  sensorName: string;
  type?: "high" | "low" | "no-response" | "ended";
  currentValue?: number | null;
  value?: number | null;
  unit?: string | null;
  minThreshold?: number | null;
  maxThreshold?: number | null;
  triggeredAt?: string | Date | null;
  endedAt?: string | Date | null;
};

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
const [commentOptions, setCommentOptions] = useState<{ id: number; text: string }[]>([]);
  const [selectedCommentId, setSelectedCommentId] = useState<string>("");
  const [showGraph, setShowGraph] = useState(false);
  const [alarmCount30, setAlarmCount30] = useState<number | null>(null);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

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
    if (!open || !alarm) return;
    let isActive = true;
    setSelectedCommentId("");
    setAlarmCount30(null);
    setShowGraph(false);

    setIsCommentsLoading(true);
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

    setIsStatsLoading(true);
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

    return () => {
      isActive = false;
    };
  }, [open, alarm]);

  const formattedStart = useMemo(() => {
    if (!alarm?.triggeredAt) return "-";
    return formatDbDateTime(alarm.triggeredAt);
  }, [alarm?.triggeredAt]);

  const formattedEnd = useMemo(() => {
    if (!alarm?.endedAt) return "-";
    return formatDbDateTime(alarm.endedAt);
  }, [alarm?.endedAt]);

  const formattedDuration = useMemo(() => {
    if (!alarm?.triggeredAt) return "-";
    const start = new Date(alarm.triggeredAt);
    if (Number.isNaN(start.getTime())) return "-";
    const end = alarm.endedAt ? new Date(alarm.endedAt) : new Date();
    if (Number.isNaN(end.getTime())) return "-";
    return formatDistanceStrict(start, end, {
      locale: locale.toLowerCase().startsWith("fr") ? fr : undefined,
    });
  }, [alarm?.endedAt, alarm?.triggeredAt, locale]);

  const alarmTypeLabel = useMemo(() => {
    switch (alarm?.type) {
      case "high":
        return t("dialog.type_high");
      case "low":
        return t("dialog.type_low");
      case "no-response":
        return t("dialog.type_no_response");
      case "ended":
        return t("dialog.type_other");
      default:
        return t("dialog.na");
    }
  }, [alarm?.type, t]);

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
                  {alarm.currentValue ?? alarm.value ?? "-"} {alarm.unit ?? ""}
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
                  {isStatsLoading
                    ? t("dialog.loading")
                    : alarmCount30 !== null
                      ? t("dialog.count_30_value", { count: alarmCount30 })
                      : t("dialog.na")}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{t("dialog.thresholds_label")}</p>
                <p className="text-sm font-mono text-muted-foreground">
                  {t("dialog.sup_value", { value: alarm.maxThreshold ?? "-", unit: alarm.unit ?? "" })}
                </p>
                <p className="text-sm font-mono text-muted-foreground">
                  {t("dialog.inf_value", { value: alarm.minThreshold ?? "-", unit: alarm.unit ?? "" })}
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
          nomLieu={alarm.locationName}
          sondeNumeroSerie={alarm.sensorName}
          consigneSup={alarm.maxThreshold ?? null}
          consigneInf={alarm.minThreshold ?? null}
          consigne={alarm.maxThreshold ?? null}
          unite={alarm.unit ?? ""}
          isSurveillanceActive={false}
        />
      ) : null}
    </>
  );
}
