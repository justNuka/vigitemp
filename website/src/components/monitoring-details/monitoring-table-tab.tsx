import { useMemo } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { TanStackTable } from "@/components/data-table/tanstack-table"
import type { MeasureData } from "@/lib/measurements"

interface MonitoringTableTabProps {
  tableMeasurements: MeasureData[]
  unite: string
  consigneSup: number | null
  consigneInf: number | null
  rangeLoading: boolean
  pagination: { pageIndex: number; pageSize: number }
  pageCount: number
  totalRows: number
  onPaginationChange: Dispatch<SetStateAction<{ pageIndex: number; pageSize: number }>>
  isSurveillanceActive: boolean
  rangeEnabled: boolean
  t: (key: string) => string
}

type TableRow = {
  id: number | string
  dateIso: string
  dateLabel: string
  value: number | null
  unit: string
}

export function MonitoringTableTab({
  tableMeasurements,
  unite,
  consigneSup,
  consigneInf,
  rangeLoading,
  pagination,
  pageCount,
  totalRows,
  onPaginationChange,
  isSurveillanceActive,
  rangeEnabled,
  t,
}: MonitoringTableTabProps) {
  const data = useMemo<TableRow[]>(() => {
    return tableMeasurements.map((measure) => ({
      id: measure.id,
      dateIso: measure.DateHeureMesureIso ?? measure.DateHeureMesure,
      dateLabel: measure.DateHeureMesure,
      value: measure.Valeur,
      unit: unite,
    }))
  }, [tableMeasurements, unite])

  const columns = useMemo<ColumnDef<TableRow>[]>(() => [
    {
      accessorKey: "dateIso",
      header: t("table.columns.date_time"),
      sortingFn: (rowA, rowB, columnId) => Date.parse(rowA.getValue(columnId) as string) - Date.parse(rowB.getValue(columnId) as string),
      cell: ({ row }) => <span className="font-medium">{row.original.dateLabel}</span>,
    },
    {
      accessorKey: "value",
      header: t("table.columns.value"),
      cell: ({ row }) => {
        const value = row.getValue("value") as number | null
        if (value === null) {
          return <span className="text-muted-foreground">{t("table.status.no_response")}</span>
        }

        const isOutOfRange =
          (consigneInf !== null && value < consigneInf) ||
          (consigneSup !== null && value > consigneSup)

        return <span className={isOutOfRange ? "text-red-600 dark:text-red-400 font-bold" : ""}>{value}{row.original.unit}</span>
      },
    },
    {
      id: "consigneInf",
      header: t("table.columns.lower_threshold"),
      cell: () => <span>{consigneInf !== null ? `${consigneInf}${unite}` : "-"}</span>,
    },
    {
      id: "consigneSup",
      header: t("table.columns.upper_threshold"),
      cell: () => <span>{consigneSup !== null ? `${consigneSup}${unite}` : "-"}</span>,
    },
    {
      id: "statut",
      header: t("table.columns.status"),
      cell: ({ row }) => {
        const value = row.getValue("value") as number | null
        if (value === null) {
          return <span className="text-muted-foreground">{t("table.status.no_response")}</span>
        }

        const isOutOfRange =
          (consigneInf !== null && value < consigneInf) ||
          (consigneSup !== null && value > consigneSup)

        return isOutOfRange ? (
          <span className="text-red-600 dark:text-red-400 font-semibold">{t("table.status.out_of_range")}</span>
        ) : (
          <span className="text-green-600 dark:text-green-400">{t("table.status.ok")}</span>
        )
      },
    },
  ], [consigneInf, consigneSup, t, unite])

  return (
    <div className="space-y-4 pt-4 h-140">
      <TanStackTable
        columns={columns}
        data={data}
        showSearch={false}
        pageSize={pagination.pageSize}
        emptyMessage={isSurveillanceActive || rangeEnabled ? t("table.empty") : t("table.empty_with_range")}
        isLoading={rangeLoading}
        manualPagination
        pageCount={pageCount}
        totalRows={totalRows}
        paginationState={pagination}
        onPaginationChange={onPaginationChange}
        headerClassName="!bg-sidebar !text-sidebar-foreground"
        headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
        tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_tbody_td]:!border-b [&_tbody_td]:!border-border"
      />
    </div>
  )
}
