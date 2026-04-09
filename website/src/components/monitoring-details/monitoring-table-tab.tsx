import { useMemo, useState } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { ColumnDef, SortingState, Updater } from "@tanstack/react-table"

import { TanStackTable } from "@/components/data-table/tanstack-table"
import { Button } from "@/components/ui/button"
import type { MeasureData } from "@/lib/measurements"

type PresentationExportRow = {
  label: string
  value: string
}

interface MonitoringTableTabProps {
  tableMeasurements: MeasureData[]
  nomLieu: string
  sondeNumeroSerie: string
  exportFileName: string
  unite: string
  consigneSup: number | null
  consigneInf: number | null
  rangeLoading: boolean
  pagination: { pageIndex: number; pageSize: number }
  pageCount: number
  totalRows: number
  onPaginationChange: Dispatch<SetStateAction<{ pageIndex: number; pageSize: number }>>
  sorting: SortingState
  onSortingChange: (updater: Updater<SortingState>) => void
  isSurveillanceActive: boolean
  rangeEnabled: boolean
  presentationRows: PresentationExportRow[]
  t: (key: string) => string
}

type TableRow = {
  id: number | string
  dateIso: string
  dateLabel: string
  sensorSerial: string
  value: number | null
  unit: string
  consigneInf: number | null
  consigneSup: number | null
}

