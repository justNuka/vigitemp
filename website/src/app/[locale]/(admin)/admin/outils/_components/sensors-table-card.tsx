'use client'

import type { ColumnDef } from "@tanstack/react-table"

import { TanStackTable } from "@/components/data-table/tanstack-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckSquare, Play, RotateCcw, Square } from "lucide-react"
import { useTranslations } from 'next-intl'

import type { SensorWithSelection } from "./sensor-types"

type SensorsTableCardProps = {
  sensors: SensorWithSelection[]
  columns: ColumnDef<SensorWithSelection>[]
  isLoading: boolean
  isRunning: boolean
  selectedCount: number
  onLaunchTests: () => void
  onToggleAll: () => void
  onDeselectAll: () => void
  onReset: () => void
}

export function SensorsTableCard({
  sensors,
  columns,
  isLoading,
  isRunning,
  selectedCount,
  onLaunchTests,
  onToggleAll,
  onDeselectAll,
  onReset,
}: SensorsTableCardProps) {
  const t = useTranslations('toolsTestConnection.table')
  const allSelected = sensors.length > 0 && selectedCount === sensors.length

  return (
    <Card className="overflow-hidden border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 border-b bg-muted/20">
        <div>
          <CardTitle>{t('title')}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('count', { count: sensors.length })}
          </p>
        </div>
        <Button onClick={onLaunchTests} disabled={selectedCount === 0 || isLoading || isRunning} size="sm" className="gap-2">
          <Play className="h-4 w-4" />
          {isRunning ? t('actions.testing') : t('actions.run_tests')}
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <TanStackTable
            columns={columns}
            data={sensors}
            pageSize={200}
            maxHeight="calc(100dvh - 29rem)"
            isLoading={isLoading}
            emptyMessage={t('empty')}
            showSearch={true}
            searchPlaceholder={t('search_placeholder')}
            searchField={["Sonde_Numero_Serie", "Adresse_Sonde", "Module", "Lieu", "Famille_Sonde"]}
            headerClassName="!bg-sidebar/90 !text-sidebar-foreground backdrop-blur supports-backdrop-filter:!bg-sidebar/80"
            headerCellClassName="!bg-sidebar/90 !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar/80 backdrop-blur supports-backdrop-filter:!bg-sidebar/80"
            tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
          />

          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button variant="outline" size="sm" onClick={onToggleAll} className="gap-2" disabled={isRunning || isLoading}>
              {allSelected ? <Square className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
              {allSelected ? t('actions.uncheck_all') : t('actions.check_all')}
            </Button>
            {selectedCount > 0 && (
              <Button variant="outline" size="sm" onClick={onDeselectAll} className="gap-2" disabled={isRunning}>
                <Square className="h-4 w-4" />
                {t('actions.uncheck_selection')}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onReset} className="gap-2" disabled={isRunning}>
              <RotateCcw className="h-4 w-4" />
              {t('actions.reset')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
