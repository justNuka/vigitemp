"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TanStackTable } from "@/components/data-table/tanstack-table"
import type { ColumnDef } from "@tanstack/react-table"

import type { Module } from "@/hooks/useModules"

interface AdjustmentImportTableCardProps<Row extends Record<string, any>> {
  title: string
  modules: Module[]
  modulePlaceholder: string
  selectedModuleId: string
  onModuleChange: (value: string) => void
  onOpenImport: () => void
  importLabel: string
  columns: ColumnDef<Row>[]
  rows: Row[]
  emptyMessage: string
  createdSensors: number
  existingAssigned: number
  summaryCreatedLabel: string
  summaryExistingLabel: string
  onSave: () => void
  saveLabel: string
  disabled: boolean
}

export function AdjustmentImportTableCard<Row extends Record<string, any>>({
  title,
  modules,
  modulePlaceholder,
  selectedModuleId,
  onModuleChange,
  onOpenImport,
  importLabel,
  columns,
  rows,
  emptyMessage,
  createdSensors,
  existingAssigned,
  summaryCreatedLabel,
  summaryExistingLabel,
  onSave,
  saveLabel,
  disabled,
}: AdjustmentImportTableCardProps<Row>) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-65">
              <Select value={selectedModuleId} onValueChange={onModuleChange}>
                <SelectTrigger>
                  <SelectValue placeholder={modulePlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module.Id_Module} value={String(module.Id_Module)}>
                      {module.Module_Numero_Serie || module.Libelle_Type_Module || `#${module.Id_Module}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" className="gap-2" onClick={onOpenImport}>{importLabel}</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-2 md:p-4 xl:p-4">
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
          <div>{summaryCreatedLabel}: {createdSensors}</div>
          <div>{summaryExistingLabel}: {existingAssigned}</div>
        </div>

        <div className="flex justify-end">
          <Button className="gap-2" onClick={onSave} disabled={disabled}>{saveLabel}</Button>
        </div>
      </CardContent>
    </Card>
  )
}
