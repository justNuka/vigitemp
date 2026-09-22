"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { TrendingUp, Save, Download } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import type { Chart as ChartJS } from "chart.js"
import { fetchJson } from "@/lib/http"
import { formatDbDateTime, parseDbDateTime } from "@/lib/date-display"
import { exportStyledExcel } from "@/lib/excel-export"
import { toApiUtcDateTime } from "@/lib/date-range-api"
import { useMonitoringRangeMeasurements } from "@/components/monitoring-details/use-monitoring-range-measurements"
import { Button } from "@/components/ui/button"
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
  const [isExportingExcel, setIsExportingExcel] = useState(false)

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
          startDate: toApiUtcDateTime(dateRange.from),
          endDate: toApiUtcDateTime(dateRange.to),
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

  const handleExportExcel = useCallback(async () => {
    if (!lieu || isExportingExcel) return

    setIsExportingExcel(true)
    try {
      const localeTag = locale === "fr" ? "fr-FR" : locale
      const chartDataUrl = chartRef.current?.toBase64Image("image/png", 1) ?? null
      const formatDurationMinutes = (start: string, end: string | null) => {
        if (!end) return ""
        const startDate = parseDbDateTime(start)
        const endDate = parseDbDateTime(end)
        if (!startDate || !endDate) return ""
        return Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 60000))
      }
      const countZonePoints = (start: string, end: string) =>
        measurements.filter((measure) => {
          const timestamp = measure.DateHeureMesureIso ?? measure.DateHeureMesure
          return timestamp >= start && timestamp <= end
        }).length

      await exportStyledExcel({
        fileName: `analyse-impact-${lieu.nom.replace(/[^a-zA-Z0-9-_]+/g, "-")}`,
        title: `${t("title")} - ${lieu.nom}`,
        presentationSheetName: t("export.presentation_sheet"),
        dataSheetName: t("export.data_sheet"),
        presentationHeaders: [
          t("export.presentation_columns.label"),
          t("export.presentation_columns.value"),
        ],
        presentationRows: [
          {
            label: t("export.exported_at"),
            value: formatDbDateTime(new Date(), { format: "dateTimeSeconds", locale: localeTag }),
          },
          {
            label: t("selector.dateRangeLabel"),
            value: dateRange
              ? `${formatDbDateTime(dateRange.from, { format: "dateTimeSeconds", locale: localeTag })} → ${formatDbDateTime(dateRange.to, { format: "dateTimeSeconds", locale: localeTag })}`
              : "-",
          },
          { label: t("summary.consigne"), value: lieu.consigne ?? "-" },
          { label: t("summary.toleranceSup"), value: actualSup ?? "-" },
          { label: t("summary.toleranceInf"), value: actualInf ?? "-" },
          { label: t("summary.newToleranceSup"), value: newSupNum ?? "-" },
          { label: t("summary.newToleranceInf"), value: newInfNum ?? "-" },
          { label: t("summary.measureCount"), value: measurements.length },
          { label: t("table.simTitle", { count: simZones.length }), value: simZones.length },
          { label: t("table.realTitle", { count: realAlarms.length }), value: realAlarms.length },
        ],
        presentationImage: chartDataUrl
          ? {
              dataUrl: chartDataUrl,
              title: t("chart.title"),
            }
          : null,
        dataHeaders: [
          t("export.columns.kind"),
          t("table.colStart"),
          t("table.colEnd"),
          t("export.columns.duration_minutes"),
          t("table.colPoints"),
          t("table.colType"),
        ],
        dataRows: [
          ...simZones.map((zone) => [
            t("export.kinds.simulated"),
            formatDbDateTime(zone.start, { format: "dateTimeSeconds", locale: localeTag }),
            formatDbDateTime(zone.end, { format: "dateTimeSeconds", locale: localeTag }),
            formatDurationMinutes(zone.start, zone.end),
            countZonePoints(zone.start, zone.end),
            "",
          ]),
          ...realAlarms.map((alarm) => [
            t("export.kinds.real"),
            formatDbDateTime(alarm.Date_Heure_Debut, { format: "dateTimeSeconds", locale: localeTag }),
            alarm.Date_Heure_Fin
              ? formatDbDateTime(alarm.Date_Heure_Fin, { format: "dateTimeSeconds", locale: localeTag })
              : "",
            formatDurationMinutes(alarm.Date_Heure_Debut, alarm.Date_Heure_Fin),
            "",
            alarm.Type ?? "",
          ]),
        ],
      })
    } finally {
      setIsExportingExcel(false)
    }
  }, [
    actualInf,
    actualSup,
    dateRange,
    isExportingExcel,
    lieu,
    locale,
    measurements,
    newInfNum,
    newSupNum,
    realAlarms,
    simZones,
    t,
  ])

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
            <Button
              variant="outline"
              size="sm"
              disabled={isExportingExcel}
              onClick={() => void handleExportExcel()}
              className="flex items-center gap-1.5"
            >
              <Download className="h-4 w-4" />
              {isExportingExcel ? t("export.loading") : t("export.excel")}
            </Button>
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
            dateFrom={dateRange?.from ? toApiUtcDateTime(dateRange.from) : ""}
            dateTo={dateRange?.to ? toApiUtcDateTime(dateRange.to) : ""}
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
