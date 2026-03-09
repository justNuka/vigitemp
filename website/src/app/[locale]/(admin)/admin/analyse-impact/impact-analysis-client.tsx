"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { TrendingUp, Save, Download } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import type { Chart as ChartJS } from "chart.js"
import { fetchJson } from "@/lib/http"
import { useMonitoringRangeMeasurements } from "@/components/monitoring-details/use-monitoring-range-measurements"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LieuDateSelector } from "./_components/lieu-date-selector"
import { ImpactSummaryCard } from "./_components/impact-summary-card"
import { ImpactChart, type RealAlarm } from "./_components/impact-chart"
import { ImpactAlarmsTable } from "./_components/impact-alarms-table"
import { SaveAnalysisDialog } from "./_components/save-analysis-dialog"
import { computeSimulatedZones } from "./lib/simulated-zones"

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

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function ImpactAnalysisClient() {
  const t = useTranslations("impactAnalysis")
  const locale = useLocale()
  const [lieu, setLieu] = useState<SelectedLieu | null>(null)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null)
  const [step, setStep] = useState<Step>("select")
  const [newToleranceSup, setNewToleranceSup] = useState<string>("")
  const [newToleranceInf, setNewToleranceInf] = useState<string>("")
  const [realAlarms, setRealAlarms] = useState<RealAlarm[]>([])
  const [alarmsLoading, setAlarmsLoading] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)

  const chartRef = useRef<ChartJS<"line"> | null>(null)

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
      setAlarmsLoading(false)
      return
    }

    let isActive = true
    const controller = new AbortController()

    const load = async () => {
      setAlarmsLoading(true)
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
      } finally {
        if (isActive) setAlarmsLoading(false)
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

  const simZones = useMemo(
    () =>
      newSupNum !== null && newInfNum !== null && !hasValidationError
        ? computeSimulatedZones(measurements, newSupNum, newInfNum, actualSup, actualInf)
        : [],
    [measurements, newSupNum, newInfNum, actualSup, actualInf, hasValidationError],
  )

  const handleExportCSV = useCallback(() => {
    const header = "Debut,Fin,Duree(min),Points\n"
    const rows = simZones.map((zone) => {
      const diffMs = new Date(zone.end).getTime() - new Date(zone.start).getTime()
      const durationMin = Math.round(diffMs / 60000)
      const points = measurements.filter(
        (m) =>
          (m.DateHeureMesureIso ?? m.DateHeureMesure) >= zone.start &&
          (m.DateHeureMesureIso ?? m.DateHeureMesure) <= zone.end,
      ).length
      return `${zone.start},${zone.end},${durationMin},${points}`
    })
    const csv = header + rows.join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    downloadBlob(blob, `analyse-impact-${lieu?.nom ?? "export"}.csv`)
  }, [simZones, measurements, lieu])

  const handleExportImage = useCallback(() => {
    const chart = chartRef.current
    if (!chart) return
    const dataUrl = chart.toBase64Image("image/png", 1)
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = `analyse-impact-${lieu?.nom ?? "graphique"}.png`
    link.click()
  }, [lieu])

  return (
    <div className="flex flex-col pb-6">
      <LieuDateSelector
        selectedLieu={lieu}
        dateRange={dateRange}
        onLieuChange={handleLieuChange}
        onDateRangeChange={handleDateRangeChange}
        onAnalyze={handleAnalyze}
      />

      {step === "select" && (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3 text-muted-foreground">
          <TrendingUp className="h-12 w-12 opacity-20" />
          <p className="text-sm max-w-sm">{t("emptyState.description")}</p>
        </div>
      )}

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

          {/* Actions bar */}
          <div className="flex items-center justify-end gap-2 mx-6 mt-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSaveDialogOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              {t("save.button")}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                  <Download className="h-4 w-4" />
                  {t("export.button")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV}>
                  {t("export.csv")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportImage}>
                  {t("export.image")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <ImpactChart
            measurements={measurements}
            realAlarms={realAlarms}
            actualSup={actualSup}
            actualInf={actualInf}
            newSup={!hasValidationError ? newSupNum : null}
            newInf={!hasValidationError ? newInfNum : null}
            unit={lieu.unit}
            isLoading={measuresLoading}
            alarmsLoading={alarmsLoading}
            onChartReady={(chart) => {
              chartRef.current = chart
            }}
          />

          <ImpactAlarmsTable
            simZones={simZones}
            realAlarms={realAlarms}
            measurements={measurements}
            locale={locale}
            isLoading={measuresLoading || alarmsLoading}
          />

          <SaveAnalysisDialog
            open={saveDialogOpen}
            onOpenChange={setSaveDialogOpen}
            lieuId={lieu.id}
            lieuNom={lieu.nom}
            dateFrom={dateRange?.from.toISOString() ?? ""}
            dateTo={dateRange?.to.toISOString() ?? ""}
            newToleranceSup={newSupNum}
            newToleranceInf={newInfNum}
            simAlarmCount={simZones.length}
            realAlarmCount={realAlarms.length}
          />
        </>
      )}
    </div>
  )
}
