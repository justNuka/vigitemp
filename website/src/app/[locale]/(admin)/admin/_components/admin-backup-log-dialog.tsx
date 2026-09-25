"use client"

import { CheckCircle2, CircleDot, FileText, Info, XCircle } from "lucide-react"
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

const levelTone = {
  success: {
    icon: CheckCircle2,
    row: "bg-[hsl(var(--status-ok)/0.05)]",
    iconClass: "text-[hsl(var(--status-ok-text))]",
  },
  error: {
    icon: XCircle,
    row: "bg-[hsl(var(--status-critical)/0.06)]",
    iconClass: "text-[hsl(var(--status-critical))]",
  },
  section: {
    icon: CircleDot,
    row: "bg-[hsl(var(--status-ended)/0.06)]",
    iconClass: "text-[hsl(var(--status-ended))]",
  },
  info: {
    icon: Info,
    row: "",
    iconClass: "text-[hsl(var(--subtle-foreground))]",
  },
} as const

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
      <DialogContent className="flex max-h-[88vh] max-w-3xl flex-col overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-5 py-4 pr-14">
          <DialogTitle className="text-[15px] font-semibold">{t("title")}</DialogTitle>
          <DialogDescription className="mt-0.5 text-xs">{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-[hsl(var(--surface-muted)/0.6)] px-5 py-2 text-xs">
          <FileText className="h-3.5 w-3.5 text-[hsl(var(--subtle-foreground))]" aria-hidden />
          <span className="text-muted-foreground">{t("file")}</span>
          <span className="num min-w-0 flex-1 truncate font-medium text-foreground" title={summary?.logFilePath ?? undefined}>
            {summary?.logFilePath || t("unavailable")}
          </span>
          <Badge variant="outline" className="num rounded-full bg-card text-[11px]">
            {t("lines", { count: summary?.logLineCount ?? 0 })}
          </Badge>
          {summary?.logTruncated ? (
            <Badge
              variant="outline"
              className="num rounded-full border-primary/30 bg-[hsl(var(--primary-soft))] text-[11px] text-[hsl(var(--primary-strong))]"
            >
              {t("last_lines", { count: entries.length })}
            </Badge>
          ) : null}
        </div>

        <div className="scroll-thin min-h-[200px] flex-1 overflow-y-auto">
          {entries.length === 0 ? (
            <p className="px-5 py-12 text-center text-[13px] text-muted-foreground">{t("empty")}</p>
          ) : (
            <ol className="divide-y divide-border/70">
              {entries.map((entry, index) => {
                const tone = levelTone[entry.level] ?? levelTone.info
                const Icon = tone.icon

                return (
                  <li
                    key={`${entry.timestamp ?? "no-time"}-${index}`}
                    className={cn(
                      "grid grid-cols-[150px_16px_minmax(0,1fr)] items-start gap-3 px-5 py-1.5 text-xs transition-colors duration-150",
                      tone.row,
                    )}
                  >
                    <span className="num whitespace-nowrap text-muted-foreground">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                    <Icon className={cn("mt-0.5 h-3.5 w-3.5", tone.iconClass)} aria-hidden />
                    <span
                      className={cn(
                        "break-words leading-5 text-foreground/90",
                        entry.level === "section" && "font-semibold text-foreground",
                      )}
                    >
                      {entry.message}
                    </span>
                  </li>
                )
              })}
            </ol>
          )}
        </div>

        {summary?.logTruncated ? (
          <footer className="border-t border-border px-5 py-2 text-[11px] text-muted-foreground">
            {t("truncated", { total: summary.logLineCount ?? 0, shown: entries.length })}
          </footer>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
