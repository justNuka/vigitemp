import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { TanStackTable } from "@/components/data-table/tanstack-table"
import { formatDbDateTime } from "@/lib/date-display"

import type { AuditLog } from "./types"

interface MonitoringAuditTabProps {
  logs: AuditLog[]
  isLoading: boolean
  error: string | null
  t: (key: string) => string
}

type AuditRow = {
  id: number | string
  code: string
  label: string
  dateIso: string
  dateLabel: string
  user: string
  details: string
}

function sanitizeAuditText(value: string | null | undefined) {
  if (!value) return "-"
  const normalized = value
    .replace(/%[12]/g, "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]{2,}/g, " ").trim())
    .join("\n")
    .trim()

  return normalized || "-"
}

function toHumanAuditJson(raw: string) {
  const normalized = raw.trim()
  if (!normalized.startsWith("{") || !normalized.endsWith("}")) return null
  try {
    const parsed = JSON.parse(normalized) as Record<string, unknown>
    const entries = Object.entries(parsed)
    if (entries.length === 0) return "-"

    const labels: Record<string, string> = {
      disabled: "Désactivé",
      enabled: "Activé",
      durationMinutes: "Durée (min)",
      reactivationAt: "Réactivation",
      comment: "Commentaire",
      action: "Action",
      source: "Source",
    }

    return entries
      .map(([key, value]) => {
        const label = labels[key] ?? key
        let rendered = "-"
        if (typeof value === "boolean") rendered = value ? "Oui" : "Non"
        else if (value != null) rendered = String(value)
        return `${label}: ${rendered}`
      })
      .join("\n")
  } catch {
    return null
  }
}

function formatAuditDetails(value: string | null | undefined) {
  const sanitized = sanitizeAuditText(value)
  if (sanitized === "-") return sanitized

  const jsonStart = sanitized.indexOf("{")
  const jsonEnd = sanitized.lastIndexOf("}")
  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    const prefix = sanitized.slice(0, jsonStart).trim()
    const jsonPart = sanitized.slice(jsonStart, jsonEnd + 1)
    const humanJson = toHumanAuditJson(jsonPart)
    if (humanJson) {
      return prefix ? `${prefix}\n${humanJson}` : humanJson
    }
  }

  const pureJson = toHumanAuditJson(sanitized)
  if (pureJson) return pureJson
  return sanitized
}

export function MonitoringAuditTab({ logs, isLoading, error, t }: MonitoringAuditTabProps) {
  const data = useMemo<AuditRow[]>(() => {
    return logs.map((log) => ({
      id: log.id,
      code: log.code || "-",
      label: sanitizeAuditText(log.label),
      dateIso: log.timestamp ?? "",
      dateLabel: log.timestamp ? formatDbDateTime(log.timestamp) : "-",
      user: log.user || "-",
      details: formatAuditDetails(log.commentaireUtilisateur || log.commentaire),
    }))
  }, [logs])

  const columns = useMemo<ColumnDef<AuditRow>[]>(() => [
    {
      accessorKey: "code",
      header: t("audit.columns.code"),
      cell: ({ row }) => <span className="font-medium">{row.original.code}</span>,
    },
    {
      accessorKey: "label",
      header: t("audit.columns.label"),
      cell: ({ row }) => <span>{row.original.label}</span>,
    },
    {
      accessorKey: "dateIso",
      header: t("audit.columns.date_time"),
      sortingFn: (rowA, rowB, columnId) => Date.parse(rowA.getValue(columnId) as string) - Date.parse(rowB.getValue(columnId) as string),
      cell: ({ row }) => <span>{row.original.dateLabel}</span>,
    },
    {
      accessorKey: "user",
      header: t("audit.columns.user"),
      cell: ({ row }) => <span>{row.original.user}</span>,
    },
    {
      accessorKey: "details",
      header: t("audit.columns.details"),
      cell: ({ row }) => <span className="text-muted-foreground whitespace-pre-line wrap-break-word">{row.original.details}</span>,
    },
  ], [t])

  if (error) {
    return <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
  }

  return (
    <div className="space-y-4 pt-2">
      <TanStackTable
        columns={columns}
        data={data}
        searchField={["code", "label", "user", "details"]}
        searchPlaceholder={t("audit.search_placeholder")}
        pageSize={200}
        emptyMessage={t("audit.empty")}
        isLoading={isLoading}
        headerClassName="!bg-sidebar !text-sidebar-foreground"
        headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
        tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_tbody_td]:!border-b [&_tbody_td]:!border-border"
        maxHeight="24rem"
      />
    </div>
  )
}
