"use client"

import { useCallback, useMemo, useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { buildSensorColumns } from "./_components/build-sensor-columns"
import { MOCK_SENSORS } from "./_components/mock-sensors"
import { SensorsTableCard } from "./_components/sensors-table-card"
import type { SensorWithSelection } from "./_components/sensor-types"
import { useTranslations } from 'next-intl'

export function TestConnectionTab() {
  const t = useTranslations('toolsTestConnection')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [sensors, setSensors] = useState<SensorWithSelection[]>(MOCK_SENSORS)
  const [isLoading, setIsLoading] = useState(false)
  const [isLaunchDialogOpen, setIsLaunchDialogOpen] = useState(false)
  const [testDurationMinutes, setTestDurationMinutes] = useState("1")

  const handleToggleAll = useCallback(() => {
    if (selectedIds.length === sensors.length) {
      setSelectedIds([])
      return
    }
    setSelectedIds(sensors.map((sensor) => sensor.Id_Sonde))
  }, [sensors, selectedIds.length])

  const handleToggleOne = useCallback((id: number, selected: boolean) => {
    if (selected) {
      setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
      return
    }
    setSelectedIds((prev) => prev.filter((item) => item !== id))
  }, [])

  const handleDeselectAll = () => {
    setSelectedIds([])
  }

  const handleReset = () => {
    setSelectedIds([])
    setSensors(MOCK_SENSORS)
  }

  const handleLaunchTests = () => {
    if (selectedIds.length === 0) return
    setIsLaunchDialogOpen(true)
  }

  const handleConfirmLaunchTests = async () => {
    if (selectedIds.length === 0) return

    setIsLaunchDialogOpen(false)
    setIsLoading(true)
    try {
      console.log("Launching tests for sensors:", selectedIds, "durationMinutes:", testDurationMinutes)
      await new Promise((resolve) => setTimeout(resolve, 1500))
    } finally {
      setIsLoading(false)
    }
  }

  const columns = useMemo(
    () =>
      buildSensorColumns({
        sensors,
        selectedIds,
        onToggleAll: handleToggleAll,
        onToggleOne: handleToggleOne,
        labels: {
          headers: {
            sensor: t('table.columns.sensor'),
            location: t('table.columns.location'),
            module: t('table.columns.module'),
            signal: t('table.columns.signal'),
            responseRate: t('table.columns.response_rate'),
          },
          aria: {
            selectAll: t('table.aria.select_all'),
            selectOne: (serial) => t('table.aria.select_one', { serial: serial || '-' }),
          },
        },
      }),
    [handleToggleAll, handleToggleOne, sensors, selectedIds, t],
  )

  return (
    <div className="space-y-6">
      <SensorsTableCard
        sensors={sensors}
        columns={columns}
        isLoading={isLoading}
        selectedCount={selectedIds.length}
        onLaunchTests={handleLaunchTests}
        onToggleAll={handleToggleAll}
        onDeselectAll={handleDeselectAll}
        onReset={handleReset}
      />

      <AlertDialog open={isLaunchDialogOpen} onOpenChange={setIsLaunchDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('launch_dialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('launch_dialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('launch_dialog.duration_label')}</label>
            <Select value={testDurationMinutes} onValueChange={setTestDurationMinutes}>
              <SelectTrigger>
                <SelectValue placeholder={t('launch_dialog.duration_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((minutes) => (
                  <SelectItem key={minutes} value={String(minutes)}>
                    {t('launch_dialog.duration_option', { count: minutes })}
                    {minutes === 1 ? ` - ${t('launch_dialog.recommended')}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>{t('launch_dialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => { void handleConfirmLaunchTests() }}>
              {t('launch_dialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

