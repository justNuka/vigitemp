"use client"

import { CopyCheck, FolderOpen, HardDrive } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { AdminStatusPill, type AdminStatusTone } from "./admin-status-pill"
import { useAppTimezone } from "@/components/timezone-provider"
import { cn } from "@/lib/utils"
import type {
  BackupRecord,
  BackupSecondaryCopyState,
  BackupSummary,
} from "@/types/backup-types"

type DisplayState = BackupRecord["etat"] | BackupSecondaryCopyState | "none"

const stateTone: Record<DisplayState, AdminStatusTone> = {
  success: "ok",
  failed: "critical",
  in_progress: "warning",
  pending: "info",
  not_run: "neutral",
  not_configured: "neutral",
  unknown: "neutral",
  none: "neutral",
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

  const secondaryMessage = (() => {
    const code = secondary?.robocopyCode
    if (code === null || code === undefined) {
      if (secondaryState === "not_configured") return t("secondary.not_configured_description")
      if (secondaryState === "not_run") return t("secondary.not_run_description")
      if (secondaryState === "pending") return t("secondary.pending_description")
      if (secondaryState === "in_progress") return t("secondary.in_progress_description")
      if (secondaryState === "unknown") return t("secondary.unknown_description")
      return null
    }

    const text = code >= 0 && code <= 16
      ? t(`robocopy.codes.${code}` as never)
      : t("robocopy.codes.other", { code })

    return `${t("robocopy.code", { code })} — ${text}`
  })()

  return (
    <div className={cn("flex flex-col gap-3", compact && "gap-2")}>
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <HardDrive className="h-3.5 w-3.5" aria-hidden />
            {t("primary.label")}
          </p>
          <AdminStatusPill tone={stateTone[primaryState]} pulse={primaryState === "in_progress"}>
            {t(`states.${primaryState}` as never)}
          </AdminStatusPill>
        </div>
        <p className="mt-1.5 text-[11px] text-[hsl(var(--subtle-foreground))]">{t("last.label")}</p>
        <p className="num text-base font-semibold leading-6 text-foreground">{formatTimestamp(primary?.dateHeure)}</p>

        {!compact ? (
          <p
            className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"
            title={summary?.storagePath ?? undefined}
          >
            <FolderOpen className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--subtle-foreground))]" aria-hidden />
            <span className="num truncate">{summary?.storagePath || t("log.unavailable")}</span>
          </p>
        ) : null}
      </div>

      <div className="rounded-md border border-border/70 bg-[hsl(var(--surface-muted)/0.65)] px-2.5 py-2">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <CopyCheck className="h-3.5 w-3.5" aria-hidden />
            {t("secondary.label")}
          </p>
          <AdminStatusPill tone={stateTone[secondaryState]} pulse={secondaryState === "in_progress"}>
            {t(`states.${secondaryState}` as never)}
          </AdminStatusPill>
        </div>

        {secondary?.configured && secondary.path && !compact ? (
          <p className="num mt-1 truncate text-xs text-muted-foreground" title={secondary.path}>
            {secondary.path}
          </p>
        ) : null}

        {secondaryMessage ? (
          <p
            className={cn(
              "mt-1 text-xs leading-4 text-muted-foreground",
              secondaryState === "failed" && "text-[hsl(var(--status-critical))]",
            )}
          >
            {secondaryMessage}
          </p>
        ) : null}
      </div>
    </div>
  )
}
