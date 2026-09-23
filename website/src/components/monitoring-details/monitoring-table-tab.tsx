import { useCallback, useMemo, useState } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { ColumnDef, SortingState, Updater } from "@tanstack/react-table"

import { TanStackTable } from "@/components/data-table/tanstack-table"
import { Button } from "@/components/ui/button"
import { formatStoredDbDateTime, parseStoredDbDateTime } from "@/lib/date-display"
import type { MeasureData } from "@/lib/measurements"
import { formatMeasureValue } from "@/lib/measurements"
import { exportStyledExcel } from "@/lib/excel-export"
import { cn } from "@/lib/utils"

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
  maxHeight?: string
  showExportActions?: boolean
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
  isMemoryValue: boolean
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
  maxHeight = "calc(100vh - 26rem)",
  showExportActions = true,
}: MonitoringTableTabProps) {
  const [isExportingMultiTabs, setIsExportingMultiTabs] = useState(false)

  const data = useMemo<TableRow[]>(() => {
    return tableMeasurements.map((measure) => ({
      id: measure.id,
      dateIso: measure.DateHeureMesureIso ?? measure.DateHeureMesure,
      dateLabel: formatStoredDbDateTime(measure.DateHeureMesureIso ?? measure.DateHeureMesure, {
        format: "dateTimeSeconds",
      }),
      sensorSerial: sondeNumeroSerie,
      value: measure.Valeur,
      unit: unite,
      consigneInf: measure.Consigne_Inf,
      consigneSup: measure.Consigne_Sup,
      isMemoryValue:
        typeof measure.Est_Valeur_Memoire === "number"
          ? measure.Est_Valeur_Memoire !== 0
          : Boolean(measure.Est_Valeur_Memoire),
    }))
  }, [sondeNumeroSerie, tableMeasurements, unite])

  const getStatusLabel = useCallback((row: TableRow): string => {
    if (row.value === null) {
      return t("table.status.no_response")
    }

    const isOutOfRange =
      (row.consigneInf !== null && row.value < row.consigneInf) ||
      (row.consigneSup !== null && row.value > row.consigneSup)

    return isOutOfRange ? t("table.status.out_of_range") : t("table.status.ok")
  }, [t])

  const columns = useMemo<ColumnDef<TableRow>[]>(() => [
    {
      id: "date",
      accessorKey: "dateLabel",
      header: t("table.columns.date_time"),
      sortingFn: (rowA, rowB) =>
        (parseStoredDbDateTime(rowA.original.dateIso)?.getTime() ?? 0) -
        (parseStoredDbDateTime(rowB.original.dateIso)?.getTime() ?? 0),
      cell: ({ row }) => (
        <span className={cn("font-medium", row.original.isMemoryValue && "italic")}>
          {row.original.dateLabel}
        </span>
      ),
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

        return (
          <span
            className={cn(
              isOutOfRange ? "text-red-600 dark:text-red-400 font-bold" : "",
              row.original.isMemoryValue && "italic",
            )}
          >
            {formatMeasureValue(value)}{row.original.unit}
          </span>
        )
      },
    },
    {
      id: "consigneInf",
      accessorKey: "consigneInf",
      header: t("table.columns.lower_threshold"),
      cell: ({ row }) => <span>{row.original.consigneInf !== null ? `${formatMeasureValue(row.original.consigneInf)}${unite}` : "-"}</span>,
    },
    {
      id: "consigneSup",
      accessorKey: "consigneSup",
      header: t("table.columns.upper_threshold"),
      cell: ({ row }) => <span>{row.original.consigneSup !== null ? `${formatMeasureValue(row.original.consigneSup)}${unite}` : "-"}</span>,
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
          <span
            className={cn(
              "text-red-600 dark:text-red-400 font-semibold",
              row.original.isMemoryValue && "italic",
            )}
          >
            {t("table.status.out_of_range")}
          </span>
        ) : (
          <span className={cn("text-green-600 dark:text-green-400", row.original.isMemoryValue && "italic")}>
            {t("table.status.ok")}
          </span>
        )
      },
    },
  ], [getStatusLabel, t, unite])

  const measurementRowsForExport = useMemo(() => {
    return data.map((row) => [
      row.dateLabel,
      row.sensorSerial,
      row.value === null ? t("table.status.no_response") : `${formatMeasureValue(row.value)}${row.unit}`,
      row.consigneInf !== null ? `${formatMeasureValue(row.consigneInf)}${unite}` : "-",
      row.consigneSup !== null ? `${formatMeasureValue(row.consigneSup)}${unite}` : "-",
      getStatusLabel(row),
    ])
  }, [data, getStatusLabel, t, unite])

  const handleMultiTabsExport = async () => {
    if (isExportingMultiTabs) return

    setIsExportingMultiTabs(true)
    try {
      await exportStyledExcel({
        fileName: `${exportFileName}-multi-tabs`,
        title: nomLieu,
        presentationSheetName: t("table.multi_tabs.presentation_sheet"),
        dataSheetName: t("table.multi_tabs.measurements_sheet"),
        presentationHeaders: [
          t("table.multi_tabs.presentation_columns.label"),
          t("table.multi_tabs.presentation_columns.value"),
        ],
        presentationRows,
        dataHeaders: [
          t("table.columns.date_time"),
          t("table.columns.serial"),
          t("table.columns.value"),
          t("table.columns.lower_threshold"),
          t("table.columns.upper_threshold"),
          t("table.columns.status"),
        ],
        dataRows: measurementRowsForExport,
      })
    } finally {
      setIsExportingMultiTabs(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 pt-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium">{t("table.legend.title")}</span>
        <span
          className="inline-flex items-center rounded-full border px-2 py-0.5 italic"
          title={t("table.legend.memory_tooltip")}
        >
          {t("table.legend.memory")}
        </span>
      </div>
      <TanStackTable
        columns={columns}
        data={data}
        showSearch={false}
        pageSize={pagination.pageSize}
        emptyMessage={isSurveillanceActive || rangeEnabled ? t("table.empty") : t("table.empty_with_range")}
        isLoading={rangeLoading}
        exportFileName={exportFileName}
        promptExportCount
        enableExport={showExportActions}
        exportFormats={["pdf"]}
        enableExportColumnSelection={showExportActions}
        toolbarRight={showExportActions ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={rangeLoading || isExportingMultiTabs}
            onClick={() => void handleMultiTabsExport()}
          >
            {isExportingMultiTabs ? t("table.multi_tabs.button_loading") : t("table.multi_tabs.button")}
          </Button>
        ) : undefined}
        manualPagination
        manualSorting
        pageCount={pageCount}
        totalRows={totalRows}
        paginationState={pagination}
        onPaginationChange={onPaginationChange}
        sortingState={sorting}
        onSortingChange={onSortingChange}
        maxHeight={maxHeight}
        rowClassName={(row) => (row.isMemoryValue ? "italic" : undefined)}
        headerClassName="!bg-sidebar !text-sidebar-foreground"
        headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
        tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_tbody_td]:!border-b [&_tbody_td]:!border-border"
      />
    </div>
  )
}
