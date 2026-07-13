import { Fragment, useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { TanStackTable } from "@/components/data-table/tanstack-table"
import { formatDbDateTime } from "@/lib/date-display"
import {
  buildMonitoringAuditRows,
  formatMonitoringAuditSummary,
  sanitizeMonitoringAuditText,
} from "@/lib/audit/monitoring-audit"

import type { AuditLog } from "./types"

interface MonitoringAuditTabProps {
  logs: AuditLog[]
  isLoading: boolean
  error: string | null
  t: (key: string) => string
  maxHeight?: string
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

function buildAuditRows(raw: string | null | undefined) {
  const sanitized = sanitizeMonitoringAuditText(raw)
  if (sanitized === "-") return [] as Array<{ label: string; value: string }>

  return buildMonitoringAuditRows(raw)
}

function formatAuditDetails(value: string | null | undefined) {
  return formatMonitoringAuditSummary(value)
}

export function MonitoringAuditTab({ logs, isLoading, error, t, maxHeight = "calc(100vh - 26rem)" }: MonitoringAuditTabProps) {
  const data = useMemo<AuditRow[]>(() => {
    return logs.map((log) => ({
      id: log.id,
      code: log.code || "-",
      label: sanitizeMonitoringAuditText(log.label),
      dateIso: log.timestamp ?? "",
      dateLabel: log.timestamp ? formatDbDateTime(log.timestamp) : "-",
      user: log.user || "-",
      details: formatAuditDetails(log.commentaire || log.detailsSummary),
      detailRows: buildAuditRows(log.commentaire || log.detailsSummary),
      comment: log.commentaireUtilisateur ? sanitizeMonitoringAuditText(log.commentaireUtilisateur) : null,
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
        maxHeight={maxHeight}
      />
    </div>
  )
}
