"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchJson } from "@/lib/http"
import { useMonitoringRangeMeasurements } from "@/components/monitoring-details/use-monitoring-range-measurements"
import { LieuDateSelector } from "./_components/lieu-date-selector"
import { ImpactSummaryCard } from "./_components/impact-summary-card"
import { ImpactChart, type RealAlarm } from "./_components/impact-chart"
import { emtModeFromDb } from "@/lib/emt"

export type SelectedLieu = {
  id: number
  nom: string
  consigne: number | null
  consigneSup: number | null
  consigneInf: number | null
  toleranceSup: number | null
  toleranceInf: number | null
  emtModeDb: number | null
  unit: string
}

type Step = "select" | "analyzing"

interface AlarmsRangeResponse {
  alarms: RealAlarm[]
}

function getDefaultTolerances(lieu: SelectedLieu): { sup: string; inf: string } {
  const sup = lieu.toleranceSup ?? lieu.consigneSup
  const inf = lieu.toleranceInf ?? lieu.consigneInf
  return {
    sup: sup !== null ? String(sup) : "",
    inf: inf !== null ? String(inf) : "",
  }
}

export function ImpactAnalysisClient() {
  const [lieu, setLieu] = useState<SelectedLieu | null>(null)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null)
  const [step, setStep] = useState<Step>("select")
  const [newToleranceSup, setNewToleranceSup] = useState<string>("")
  const [newToleranceInf, setNewToleranceInf] = useState<string>("")
  const [realAlarms, setRealAlarms] = useState<RealAlarm[]>([])

  const handleAnalyze = useCallback(() => {
    if (!lieu || !dateRange) return
    setStep("analyzing")
    if (lieu) {
      const defaults = getDefaultTolerances(lieu)
      setNewToleranceSup(defaults.sup)
      setNewToleranceInf(defaults.inf)
    }
  }, [lieu, dateRange])

  const handleLieuChange = useCallback((newLieu: SelectedLieu | null) => {
    setLieu(newLieu)
    setStep("select")
    setRealAlarms([])
  }, [])

  const handleDateRangeChange = useCallback(
    (range: { from: Date; to: Date } | null) => {
      setDateRange(range)
      setStep("select")
      setRealAlarms([])
    },
    [],
  )

  const handleReset = useCallback(() => {
    if (!lieu) return
    const defaults = getDefaultTolerances(lieu)
    setNewToleranceSup(defaults.sup)
    setNewToleranceInf(defaults.inf)
  }, [lieu])

  useEffect(() => {
    if (!lieu || !dateRange || step !== "analyzing") {
      setRealAlarms([])
      return
    }

    let isActive = true
    const controller = new AbortController()

    const load = async () => {
      try {
        const params = new URLSearchParams({
          idLieu: String(lieu.id),
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString(),
        })
        const data = await fetchJson<AlarmsRangeResponse>(
          `/api/alarmes/range?${params.toString()}`,
          { signal: controller.signal, credentials: "include" },
        )
        if (isActive) {
          setRealAlarms(data.alarms)
        }
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return
        if (isActive) setRealAlarms([])
      }
    }

    void load()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [lieu, dateRange, step])

  const { data: measurements, isLoading: measuresLoading } =
    useMonitoringRangeMeasurements(lieu?.id ?? 0, {
      enabled: step === "analyzing" && !!lieu,
      rangeStart: dateRange?.from ?? null,
      rangeEnd: dateRange?.to ?? null,
      includeNullNonResponse: false,
    })

  const newSupNum =
    newToleranceSup !== "" ? parseFloat(newToleranceSup) : null
  const newInfNum =
    newToleranceInf !== "" ? parseFloat(newToleranceInf) : null
  const hasValidationError =
    newSupNum !== null && newInfNum !== null && newInfNum >= newSupNum

  const actualSup = lieu
    ? (lieu.toleranceSup ?? lieu.consigneSup)
    : null
  const actualInf = lieu
    ? (lieu.toleranceInf ?? lieu.consigneInf)
    : null

  const emtMode = emtModeFromDb(lieu?.emtModeDb ?? null)
  void emtMode

  return (
    <div className="flex flex-col gap-0">
      <LieuDateSelector
        selectedLieu={lieu}
        dateRange={dateRange}
        onLieuChange={handleLieuChange}
        onDateRangeChange={handleDateRangeChange}
        onAnalyze={handleAnalyze}
      />

      {step === "analyzing" && lieu && (
        <>
          <ImpactSummaryCard
            lieu={lieu}
            measureCount={measurements.length}
            newSup={newToleranceSup}
            newInf={newToleranceInf}
            onNewSupChange={setNewToleranceSup}
            onNewInfChange={setNewToleranceInf}
            onReset={handleReset}
          />

          <ImpactChart
            measurements={measurements}
            realAlarms={realAlarms}
            actualSup={actualSup}
            actualInf={actualInf}
            newSup={!hasValidationError ? newSupNum : null}
            newInf={!hasValidationError ? newInfNum : null}
            unit={lieu.unit}
            isLoading={measuresLoading}
          />
        </>
      )}
    </div>
  )
}