export function MonitoringTableTab({
  tableMeasurements,
  nomLieu,
  sondeNumeroSerie,
  exportFileName,
  unite,
  consigneSup,
  consigneInf,
  rangeLoading,
  pagination,
  pageCount,
  totalRows,
  onPaginationChange,
  sorting,
  onSortingChange,
  isSurveillanceActive,
  rangeEnabled,
  presentationRows,
  t,
}: MonitoringTableTabProps) {
  const [isExportingMultiTabs, setIsExportingMultiTabs] = useState(false)

  const data = useMemo<TableRow[]>(() => {
    return tableMeasurements.map((measure) => ({
      id: measure.id,
      dateIso: measure.DateHeureMesureIso ?? measure.DateHeureMesure,
      dateLabel: measure.DateHeureMesure,
      sensorSerial: sondeNumeroSerie,
      value: measure.Valeur,
      unit: unite,
      consigneInf: measure.Consigne_Inf,
      consigneSup: measure.Consigne_Sup,
    }))
  }, [sondeNumeroSerie, tableMeasurements, unite])

  const getStatusLabel = (row: TableRow): string => {
    if (row.value === null) {
      return t("table.status.no_response")
    }

    const isOutOfRange =
      (row.consigneInf !== null && row.value < row.consigneInf) ||
      (row.consigneSup !== null && row.value > row.consigneSup)

    return isOutOfRange ? t("table.status.out_of_range") : t("table.status.ok")
  }

  const columns = useMemo<ColumnDef<TableRow>[]>(() => [
    {
      id: "date",
      accessorKey: "dateLabel",
      header: t("table.columns.date_time"),
      sortingFn: (rowA, rowB) => Date.parse(rowA.original.dateIso) - Date.parse(rowB.original.dateIso),
      cell: ({ row }) => <span className="font-medium">{row.original.dateLabel}</span>,
    },
    {
      accessorKey: "sensorSerial",
      header: t("table.columns.serial"),
      cell: ({ row }) => <span>{row.original.sensorSerial}</span>,
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
          (row.original.consigneInf !== null && value < row.original.consigneInf) ||
          (row.original.consigneSup !== null && value > row.original.consigneSup)

        return <span className={isOutOfRange ? "text-red-600 dark:text-red-400 font-bold" : ""}>{value}{row.original.unit}</span>
      },
    },
    {
      id: "consigneInf",
      accessorKey: "consigneInf",
      header: t("table.columns.lower_threshold"),
      cell: ({ row }) => <span>{row.original.consigneInf !== null ? `${row.original.consigneInf}${unite}` : "-"}</span>,
    },
    {
      id: "consigneSup",
      accessorKey: "consigneSup",
      header: t("table.columns.upper_threshold"),
      cell: ({ row }) => <span>{row.original.consigneSup !== null ? `${row.original.consigneSup}${unite}` : "-"}</span>,
    },
    {
      id: "statut",
      accessorFn: (row) => getStatusLabel(row),
      header: t("table.columns.status"),
      cell: ({ row }) => {
        const value = row.getValue("value") as number | null
        if (value === null) {
          return <span className="text-muted-foreground">{t("table.status.no_response")}</span>
        }

        const isOutOfRange =
          (row.original.consigneInf !== null && value < row.original.consigneInf) ||
          (row.original.consigneSup !== null && value > row.original.consigneSup)

        return isOutOfRange ? (
          <span className="text-red-600 dark:text-red-400 font-semibold">{t("table.status.out_of_range")}</span>
        ) : (
          <span className="text-green-600 dark:text-green-400">{t("table.status.ok")}</span>
        )
      },
    },
  ], [t, unite])

  const measurementRowsForExport = useMemo(() => {
    return data.map((row) => [
      row.dateLabel,
      row.sensorSerial,
      row.value === null ? t("table.status.no_response") : `${row.value}${row.unit}`,
      row.consigneInf !== null ? `${row.consigneInf}${unite}` : "-",
      row.consigneSup !== null ? `${row.consigneSup}${unite}` : "-",
      getStatusLabel(row),
    ])
  }, [data, t, unite])

  const handleMultiTabsExport = async () => {
    if (isExportingMultiTabs) return

    setIsExportingMultiTabs(true)
    try {
      const xlsx = await import("xlsx")

      const workbook = xlsx.utils.book_new()
      const presentationSheet = xlsx.utils.aoa_to_sheet([
        [t("table.multi_tabs.presentation_columns.label"), t("table.multi_tabs.presentation_columns.value")],
        ...presentationRows.map((row) => [row.label, row.value]),
      ])

      const measurementsSheet = xlsx.utils.aoa_to_sheet([
        [
          t("table.columns.date_time"),
          t("table.columns.serial"),
          t("table.columns.value"),
          t("table.columns.lower_threshold"),
          t("table.columns.upper_threshold"),
          t("table.columns.status"),
        ],
        ...measurementRowsForExport,
      ])

      xlsx.utils.book_append_sheet(workbook, presentationSheet, t("table.multi_tabs.presentation_sheet"))
      xlsx.utils.book_append_sheet(workbook, measurementsSheet, t("table.multi_tabs.measurements_sheet"))

      const arrayBuffer = xlsx.write(workbook, { bookType: "xlsx", type: "array" })
      const blob = new Blob([arrayBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `${exportFileName}-multi-tabs.xlsx`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } finally {
      setIsExportingMultiTabs(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 pt-4">
      <TanStackTable
        columns={columns}
        data={data}
        showSearch={false}
        pageSize={pagination.pageSize}
        emptyMessage={isSurveillanceActive || rangeEnabled ? t("table.empty") : t("table.empty_with_range")}
        isLoading={rangeLoading}
        exportFileName={exportFileName}
        promptExportCount
        enableExportColumnSelection
        toolbarRight={
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={rangeLoading || isExportingMultiTabs}
            onClick={() => void handleMultiTabsExport()}
          >
            {isExportingMultiTabs ? t("table.multi_tabs.button_loading") : t("table.multi_tabs.button")}
          </Button>
        }
        manualPagination
        manualSorting
        pageCount={pageCount}
        totalRows={totalRows}
        paginationState={pagination}
        onPaginationChange={onPaginationChange}
        sortingState={sorting}
        onSortingChange={onSortingChange}
        maxHeight="calc(100vh - 26rem)"
        headerClassName="!bg-sidebar !text-sidebar-foreground"
        headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
        tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_tbody_td]:!border-b [&_tbody_td]:!border-border"
      />
    </div>
  )
}
