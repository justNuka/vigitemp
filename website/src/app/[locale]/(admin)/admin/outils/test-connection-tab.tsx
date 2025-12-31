"use client"

import { useCallback, useMemo, useState } from "react"

import { buildProbeColumns } from "./_components/build-probe-columns"
import { MOCK_PROBES } from "./_components/mock-probes"
import { ProbesTableCard } from "./_components/probes-table-card"
import { TestConnectionStats } from "./_components/test-connection-stats"
import type { ProbeWithSelection } from "./_components/probe-types"

export function TestConnectionTab() {
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
    () => buildProbeColumns({ probes, selectedIds, onToggleAll: handleToggleAll, onToggleOne: handleToggleOne }),
    [handleToggleAll, handleToggleOne, probes, selectedIds],
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
