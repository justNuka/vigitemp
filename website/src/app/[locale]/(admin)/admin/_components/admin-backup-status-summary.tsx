"use client"

import { useLocale, useTranslations } from "next-intl"

import { useAppTimezone } from "@/components/timezone-provider"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type {
  BackupRecord,
  BackupSecondaryCopyState,
  BackupSummary,
} from "@/types/backup-types"

type DisplayState =
  | BackupRecord["etat"]
  | BackupSecondaryCopyState
  | "none"

function statusBadgeClass(state: DisplayState) {
  if (state === "success") {
    return "bg-emerald-600 text-white hover:bg-emerald-600"
  }
  if (state === "failed") {
    return "bg-destructive text-destructive-foreground hover:bg-destructive"
  }
  if (state === "in_progress") {
    return "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300"
  }
  if (state === "pending") {
    return "bg-sky-100 text-sky-800 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300"
  }
  return "bg-muted text-muted-foreground hover:bg-muted"
}

export function AdminBackupStatusSummary({
  summary,
  compact = false,
}: {
  summary: BackupSummary | null | undefined
  compact?: boolean
}) {
  const t = useTranslations("adminDashboard.backup")
  const locale = useLocale()
  const timezone = useAppTimezone()

  const primary = summary?.latestRun ?? null
  const secondary = summary?.secondaryCopy ?? null
  const primaryState: DisplayState = primary?.etat ?? "none"
  const secondaryState: DisplayState = secondary?.etat ?? "unknown"

  const formatTimestamp = (value: string | null | undefined) => {
    if (!value) return t("last.none")
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return t("last.none")
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "short",
      timeStyle: "medium",
      timeZone: timezone,
    }).format(date)
  }

  const stateLabel = (state: DisplayState) => t(`states.${state}` as never)

  const robocopyMessage = () => {
    const code = secondary?.robocopyCode
    if (code === null || code === undefined) {
      if (secondaryState === "not_configured") return t("secondary.not_configured_description")
      if (secondaryState === "not_run") return t("secondary.not_run_description")
      if (secondaryState === "pending") return t("secondary.pending_description")
      if (secondaryState === "in_progress") return t("secondary.in_progress_description")
      if (secondaryState === "unknown") return t("secondary.unknown_description")
      return null
    }

    if (code >= 0 && code <= 16) {
      return t(`robocopy.codes.${code}` as never)
    }

    return t("robocopy.codes.other", { code })
  }

  const secondaryMessage = robocopyMessage()

  return (
    <div className={cn("space-y-2.5", compact && "space-y-2")}>
      <div className="rounded-md border border-border/60 bg-muted/20 p-2.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">{t("primary.label")}</span>
          <Badge className={statusBadgeClass(primaryState)}>{stateLabel(primaryState)}</Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("last.label")}: {formatTimestamp(primary?.dateHeure)}
        </p>
        <p
          className="mt-1 truncate font-mono text-[11px] text-muted-foreground"
          title={summary?.storagePath ?? ""}
        >
          {summary?.storagePath || t("log.unavailable")}
        </p>
      </div>

      <div className="rounded-md border border-border/60 bg-muted/20 p-2.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">{t("secondary.label")}</span>
          <Badge className={statusBadgeClass(secondaryState)}>{stateLabel(secondaryState)}</Badge>
        </div>

        {secondary?.configured && secondary.path ? (
          <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground" title={secondary.path}>
            {secondary.path}
          </p>
        ) : null}

        {secondaryMessage ? (
          <p className={cn("mt-1 text-xs text-muted-foreground", secondaryState === "failed" && "text-destructive")}>
            {secondary?.robocopyCode !== null && secondary?.robocopyCode !== undefined
              ? `${t("robocopy.code", { code: secondary.robocopyCode })} — `
              : ""}
            {secondaryMessage}
          </p>
        ) : null}
      </div>
    </div>
  )
}
