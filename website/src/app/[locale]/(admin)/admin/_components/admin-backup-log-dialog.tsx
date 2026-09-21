"use client"

import { CheckCircle2, CircleDot, Info, ScrollText, XCircle } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { useAppTimezone } from "@/components/timezone-provider"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { BackupLogEntry, BackupSummary } from "@/types/backup-types"

function LogLevelIcon({ level }: { level: BackupLogEntry["level"] }) {
  if (level === "success") return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
  if (level === "error") return <XCircle className="h-4 w-4 text-destructive" />
  if (level === "section") return <CircleDot className="h-4 w-4 text-violet-600" />
  return <Info className="h-4 w-4 text-muted-foreground" />
}

export function AdminBackupLogDialog({
  open,
  onOpenChange,
  summary,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  summary: BackupSummary | null | undefined
}) {
  const t = useTranslations("adminDashboard.backup.log")
  const locale = useLocale()
  const timezone = useAppTimezone()
  const entries = summary?.logEntries ?? []

  const formatTimestamp = (value: string | null) => {
    if (!value) return t("time_unknown")
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return t("time_unknown")

    return new Intl.DateTimeFormat(locale, {
      dateStyle: "short",
      timeStyle: "medium",
      timeZone: timezone,
    }).format(date)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-4xl overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
              <ScrollText className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <DialogTitle>{t("title")}</DialogTitle>
              <DialogDescription className="mt-1">{t("description")}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 overflow-hidden px-6 pb-6">
          <div className="grid gap-3 rounded-lg border bg-muted/20 p-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("file")}</p>
              <p className="mt-1 truncate font-mono text-xs" title={summary?.logFilePath ?? ""}>
                {summary?.logFilePath || t("unavailable")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{t("lines", { count: summary?.logLineCount ?? 0 })}</Badge>
              {summary?.logTruncated ? (
                <Badge variant="secondary">{t("last_lines", { count: entries.length })}</Badge>
              ) : null}
            </div>
          </div>

          <div className="max-h-[58vh] overflow-y-auto rounded-lg border bg-background">
            {entries.length === 0 ? (
              <div className="flex min-h-40 items-center justify-center px-6 py-10 text-center text-sm text-muted-foreground">
                {t("empty")}
              </div>
            ) : (
              <div className="divide-y">
                {entries.map((entry, index) => (
                  <div
                    key={`${entry.timestamp ?? "no-time"}-${index}`}
                    className={cn(
                      "grid gap-2 px-4 py-3 text-sm sm:grid-cols-[150px_20px_minmax(0,1fr)] sm:items-start",
                      entry.level === "error" && "bg-destructive/5",
                      entry.level === "success" && "bg-emerald-500/5",
                      entry.level === "section" && "bg-violet-500/5",
                    )}
                  >
                    <time className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
                      {formatTimestamp(entry.timestamp)}
                    </time>
                    <LogLevelIcon level={entry.level} />
                    <p
                      className={cn(
                        "min-w-0 break-words font-mono text-xs leading-5",
                        entry.level === "error" && "font-semibold text-destructive",
                        entry.level === "success" && "text-emerald-700 dark:text-emerald-300",
                        entry.level === "section" && "font-semibold text-violet-700 dark:text-violet-300",
                      )}
                    >
                      {entry.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {summary?.logTruncated ? (
            <p className="text-xs text-muted-foreground">
              {t("truncated", {
                shown: entries.length,
                total: summary.logLineCount,
              })}
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
