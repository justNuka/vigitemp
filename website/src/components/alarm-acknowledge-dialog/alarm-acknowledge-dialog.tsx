"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { formatDistanceStrict } from "date-fns"
import { fr } from "date-fns/locale"
import { useLocale, useTranslations } from "next-intl"
import { AlertTriangle, ChevronDown } from "lucide-react"

import { useAppAccess } from "@/components/access/app-access-provider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatDbDateTime, parseDbDateTime } from "@/lib/date-display"
import { formatMeasureValue } from "@/lib/measurements"
import { cn } from "@/lib/utils"

export type AcknowledgeDialogAlarm = {
  id: string
  locationId: string
  siteName?: string | null
  groupNames?: string[]
  locationName: string
  sensorName: string
  type?: "high" | "low" | "no-response" | "sector" | "module" | "ended"
  currentValue?: number | null
  value?: number | null
  unit?: string | null
  minThreshold?: number | null
  maxThreshold?: number | null
  triggeredAt?: string | Date | null
  endedAt?: string | Date | null
}

type AlarmDetailPayload = {
  id: number
  locationId: number | null
  siteName?: string | null
  groupNames?: string[]
  locationName: string | null
  sensorName: string | null
  type?: AcknowledgeDialogAlarm["type"]
  currentValue?: number | null
  value?: number | null
  unit?: string | null
  minThreshold?: number | null
  maxThreshold?: number | null
  triggeredAt?: string | null
  endedAt?: string | null
}

type CandidateAlarmRow = {
  id: number
  locationId: number | null
  siteName: string | null
  groupNames: string[]
  locationName: string | null
  sensorName: string | null
  type?: AcknowledgeDialogAlarm["type"] | "temperature"
  status?: "active" | "acknowledged" | "resolved"
  timestamp?: string | null
  resolvedAt?: string | null
  currentValue?: number | null
  unit?: string | null
}

type Props = {
  open: boolean
  alarm: AcknowledgeDialogAlarm | null
  onOpenChange: (open: boolean) => void
  onConfirm: (alarmIds: string[], comment?: string, options?: { closeAfter: boolean }) => Promise<void>
  isConfirming?: boolean
  selectionMode?: "single" | "multiple"
  candidateLocationId?: string | number | null
  relatedAlarmsInitiallyOpen?: boolean
}

type LocaleKey = "fr" | "en"

const COPY: Record<LocaleKey, {
  site: string
  group: string
  location: string
  sensor: string
  noGroup: string
  context: string
  multiLocationForbidden: string
}> = {
  fr: {
    site: "Site",
    group: "Groupe",
    location: "Lieu",
    sensor: "Sonde",
    noGroup: "Sans groupe",
    context: "Site / Groupe / Lieu / Sonde",
    multiLocationForbidden:
      "Votre profil ne vous autorise pas à acquitter plusieurs alarmes sur plusieurs lieux. Rapprochez-vous de votre responsable VigiSensys ou d’un administrateur.",
  },
  en: {
    site: "Site",
    group: "Group",
    location: "Location",
    sensor: "Sensor",
    noGroup: "No group",
    context: "Site / Group / Location / Sensor",
    multiLocationForbidden:
      "Your profile does not allow you to acknowledge alarms across multiple locations. Contact your VigiSensys manager or an administrator.",
  },
}

function ContextLines({
  copy,
  siteName,
  groupNames,
  locationName,
  sensorName,
  compact = false,
}: {
  copy: (typeof COPY)[LocaleKey]
  siteName?: string | null
  groupNames?: string[] | null
  locationName?: string | null
  sensorName?: string | null
  compact?: boolean
}) {
  const groups = groupNames?.filter(Boolean) ?? []
  const labelClass = compact ? "text-[10px] uppercase tracking-wide text-muted-foreground" : "text-xs uppercase tracking-wide text-muted-foreground"
  const valueClass = compact ? "truncate text-xs" : "truncate text-sm font-medium text-foreground"

  return (
    <div className={cn("grid min-w-0 gap-x-3 gap-y-1", compact ? "grid-cols-[3.5rem_minmax(0,1fr)]" : "grid-cols-[4rem_minmax(0,1fr)]") }>
      <span className={labelClass}>{copy.site}</span>
      <span className={valueClass}>{siteName?.trim() || "-"}</span>
      <span className={labelClass}>{copy.group}</span>
      <span className={valueClass}>{groups.length > 0 ? groups.join(" / ") : copy.noGroup}</span>
      <span className={labelClass}>{copy.location}</span>
      <span className={valueClass}>{locationName?.trim() || "-"}</span>
      <span className={labelClass}>{copy.sensor}</span>
      <span className={valueClass}>{sensorName?.trim() || "-"}</span>
    </div>
  )
}

