"use client"

import { useCallback, useMemo, useState } from "react"

import { buildSensorColumns } from "./_components/build-sensor-columns"
import { MOCK_SENSORS } from "./_components/mock-sensors"
import { SensorsTableCard } from "./_components/sensors-table-card"
import { TestConnectionStats } from "./_components/test-connection-stats"
import type { SensorWithSelection } from "./_components/sensor-types"
import { useTranslations } from 'next-intl'

export function TestConnectionTab() {
  const t = useTranslations('toolsTestConnection')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [sensors, setSensors] = useState<SensorWithSelection[]>(MOCK_SENSORS)
  const [isLoading, setIsLoading] = useState(false)

  const globalResponseRate = useMemo(() => {
    if (sensors.length === 0) return 0
    const avg = sensors.reduce((sum, sensor) => sum + sensor.Taux_Reponse, 0) / sensors.length
    return Math.round(avg * 10) / 10
  }, [sensors])

  const lastMeasurementCount = useMemo(() => {
    return sensors.length * 125
  }, [sensors])

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

  const handleLaunchTests = async () => {
    if (selectedIds.length === 0) return

    setIsLoading(true)
    try {
      console.log("Launching tests for sensors:", selectedIds)
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
          status: {
            ok: t('table.status.ok'),
            warning: t('table.status.warning'),
            error: t('table.status.error'),
          },
          headers: {
            sensor: t('table.columns.sensor'),
            module: t('table.columns.module'),
            relay1: t('table.columns.relay1'),
            relay2: t('table.columns.relay2'),
            relay3: t('table.columns.relay3'),
            relay4: t('table.columns.relay4'),
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
      <TestConnectionStats
        globalResponseRate={globalResponseRate}
        sensorCount={sensors.length}
        lastMeasurementCount={lastMeasurementCount}
        selectedCount={selectedIds.length}
      />

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
    </div>
  )
}

