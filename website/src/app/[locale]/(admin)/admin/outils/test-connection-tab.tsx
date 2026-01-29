"use client"

import { useCallback, useMemo, useState } from "react"

import { buildProbeColumns } from "./_components/build-probe-columns"
import { MOCK_PROBES } from "./_components/mock-probes"
import { ProbesTableCard } from "./_components/probes-table-card"
import { TestConnectionStats } from "./_components/test-connection-stats"
import type { ProbeWithSelection } from "./_components/probe-types"
import { useTranslations } from 'next-intl'

export function TestConnectionTab() {
  const t = useTranslations('toolsTestConnection')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [probes, setProbes] = useState<ProbeWithSelection[]>(MOCK_PROBES)
  const [isLoading, setIsLoading] = useState(false)

  const globalResponseRate = useMemo(() => {
    if (probes.length === 0) return 0
    const avg = probes.reduce((sum, probe) => sum + probe.Taux_Reponse, 0) / probes.length
    return Math.round(avg * 10) / 10
  }, [probes])

  const lastMeasurementCount = useMemo(() => {
    return probes.length * 125
  }, [probes])

  const handleToggleAll = useCallback(() => {
    if (selectedIds.length === probes.length) {
      setSelectedIds([])
      return
    }
    setSelectedIds(probes.map((probe) => probe.Id_Sonde))
  }, [probes, selectedIds.length])

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
    setProbes(MOCK_PROBES)
  }

  const handleLaunchTests = async () => {
    if (selectedIds.length === 0) return

    setIsLoading(true)
    try {
      console.log("Launching tests for probes:", selectedIds)
      await new Promise((resolve) => setTimeout(resolve, 1500))
    } finally {
      setIsLoading(false)
    }
  }

  const columns = useMemo(
    () =>
      buildProbeColumns({
        probes,
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
            probe: t('table.columns.probe'),
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
    [handleToggleAll, handleToggleOne, probes, selectedIds, t],
  )

  return (
    <div className="space-y-6">
      <TestConnectionStats
        globalResponseRate={globalResponseRate}
        probeCount={probes.length}
        lastMeasurementCount={lastMeasurementCount}
        selectedCount={selectedIds.length}
      />

      <ProbesTableCard
        probes={probes}
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
