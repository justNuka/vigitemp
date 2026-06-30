import { Fragment, useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { TanStackTable } from "@/components/data-table/tanstack-table"
import { formatDbDateTime, parseDbDateTime } from "@/lib/date-display"

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
  detailRows: Array<{ label: string; value: string }>
  comment: string | null
}

const AUDIT_FIELD_LABELS: Record<string, string> = {
  Nom_Lieu: "Nom du lieu",
  Commentaire: "Commentaire",
  Observations_Info: "Observations",
  Id_Site: "Site",
  Sonde_Numero_Serie: "Sonde",
  Consigne: "Consigne",
  Consigne_Sup: "Consigne sup.",
  Consigne_Inf: "Consigne inf.",
  Tolerance_Surveillance_Sup: "Tolerance sup.",
  Tolerance_Surveillance_Inf: "Tolerance inf.",
  Retard_Alarme_Haut: "Retard alarme haut",
  Retard_Alarme_Bas: "Retard alarme bas",
  Retard_Non_Reponse: "Retard non reponse",
  Frequence: "Frequence",
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

function formatAuditValue(key: string, value: unknown) {
  if (value === null || value === undefined || value === "") return "-"
  if (typeof value === "boolean") return value ? "Oui" : "Non"
  if (typeof value === "number") return String(value)
  if (typeof value === "string") {
    const lowered = key.toLowerCase()
    if (lowered.endsWith("at") || lowered.includes("date") || lowered.includes("time")) {
      const parsed = parseDbDateTime(value)
      if (parsed && !Number.isNaN(parsed.getTime())) {
        return formatDbDateTime(parsed)
      }
    }
    return value
  }
  return String(value)
}

function isFromToChange(value: unknown): value is { from?: unknown; to?: unknown } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false
  return Object.prototype.hasOwnProperty.call(value, "from") || Object.prototype.hasOwnProperty.call(value, "to")
}

function buildAuditRows(raw: string | null | undefined) {
  const sanitized = sanitizeAuditText(raw)
  if (sanitized === "-") return [] as Array<{ label: string; value: string }>

  const jsonStart = sanitized.indexOf("{")
  const jsonEnd = sanitized.lastIndexOf("}")
  if (jsonStart < 0 || jsonEnd <= jsonStart) return []

  try {
    const parsed = JSON.parse(sanitized.slice(jsonStart, jsonEnd + 1)) as Record<string, unknown>
    return Object.entries(parsed)
      .filter(([key, value]) => key !== "action" && value !== null && value !== undefined)
      .map(([key, value]) => {
        const label = AUDIT_FIELD_LABELS[key] ?? key
        if (isFromToChange(value)) {
          return {
            label,
            value: `Avant: ${formatAuditValue("from", value.from)} | Apres: ${formatAuditValue("to", value.to)}`,
          }
        }

        return {
          label,
          value: formatAuditValue(key, value),
        }
      })
  } catch {
    return []
  }
}

function formatAuditDetails(value: string | null | undefined) {
  const sanitized = sanitizeAuditText(value)
  if (sanitized === "-") return sanitized

  const jsonStart = sanitized.indexOf("{")
  const jsonEnd = sanitized.lastIndexOf("}")
  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    const prefix = sanitized.slice(0, jsonStart).trim()
    return prefix || sanitized.slice(jsonStart, jsonEnd + 1)
  }

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
      details: formatAuditDetails(log.commentaire || log.detailsSummary),
      detailRows: buildAuditRows(log.commentaire),
      comment: log.commentaireUtilisateur ? sanitizeAuditText(log.commentaireUtilisateur) : null,
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
      cell: ({ row }) => (
        <div className="space-y-2">
          <span className="text-muted-foreground whitespace-pre-line wrap-break-word">{row.original.details}</span>
          {row.original.detailRows.length > 0 ? (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded border bg-muted/40 p-2">
              {row.original.detailRows.map(({ label, value }) => (
                <Fragment key={`${String(row.original.id)}-${label}`}>
                  <dt className="text-xs text-muted-foreground whitespace-nowrap">{label}</dt>
                  <dd className="text-xs font-medium whitespace-pre-line wrap-break-word">{value}</dd>
                </Fragment>
              ))}
            </dl>
          ) : null}
          {row.original.comment ? (
            <p className="text-xs italic text-muted-foreground">{row.original.comment}</p>
          ) : null}
        </div>
      ),
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
