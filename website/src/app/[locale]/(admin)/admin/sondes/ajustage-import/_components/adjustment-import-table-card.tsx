"use client"

import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TanStackTable } from "@/components/data-table/tanstack-table"
import type { ColumnDef } from "@tanstack/react-table"


interface AdjustmentImportTableCardProps<Row extends Record<string, any>> {
  title: string
  assignmentLabel: string
  onOpenAssignment: () => void
  assignmentDisabled?: boolean
  onOpenImport: () => void
  importLabel: string
  columns: ColumnDef<Row>[]
  rows: Row[]
  emptyMessage: string
  toolbarContent?: ReactNode
  summaryCreatedLabel: string
  summaryExistingLabel: string
  onSave: () => void
  saveLabel: string
  disabled: boolean
  onClear?: () => void
  clearLabel?: string
  clearDisabled?: boolean
}

export function AdjustmentImportTableCard<Row extends Record<string, any>>({
  title,
  assignmentLabel,
  onOpenAssignment,
  assignmentDisabled = false,
  onOpenImport,
  importLabel,
  columns,
  rows,
  emptyMessage,
  toolbarContent,
  summaryCreatedLabel,
  summaryExistingLabel,
  onSave,
  saveLabel,
  disabled,
  onClear,
  clearLabel,
  clearDisabled,
}: AdjustmentImportTableCardProps<Row>) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={onOpenAssignment} disabled={assignmentDisabled}>
              {assignmentLabel}
            </Button>
            <Button size="sm" className="gap-2" onClick={onOpenImport}>{importLabel}</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-2 md:p-4 xl:p-4">
        {toolbarContent}

        <TanStackTable
          columns={columns}
          data={rows}
          showSearch={false}
          showPagination={false}
          emptyMessage={emptyMessage}
          headerClassName="!bg-sidebar !text-sidebar-foreground"
          headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
          tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
        />

        <div className="grid gap-1 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          <div>{summaryCreatedLabel}</div>
          <div>{summaryExistingLabel}</div>
        </div>

        <div className="flex justify-end gap-2">
          {onClear && clearLabel ? (
            <Button variant="outline" onClick={onClear} disabled={clearDisabled}>
              {clearLabel}
            </Button>
          ) : null}
          <Button className="gap-2" onClick={onSave} disabled={disabled}>{saveLabel}</Button>
        </div>
      </CardContent>
    </Card>
  )
}