export function AlarmAcknowledgeDialog({
  open,
  alarm,
  onOpenChange,
  onConfirm,
  isConfirming = false,
  selectionMode = "multiple",
  candidateLocationId = null,
  relatedAlarmsInitiallyOpen = true,
}: Props) {
  const t = useTranslations("alarmsPage")
  const locale = useLocale()
  const copy = COPY[locale.toLowerCase().startsWith("fr") ? "fr" : "en"]
  const { hasPermission } = useAppAccess()
  const canAcknowledgeMultipleLocations = hasPermission("ALARM_MULTI_LOCATION_ACK_ACCESS")

  const baseAlarm = useMemo<AcknowledgeDialogAlarm>(
    () => alarm ?? { id: "", locationId: "", locationName: "", sensorName: "" },
    [alarm],
  )
  const baseLocationId = alarm?.locationId ?? ""

  const [commentOptions, setCommentOptions] = useState<{ id: number; text: string }[]>([])
  const [selectedCommentId, setSelectedCommentId] = useState("")
  const [alarmCount30, setAlarmCount30] = useState<number | null>(null)
  const [isCommentsLoading, setIsCommentsLoading] = useState(false)
  const [isStatsLoading, setIsStatsLoading] = useState(false)
  const [alarmDetails, setAlarmDetails] = useState<AlarmDetailPayload | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [candidateAlarms, setCandidateAlarms] = useState<CandidateAlarmRow[]>([])
  const [isCandidatesLoading, setIsCandidatesLoading] = useState(false)
  const [selectedAlarmIds, setSelectedAlarmIds] = useState<string[]>([])
  const [focusedAlarmId, setFocusedAlarmId] = useState<string | null>(null)
  const [relatedTypeFilter, setRelatedTypeFilter] = useState("all")
  const [relatedAlarmsOpen, setRelatedAlarmsOpen] = useState(relatedAlarmsInitiallyOpen)

  const commentSchema = z.object({
    comment: z.string().max(200, t("validation.comment_max", { max: 200 })).optional(),
  })
  type CommentFormValues = z.infer<typeof commentSchema>

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
  })

  const comment = useWatch({ control, name: "comment" }) ?? ""
  const confirmDisabled = isConfirming || isSubmitting || (selectionMode === "multiple" && selectedAlarmIds.length === 0)

  useEffect(() => {
    if (!open) return
    window.dispatchEvent(new CustomEvent("vigitemp:alarm-acknowledge-dialog", { detail: { open: true } }))
    return () => {
      window.dispatchEvent(new CustomEvent("vigitemp:alarm-acknowledge-dialog", { detail: { open: false } }))
    }
  }, [open])

  useEffect(() => {
    if (!open || !alarm) return
    let isActive = true

    const initTimer = window.setTimeout(() => {
      reset({ comment: "" })
      setSelectedCommentId("")
      setAlarmCount30(null)
      setAlarmDetails(null)
      setCandidateAlarms([])
      setSelectedAlarmIds([alarm.id])
      setFocusedAlarmId(alarm.id)
      setRelatedTypeFilter("all")
      setRelatedAlarmsOpen(relatedAlarmsInitiallyOpen)
      setIsCommentsLoading(true)
      setIsStatsLoading(true)
      setIsCandidatesLoading(selectionMode === "multiple")
    }, 0)

    fetch("/api/alarmes/commentaires-acquittement")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!isActive) return
        const data = Array.isArray(payload?.data) ? payload.data : []
        setCommentOptions(data.map((item: { id?: number; text?: string }) => ({ id: Number(item.id), text: String(item.text ?? "") })))
      })
      .catch(() => {
        if (isActive) setCommentOptions([])
      })
      .finally(() => {
        if (isActive) setIsCommentsLoading(false)
      })

    fetch(`/api/alarmes/${alarm.id}/stats`)
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!isActive) return
        setAlarmCount30(typeof payload?.data?.count === "number" ? payload.data.count : null)
      })
      .catch(() => {
        if (isActive) setAlarmCount30(null)
      })
      .finally(() => {
        if (isActive) setIsStatsLoading(false)
      })

    if (selectionMode === "multiple") {
      const candidateQuery = candidateLocationId
        ? `?locationId=${encodeURIComponent(String(candidateLocationId))}`
        : ""
      fetch(`/api/alarmes/acknowledgement-candidates${candidateQuery}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((payload) => {
          if (!isActive) return
          const rows = Array.isArray(payload?.data) ? payload.data as CandidateAlarmRow[] : []
          const currentExists = rows.some((row) => String(row.id) === alarm.id)
          const fallbackRow: CandidateAlarmRow = {
            id: Number(alarm.id),
            locationId: Number(alarm.locationId) || null,
            siteName: alarm.siteName ?? null,
            groupNames: alarm.groupNames ?? [],
            locationName: alarm.locationName,
            sensorName: alarm.sensorName,
            type: alarm.type,
            status: "active",
            timestamp: alarm.triggeredAt ? String(alarm.triggeredAt) : null,
            currentValue: alarm.currentValue ?? alarm.value ?? null,
            unit: alarm.unit ?? null,
          }
          setCandidateAlarms(currentExists ? rows : [fallbackRow, ...rows])
          setSelectedAlarmIds([alarm.id])
          setFocusedAlarmId(alarm.id)
        })
        .catch(() => {
          if (!isActive) return
          setCandidateAlarms([])
          setSelectedAlarmIds([alarm.id])
          setFocusedAlarmId(alarm.id)
        })
        .finally(() => {
          if (isActive) setIsCandidatesLoading(false)
        })
    } else {
      setIsCandidatesLoading(false)
    }

    return () => {
      isActive = false
      window.clearTimeout(initTimer)
    }
  }, [alarm, candidateLocationId, open, relatedAlarmsInitiallyOpen, reset, selectionMode])

  useEffect(() => {
    if (!open || !focusedAlarmId) return
    let isActive = true

    const loadingTimer = window.setTimeout(() => setIsDetailLoading(true), 0)
    fetch(`/api/alarmes/${focusedAlarmId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (isActive) setAlarmDetails(payload?.data ?? null)
      })
      .catch(() => {
        if (isActive) setAlarmDetails(null)
      })
      .finally(() => {
        if (isActive) setIsDetailLoading(false)
      })

    return () => {
      isActive = false
      window.clearTimeout(loadingTimer)
    }
  }, [focusedAlarmId, open])

  const focusedCandidate = useMemo(
    () => candidateAlarms.find((row) => String(row.id) === (focusedAlarmId ?? alarm?.id ?? "")) ?? null,
    [alarm?.id, candidateAlarms, focusedAlarmId],
  )

  const resolvedAlarm = useMemo<AcknowledgeDialogAlarm>(() => ({
    ...baseAlarm,
    locationId: String(alarmDetails?.locationId ?? focusedCandidate?.locationId ?? baseAlarm.locationId),
    siteName: alarmDetails?.siteName ?? focusedCandidate?.siteName ?? baseAlarm.siteName ?? null,
    groupNames: alarmDetails?.groupNames ?? focusedCandidate?.groupNames ?? baseAlarm.groupNames ?? [],
    locationName: alarmDetails?.locationName || focusedCandidate?.locationName || baseAlarm.locationName,
    sensorName: alarmDetails?.sensorName || focusedCandidate?.sensorName || baseAlarm.sensorName,
    type: alarmDetails?.type ?? focusedCandidate?.type as AcknowledgeDialogAlarm["type"] ?? baseAlarm.type,
    currentValue: alarmDetails?.currentValue ?? focusedCandidate?.currentValue ?? baseAlarm.currentValue ?? null,
    value: alarmDetails?.value ?? baseAlarm.value ?? null,
    unit: alarmDetails?.unit ?? focusedCandidate?.unit ?? baseAlarm.unit ?? null,
    minThreshold: alarmDetails?.minThreshold ?? baseAlarm.minThreshold ?? null,
    maxThreshold: alarmDetails?.maxThreshold ?? baseAlarm.maxThreshold ?? null,
    triggeredAt: alarmDetails?.triggeredAt ?? focusedCandidate?.timestamp ?? baseAlarm.triggeredAt ?? null,
    endedAt: alarmDetails?.endedAt ?? focusedCandidate?.resolvedAt ?? baseAlarm.endedAt ?? null,
  }), [alarmDetails, baseAlarm, focusedCandidate])

  const formattedStart = useMemo(() => {
    if (!resolvedAlarm.triggeredAt) return "-"
    return formatDbDateTime(resolvedAlarm.triggeredAt, { format: "dateTimeSeconds" })
  }, [resolvedAlarm.triggeredAt])

  const formattedEnd = useMemo(() => {
    if (!resolvedAlarm.endedAt) return t("dialog.end_in_progress")
    return formatDbDateTime(resolvedAlarm.endedAt, { format: "dateTimeSeconds" })
  }, [resolvedAlarm.endedAt, t])

  const formattedDuration = useMemo(() => {
    if (!resolvedAlarm.triggeredAt) return "-"
    const start = parseDbDateTime(resolvedAlarm.triggeredAt)
    if (!start || Number.isNaN(start.getTime())) return "-"
    const end = resolvedAlarm.endedAt ? parseDbDateTime(resolvedAlarm.endedAt) : new Date()
    if (!end || Number.isNaN(end.getTime())) return "-"
    return formatDistanceStrict(start, end, { locale: locale.toLowerCase().startsWith("fr") ? fr : undefined })
  }, [locale, resolvedAlarm.endedAt, resolvedAlarm.triggeredAt])

  const formattedCurrentValue = useMemo(() => {
    const value = resolvedAlarm.currentValue ?? resolvedAlarm.value ?? null
    if (value === null) return "-"
    const formatted = formatMeasureValue(value, null, locale)
    return resolvedAlarm.unit ? `${formatted} ${resolvedAlarm.unit}` : formatted
  }, [locale, resolvedAlarm.currentValue, resolvedAlarm.unit, resolvedAlarm.value])

  const formattedThresholdSup = useMemo(() => {
    if (resolvedAlarm.maxThreshold === null || resolvedAlarm.maxThreshold === undefined) {
      return t("dialog.sup_value", { value: "-", unit: resolvedAlarm.unit ?? "" })
    }
    return t("dialog.sup_value", {
      value: formatMeasureValue(resolvedAlarm.maxThreshold, null, locale),
      unit: resolvedAlarm.unit ?? "",
    })
  }, [locale, resolvedAlarm.maxThreshold, resolvedAlarm.unit, t])

  const formattedThresholdInf = useMemo(() => {
    if (resolvedAlarm.minThreshold === null || resolvedAlarm.minThreshold === undefined) {
      return t("dialog.inf_value", { value: "-", unit: resolvedAlarm.unit ?? "" })
    }
    return t("dialog.inf_value", {
      value: formatMeasureValue(resolvedAlarm.minThreshold, null, locale),
      unit: resolvedAlarm.unit ?? "",
    })
  }, [locale, resolvedAlarm.minThreshold, resolvedAlarm.unit, t])

  const getTypeLabel = (type: CandidateAlarmRow["type"]) => {
    switch (type) {
      case "high": return t("dialog.type_high")
      case "low": return t("dialog.type_low")
      case "no-response": return t("dialog.type_no_response")
      case "sector": return t("dialog.type_sector")
      case "module": return t("dialog.type_module")
      case "ended": return t("dialog.type_ended")
      default: return t("dialog.type_other")
    }
  }

  const getStatusLabel = (status: CandidateAlarmRow["status"]) => {
    switch (status) {
      case "active": return t("status.active")
      case "resolved": return t("status.resolved")
      case "acknowledged": return t("status.acknowledged")
      default: return t("dialog.na")
    }
  }

  const alarmTypeLabel = getTypeLabel(resolvedAlarm.type)
  const relatedTypeOptions = useMemo(
    () => Array.from(new Set(candidateAlarms.map((row) => row.type).filter(Boolean))),
    [candidateAlarms],
  )
  const visibleCandidates = useMemo(
    () => relatedTypeFilter === "all" ? candidateAlarms : candidateAlarms.filter((row) => row.type === relatedTypeFilter),
    [candidateAlarms, relatedTypeFilter],
  )
  const focusedCandidateId = focusedAlarmId ?? alarm?.id ?? ""
  const relatedCandidates = visibleCandidates.filter((row) => String(row.id) !== String(focusedCandidateId))
  const isSelectable = (row: CandidateAlarmRow) =>
    canAcknowledgeMultipleLocations || String(row.locationId ?? "") === baseLocationId
  const selectableVisibleIds = relatedCandidates.filter(isSelectable).map((row) => String(row.id))
  const allVisibleSelected = selectableVisibleIds.length > 0 && selectableVisibleIds.every((id) => selectedAlarmIds.includes(id))
  const someVisibleSelected = selectableVisibleIds.some((id) => selectedAlarmIds.includes(id))
  const hasForbiddenCrossLocationRows =
    !canAcknowledgeMultipleLocations && candidateAlarms.some((row) => String(row.locationId ?? "") !== baseLocationId)

  const toggleSelectedAlarm = (row: CandidateAlarmRow, checked: boolean) => {
    if (!isSelectable(row)) return
    const alarmId = String(row.id)
    setSelectedAlarmIds((current) => {
      if (checked) return current.includes(alarmId) ? current : [...current, alarmId]
      const next = current.filter((id) => id !== alarmId)
      return next.length > 0 ? next : current
    })
  }

  const toggleAllVisibleAlarms = (checked: boolean) => {
    setSelectedAlarmIds((current) => {
      if (checked) return Array.from(new Set([...current, ...selectableVisibleIds]))
      const next = current.filter((id) => !selectableVisibleIds.includes(id))
      return next.length > 0 ? next : current
    })
  }

  const submitAcknowledgement = (closeAfter: boolean) =>
    handleSubmit(async ({ comment: commentValue }) => {
      if (!alarm) return
      const targetAlarmIds = selectionMode === "single"
        ? [focusedAlarmId ?? alarm.id]
        : selectedAlarmIds.length > 0 ? selectedAlarmIds : [alarm.id]

      await onConfirm(targetAlarmIds, commentValue, { closeAfter })
      if (closeAfter) return

      const acknowledgedIds = new Set(targetAlarmIds)
      const remaining = candidateAlarms.filter((row) => !acknowledgedIds.has(String(row.id)))
      const nextSelectable = remaining.find(isSelectable) ?? null
      setCandidateAlarms(remaining)
      setFocusedAlarmId(nextSelectable ? String(nextSelectable.id) : null)
      setSelectedAlarmIds(nextSelectable ? [String(nextSelectable.id)] : [])
      setSelectedCommentId("")
      reset({ comment: "" })

      if (!nextSelectable) onOpenChange(false)
    })

  if (!alarm) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) {
          reset({ comment: "" })
          setSelectedCommentId("")
        }
      }}
    >
      <DialogContent
        key={alarm.id}
        className="max-h-[92dvh] overflow-y-auto border-border bg-card shadow-2xl sm:max-w-5xl"
      >
        <DialogHeader className="border-b border-border/50 pb-3">
          <DialogTitle className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </span>
            {t("dialog.title")}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="pl-12">
              <ContextLines
                copy={copy}
                siteName={resolvedAlarm.siteName}
                groupNames={resolvedAlarm.groupNames}
                locationName={resolvedAlarm.locationName}
                sensorName={resolvedAlarm.sensorName}
              />
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 rounded-xl border border-primary/40 bg-primary/5 p-4 shadow-sm md:grid-cols-2">
            <div className="md:col-span-2">
              <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                {t("dialog.focused_alarm_label", { id: focusedCandidateId })}
              </span>
            </div>
            <div>
              <p className="mb-0.5 text-xs uppercase tracking-wide text-muted-foreground">{t("dialog.type_label")}</p>
              <p className="text-sm font-medium">{alarmTypeLabel}</p>
            </div>
            <div>
              <p className="mb-0.5 text-xs uppercase tracking-wide text-muted-foreground">{t("dialog.last_value_label")}</p>
              <p className="text-sm font-mono font-semibold text-primary">{formattedCurrentValue}</p>
            </div>
            <div>
              <p className="mb-0.5 text-xs uppercase tracking-wide text-muted-foreground">{t("dialog.start_label")}</p>
              <p className="text-sm font-medium">{formattedStart}</p>
            </div>
            <div>
              <p className="mb-0.5 text-xs uppercase tracking-wide text-muted-foreground">{t("dialog.end_label")}</p>
              <p className="text-sm font-medium">{formattedEnd}</p>
            </div>
            <div>
              <p className="mb-0.5 text-xs uppercase tracking-wide text-muted-foreground">{t("dialog.duration_label")}</p>
              <p className="text-sm font-medium">{formattedDuration}</p>
            </div>
            <div>
              <p className="mb-0.5 text-xs uppercase tracking-wide text-muted-foreground">{t("dialog.count_30_label")}</p>
              <p className="text-sm font-medium">
                {isStatsLoading || isDetailLoading
                  ? t("dialog.loading")
                  : alarmCount30 !== null
                    ? t("dialog.count_30_value", { count: alarmCount30 })
                    : t("dialog.na")}
              </p>
            </div>
            <div>
              <p className="mb-0.5 text-xs uppercase tracking-wide text-muted-foreground">{t("dialog.thresholds_label")}</p>
              <p className="text-sm font-mono text-muted-foreground">{formattedThresholdSup}</p>
              <p className="text-sm font-mono text-muted-foreground">{formattedThresholdInf}</p>
            </div>
          </div>

          {selectionMode === "multiple" ? (
            <div className="rounded-xl border border-border/60 bg-background">
              <div className="flex flex-col gap-3 border-b border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">{t("dialog.other_alarms_title", { count: relatedCandidates.length })}</p>
                  <p className="text-xs text-muted-foreground">{t("dialog.selected_alarms_count", { count: selectedAlarmIds.length })}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRelatedAlarmsOpen((current) => !current)}
                  >
                    <ChevronDown className={cn("mr-1.5 h-4 w-4 transition-transform", relatedAlarmsOpen && "rotate-180")} />
                    {relatedAlarmsOpen ? t("dialog.other_alarms_hide") : t("dialog.other_alarms_show")}
                  </Button>
                  {relatedAlarmsOpen ? (
                    <>
                      <Select value={relatedTypeFilter} onValueChange={setRelatedTypeFilter}>
                        <SelectTrigger className="h-8 w-45">
                          <SelectValue placeholder={t("dialog.related_type_filter_placeholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t("dialog.related_type_filter_all")}</SelectItem>
                          {relatedTypeOptions.map((type) => (
                            <SelectItem key={String(type)} value={String(type)}>{getTypeLabel(type)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={selectableVisibleIds.length === 0}
                        onClick={() => toggleAllVisibleAlarms(!allVisibleSelected)}
                      >
                        {allVisibleSelected ? t("dialog.deselect_all") : t("dialog.select_all")}
                      </Button>
                      {isCandidatesLoading ? <span className="text-xs text-muted-foreground">{t("dialog.loading")}</span> : null}
                    </>
                  ) : null}
                </div>
              </div>

              {relatedAlarmsOpen && hasForbiddenCrossLocationRows ? (
                <div className="mx-4 mt-3 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{copy.multiLocationForbidden}</p>
                </div>
              ) : null}

              <div className={cn("max-h-64 overflow-auto", !relatedAlarmsOpen && "hidden")}>
                <table className="w-full min-w-[880px] text-sm">
                  <thead className="sticky top-0 bg-muted/90 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="w-10 px-3 py-2 text-left">
                        <Checkbox
                          checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
                          disabled={selectableVisibleIds.length === 0}
                          onCheckedChange={(next) => toggleAllVisibleAlarms(next === true)}
                          aria-label={t("dialog.select_all")}
                        />
                      </th>
                      <th className="min-w-72 px-3 py-2 text-left">{copy.context}</th>
                      <th className="px-3 py-2 text-left">{t("dialog.alarm_column")}</th>
                      <th className="px-3 py-2 text-left">{t("dialog.status_column")}</th>
                      <th className="px-3 py-2 text-left">{t("dialog.start_label")}</th>
                      <th className="px-3 py-2 text-left">{t("dialog.last_value_label")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatedCandidates.map((row) => {
                      const rowId = String(row.id)
                      const checked = selectedAlarmIds.includes(rowId)
                      const selectable = isSelectable(row)
                      const focused = rowId === (focusedAlarmId ?? alarm.id)
                      const value = row.currentValue === null || row.currentValue === undefined
                        ? t("dialog.na")
                        : `${formatMeasureValue(row.currentValue, null, locale)} ${row.unit ?? ""}`.trim()

                      return (
                        <tr
                          key={row.id}
                          className={cn(
                            "cursor-pointer border-t border-border/50 transition-colors hover:bg-muted/40",
                            focused && "bg-primary/10",
                            !selectable && "bg-muted/20 opacity-55",
                          )}
                          onClick={() => setFocusedAlarmId(rowId)}
                        >
                          <td className="px-3 py-2 align-middle">
                            <Checkbox
                              checked={checked}
                              disabled={!selectable}
                              onCheckedChange={(next) => toggleSelectedAlarm(row, next === true)}
                              onClick={(event) => event.stopPropagation()}
                              aria-label={t("dialog.select_alarm_aria", { id: row.id })}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <ContextLines
                              compact
                              copy={copy}
                              siteName={row.siteName}
                              groupNames={row.groupNames}
                              locationName={row.locationName}
                              sensorName={row.sensorName}
                            />
                          </td>
                          <td className="px-3 py-2 font-medium">#{row.id} - {getTypeLabel(row.type)}</td>
                          <td className="px-3 py-2 text-muted-foreground">{getStatusLabel(row.status)}</td>
                          <td className="px-3 py-2 text-muted-foreground">{row.timestamp ? formatDbDateTime(row.timestamp, { format: "dateTimeSeconds" }) : "-"}</td>
                          <td className="px-3 py-2 font-mono">{value}</td>
                        </tr>
                      )
                    })}
                    {!isCandidatesLoading && relatedCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-sm text-muted-foreground">{t("dialog.related_alarms_empty")}</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

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
                const targetLocationId = Number(resolvedAlarm.locationId)
                const targetAlarmId = Number(focusedAlarmId ?? alarm.id)
                if (!Number.isFinite(targetLocationId) || targetLocationId <= 0 || !Number.isFinite(targetAlarmId) || targetAlarmId <= 0) return
                const targetUrl = `/${locale}/alarmes/analyse?locationId=${encodeURIComponent(String(targetLocationId))}&alarmId=${encodeURIComponent(String(targetAlarmId))}&source=acknowledgement`
                window.open(targetUrl, "_blank", "noopener,noreferrer")
              }}
            >
              {t("dialog.graph_show")}
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="comment-template">{t("dialog.comment_select_label")}</label>
            <Select
              value={selectedCommentId}
              onValueChange={(value) => {
                setSelectedCommentId(value)
                const selected = commentOptions.find((item) => String(item.id) === value)
                if (selected) setValue("comment", selected.text, { shouldDirty: true, shouldTouch: true })
              }}
              disabled={isCommentsLoading}
            >
              <SelectTrigger id="comment-template">
                <SelectValue placeholder={t("dialog.comment_select_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {commentOptions.length === 0 ? (
                  <SelectItem value="empty" disabled>{t("dialog.comment_select_empty")}</SelectItem>
                ) : commentOptions.map((option) => (
                  <SelectItem key={option.id} value={String(option.id)}>{option.text}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">{t("dialog.comment_label")}</label>
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
              <p id="comment-error" className="text-sm text-destructive">{String(errors.comment.message)}</p>
            ) : null}
            <p className="text-right text-xs text-muted-foreground">{t("dialog.comment_count", { count: comment.length })}</p>
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
  )
}
