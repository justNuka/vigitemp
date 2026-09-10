"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react"
import {
  ArrowRight,
  BadgeInfo,
  ChevronLeft,
  Clock3,
  FileArchive,
  FlaskConical,
  Plus,
  Play,
  Square,
  Timer,
  UserRound,
  X,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { useAppAccess } from "@/components/access/app-access-provider"
import { TanStackTable } from "@/components/data-table/tanstack-table"
import { PageHeader } from "@/components/page-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAdjustmentSensors, type AdjustmentSensorRow } from "@/hooks/useAdjustmentSensors"
import { useIntercomparisonMedia } from "@/hooks/useIntercomparisonMedia"
import { useStandards } from "@/hooks/useStandards"
import { formatDbDateTime } from "@/lib/date-display"
import { fetchJson, getJson } from "@/lib/http"
import { formatMeasureValue } from "@/lib/measurements"
import {
  calculateCalibrationResult,
  DEFAULT_SENSOR_RESOLUTION,
} from "@/lib/metrology-calibration-calculations"
import type {
  CalibrationReading,
  PublicCalibrationSession,
} from "@/lib/metrology-calibration-session"
import type { MetrologyPreviewReading } from "@/lib/metrology-reading-preview"
import { MetrologySubpagesCards } from "../_components/metrology-subpages-cards"
import { MetrologyStartFeedback } from "../_components/metrology-start-feedback"
import { CalibrationCoefficientsCard } from "./calibration-coefficients-card"

type Step = "selection" | "calibration"
type SessionPayload = { session: PublicCalibrationSession | null }
type PreviewPayload = {
  readings: Record<number, MetrologyPreviewReading>
  standardReading: CalibrationReading | null
  readAt: string
}

function normalizeUnit(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase().replace(/\s+/g, "") || null
  if (!normalized) return null
  if (["c", "°c", "degc", "celsius"].includes(normalized)) return "°C"
  if (["%", "%rh", "rh", "%hr", "hr"].includes(normalized)) return "%"
  return normalized
}

function formatCampaignValue(value: number | null | undefined, unit?: string | null) {
  if (value == null || !Number.isFinite(value)) return "-"
  return `${formatMeasureValue(value, 3)}${unit ? ` ${unit}` : ""}`
}

function parseDiagnosticNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (value === null || value === undefined || value === "") return null
  const parsed = Number(String(value).replace(",", "."))
  return Number.isFinite(parsed) ? parsed : null
}

function formatDiagnosticNumber(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "-"
  return String(value)
}

function getDownloadFileName(contentDisposition: string | null, fallback: string) {
  const match = contentDisposition?.match(/filename="?([^";]+)"?/i)
  return match?.[1]?.trim() || fallback
}

export function CalibrationWorkflowClient() {
  const t = useTranslations("metrologyAdmin.calibrationPage")
  const tCommon = useTranslations("common")
  const tTables = useTranslations("tables")
  const { user } = useAppAccess()
  const queryClient = useQueryClient()
  const { data: sensors = [], isLoading: sensorsLoading } = useAdjustmentSensors()
  const { data: standards = [], isLoading: standardsLoading } = useStandards()
  const { data: media = [], isLoading: mediaLoading } = useIntercomparisonMedia(true)

  const [step, setStep] = useState<Step>("selection")
  const [selectedSensorIds, setSelectedSensorIds] = useState<number[]>([])
  const [operator, setOperator] = useState("")
  const [selectedStandardId, setSelectedStandardId] = useState("")
  const [selectedMediumId, setSelectedMediumId] = useState("")
  const [addSensorSearch, setAddSensorSearch] = useState("")
  const [addSensorDialogOpen, setAddSensorDialogOpen] = useState(false)
  const [previewReadingEnabled, setPreviewReadingEnabled] = useState(false)
  const [showCalculationDetails, setShowCalculationDetails] = useState(false)
  const [isExportingCalibrationZip, setIsExportingCalibrationZip] = useState(false)
  const [exportError, setExportError] = useState<Error | null>(null)
  const defaultOperator = [user?.Prenom, user?.Nom].filter(Boolean).join(" ").trim() || user?.Login || ""
  const operatorValue = operator || defaultOperator

  const sessionQuery = useQuery({
    queryKey: ["metrology-calibration-session"],
    queryFn: () => getJson<SessionPayload>("/api/metrologie/etalonnage/session"),
    refetchInterval: (query) => query.state.data?.session?.status === "running" ? 2_000 : false,
  })
  const session = sessionQuery.data?.session ?? null
  const running = session?.status === "running"
  const hasResults = Object.keys(session?.results ?? {}).length > 0
  const visibleStep = running ? "calibration" : step
  const previewIntervalMs = sensors.some(
    (sensor) => selectedSensorIds.includes(sensor.id) && sensor.isGso,
  )
    ? 60_000
    : 15_000
  const previewReadingQuery = useQuery({
    queryKey: [
      "metrology-reading-preview",
      "ETALONNAGE",
      selectedSensorIds,
      selectedStandardId,
      selectedMediumId,
    ],
    queryFn: ({ signal }) => fetchJson<PreviewPayload>("/api/metrologie/lecture-sondes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal,
      body: JSON.stringify({
        selectedSensorIds,
        operation: "ETALONNAGE",
        standardId: Number(selectedStandardId),
        mediumId: Number(selectedMediumId),
      }),
    }),
    enabled:
      previewReadingEnabled &&
      !running &&
      selectedSensorIds.length > 0 &&
      selectedStandardId.length > 0 &&
      selectedMediumId.length > 0 &&
      visibleStep === "calibration",
    refetchInterval: previewReadingEnabled ? previewIntervalMs : false,
    refetchIntervalInBackground: false,
  })
  const displayedReadings = running
    ? session?.latestReadings ?? {}
    : previewReadingQuery.data?.readings ?? {}
  const displayedStandardReading = running
    ? session?.latestStandardReading ?? null
    : previewReadingQuery.data?.standardReading ?? null

  useEffect(() => {
    if (!session) return
    if (session.status !== "running") {
      if (step === "selection") {
        queryClient.setQueryData<SessionPayload>(["metrology-calibration-session"], { session: null })
      }
      return
    }
    setSelectedSensorIds(session.sensors.map((sensor) => sensor.id))
    setSelectedStandardId(String(session.standardId))
    setSelectedMediumId(String(session.mediumId))
    setOperator(session.operator)
    setStep("calibration")
  }, [queryClient, session, step])

  const startOperationMutation = useMutation({
    mutationFn: () => fetchJson<SessionPayload>("/api/metrologie/etalonnage/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        selectedSensorIds,
        operator: operatorValue,
        standardId: Number(selectedStandardId),
        mediumId: Number(selectedMediumId),
      }),
    }),
    onSuccess: (data) => {
      queryClient.setQueryData(["metrology-calibration-session"], data)
      setShowCalculationDetails(false)
      setExportError(null)
      setStep("calibration")
    },
  })

  const stopMutation = useMutation({
    mutationFn: () => fetchJson<SessionPayload>("/api/metrologie/etalonnage/session", {
      method: "DELETE",
      credentials: "include",
    }),
    onSuccess: (data) => {
      queryClient.setQueryData(["metrology-calibration-session"], data)
      if (data.session) {
        setSelectedSensorIds(data.session.sensors.map((sensor) => sensor.id))
        setOperator(data.session.operator)
      }
    },
  })

  const stopPreviewMutation = useMutation({
    mutationFn: () => fetchJson<{ stopped: boolean }>("/api/metrologie/lecture-sondes", {
      method: "DELETE",
      credentials: "include",
    }),
    onSettled: () => {
      setPreviewReadingEnabled(false)
    },
  })

  const exportCalibrationZip = async () => {
    if (!session || isExportingCalibrationZip) return
    const ids = Object.values(session.results).map((result) => result.calibrationId)
    if (ids.length === 0) return

    setIsExportingCalibrationZip(true)
    setExportError(null)
    try {
      const response = await fetch("/api/metrologie/etalonnage/report/bulk", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { message?: string } | null
        throw new Error(payload?.message || tCommon("error"))
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = getDownloadFileName(response.headers.get("Content-Disposition"), "Etalonnages.zip")
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      setExportError(error instanceof Error ? error : new Error(tCommon("error")))
    } finally {
      setIsExportingCalibrationZip(false)
    }
  }

  const selectedSensors = useMemo(
    () => sensors.filter((sensor) => selectedSensorIds.includes(sensor.id)),
    [selectedSensorIds, sensors],
  )
  const selectedMedium = useMemo(
    () => media.find((item) => String(item.Id_Milieu) === selectedMediumId) ?? null,
    [media, selectedMediumId],
  )
  const lockedUnit = useMemo(() => {
    const knownSelectedUnits = selectedSensors
      .map((sensor) => normalizeUnit(sensor.unit))
      .filter((value): value is string => Boolean(value))
    return knownSelectedUnits[0] ?? null
  }, [selectedSensors])

  const eligibleStandards = useMemo(
    () => standards.filter((standard) => {
      if (standard.Est_Sonde_Externe) return false
      if ((standard.Type_Etalon ?? "").trim().toUpperCase() !== "SPET") return false
      const standardUnit = normalizeUnit(standard.Unite)
      return lockedUnit === null || standardUnit === null || standardUnit === lockedUnit
    }),
    [lockedUnit, standards],
  )
  const displayedStandardSerial =
    session?.standardSerial ??
    eligibleStandards.find((standard) => String(standard.Id_Etalon) === selectedStandardId)
      ?.Etalon_Numero_Serie ??
    "-"

  const runningUnit = normalizeUnit(selectedSensors[0]?.unit)
  const addSensorCandidates = useMemo(() => {
    if (running) return []
    const ids = new Set(selectedSensorIds)
    const query = addSensorSearch.trim().toLowerCase()
    return sensors
      .filter((sensor) => !ids.has(sensor.id))
      .filter((sensor) => runningUnit === null || normalizeUnit(sensor.unit) === runningUnit)
      .filter((sensor) => {
        if (!query) return true
        return sensor.serialNumber.toLowerCase().includes(query) || sensor.locationName?.toLowerCase().includes(query)
      })
      .slice(0, 20)
  }, [addSensorSearch, running, runningUnit, selectedSensorIds, sensors])

  const selectionSummaryColumns = useMemo<ColumnDef<AdjustmentSensorRow>[]>(
    () => [
      { accessorKey: "serialNumber", header: t("workflow.selection.table.columns.serial") },
      {
        accessorKey: "locationName",
        header: t("workflow.selection.table.columns.location"),
        cell: ({ row }) => row.original.locationName ?? t("workflow.selection.unassigned"),
      },
      {
        accessorKey: "unit",
        header: t("workflow.selection.table.columns.unit"),
        cell: ({ row }) => row.original.unit ?? t("workflow.selection.table.unitUnknown"),
      },
      {
        id: "remove",
        enableSorting: false,
        header: tTables("actions"),
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={running}
            onClick={() => setSelectedSensorIds((current) => current.filter((id) => id !== row.original.id))}
          >
            <X className="mr-1 h-4 w-4" />
            {t("workflow.selection.remove", { serial: row.original.serialNumber })}
          </Button>
        ),
      },
    ],
    [running, t, tTables],
  )

  const sensorsColumns = useMemo<ColumnDef<AdjustmentSensorRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        header: ({ table }) => {
          const filteredSensors = table.getFilteredRowModel().rows.map((row) => row.original)
          const filteredUnits = new Set(
            filteredSensors.map((sensor) => normalizeUnit(sensor.unit)).filter((unit): unit is string => Boolean(unit)),
          )
          const canSelectFiltered = lockedUnit !== null || filteredUnits.size <= 1
          const filteredSelectableIds = filteredSensors
            .filter((sensor) => lockedUnit === null || normalizeUnit(sensor.unit) === lockedUnit)
            .map((sensor) => sensor.id)
          const allFilteredSelected =
            filteredSelectableIds.length > 0 && filteredSelectableIds.every((id) => selectedSensorIds.includes(id))
          const someFilteredSelected = filteredSelectableIds.some((id) => selectedSensorIds.includes(id))

          return (
            <div className="flex justify-center">
              <Checkbox
                checked={allFilteredSelected ? true : someFilteredSelected ? "indeterminate" : false}
                disabled={running || !canSelectFiltered || filteredSelectableIds.length === 0}
                onCheckedChange={(checked) => {
                  setSelectedSensorIds((current) => checked === true
                    ? Array.from(new Set([...current, ...filteredSelectableIds]))
                    : current.filter((id) => !filteredSelectableIds.includes(id)))
                }}
                aria-label={t("workflow.selection.selectAll")}
              />
            </div>
          )
        },
        cell: ({ row }) => {
          const id = row.original.id
          return (
            <div className="flex justify-center">
              <Checkbox
                checked={selectedSensorIds.includes(id)}
                disabled={running || (lockedUnit !== null && normalizeUnit(row.original.unit) !== lockedUnit)}
                onCheckedChange={(checked) => {
                  setSelectedSensorIds((current) => checked === true
                    ? Array.from(new Set([...current, id]))
                    : current.filter((item) => item !== id))
                }}
                aria-label={t("workflow.selection.table.selectOne", { serial: row.original.serialNumber })}
              />
            </div>
          )
        },
      },
      { accessorKey: "serialNumber", header: t("workflow.selection.table.columns.serial") },
      {
        accessorKey: "locationName",
        header: t("workflow.selection.table.columns.location"),
        cell: ({ row }) => row.original.locationName ?? t("workflow.selection.unassigned"),
      },
      {
        accessorKey: "unit",
        header: t("workflow.selection.table.columns.unit"),
        cell: ({ row }) => row.original.unit ?? t("workflow.selection.table.unitUnknown"),
      },
    ],
    [lockedUnit, running, selectedSensorIds, t],
  )

  const error =
    exportError ??
    stopPreviewMutation.error ??
    stopMutation.error

  const startOrReadingError = startOperationMutation.error ?? previewReadingQuery.error

  const canStartOperation =
    !running &&
    selectedSensorIds.length > 0 &&
    operatorValue.trim().length > 0 &&
    selectedStandardId.length > 0 &&
    selectedMediumId.length > 0 &&
    !startOperationMutation.isPending

  const phaseLabel = !session
    ? previewReadingEnabled
      ? t("workflow.enhanced.phase_reading")
      : t("workflow.enhanced.phase_ready")
    : session.status === "completed"
      ? t("workflow.enhanced.phase_completed")
      : session.phase === "acquiring"
        ? t("workflow.enhanced.phase_acquiring")
        : t("workflow.enhanced.phase_reading")

  return (
    <>
      <PageHeader title={t("header.title")} description={t("header.description")} />
      <div className="min-w-0 space-y-6 p-6 pb-28">
        {selectedSensorIds.length > 0 ? (
          <Alert className="border-primary/30 bg-primary/5">
            <ArrowRight className="h-4 w-4 text-primary" />
            <AlertTitle>{t("workflow.selection.banner.title", { count: selectedSensorIds.length })}</AlertTitle>
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{t("workflow.selection.banner.description")}</span>
              {visibleStep === "selection" ? (
                <Button type="button" onClick={() => setStep("calibration")}>
                  {t("workflow.selection.continue")}
                </Button>
              ) : !running ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (previewReadingEnabled) stopPreviewMutation.mutate()
                    setStep("selection")
                  }}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {t("workflow.calibration.back")}
                </Button>
              ) : null}
            </AlertDescription>
          </Alert>
        ) : null}

        {lockedUnit ? (
          <Alert className="border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-100">
            <BadgeInfo className="h-4 w-4 text-sky-700 dark:text-sky-300" />
            <AlertTitle>{t("workflow.selection.unitLock.title", { unit: lockedUnit })}</AlertTitle>
            <AlertDescription>{t("workflow.selection.unitLock.description")}</AlertDescription>
          </Alert>
        ) : null}

        <LazyMotion features={domAnimation}>
          <AnimatePresence mode="wait" initial={false}>
            {visibleStep === "selection" ? (
              <m.div
                key="selection"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>{t("workflow.selection.title")}</CardTitle>
                    <CardDescription>{t("workflow.selection.description")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TanStackTable
                      columns={sensorsColumns}
                      data={sensors}
                      searchField={["serialNumber", "locationName"]}
                      searchPlaceholder={t("workflow.selection.table.searchPlaceholder")}
                      isLoading={sensorsLoading}
                      emptyMessage={t("workflow.selection.empty")}
                      maxHeight="60vh"
                      headerClassName="!bg-sidebar !text-sidebar-foreground"
                      headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
                      tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
                      exportFileName={t("workflow.selection.table.exportFileName")}
                    />
                  </CardContent>
                </Card>

                {selectedSensors.length > 0 ? (
                  <Card className="border-primary/20 bg-primary/[0.02]">
                    <CardHeader>
                      <CardTitle>{t("workflow.selection.summary", { count: selectedSensors.length })}</CardTitle>
                      <CardDescription>{t("workflow.selection.summaryDescription")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TanStackTable
                        columns={selectionSummaryColumns}
                        data={selectedSensors}
                        emptyMessage={t("workflow.selection.noneSelected")}
                        maxHeight="32vh"
                        headerClassName="!bg-sidebar !text-sidebar-foreground"
                        headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
                        tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
                        exportFileName={t("workflow.selection.table.exportFileName")}
                      />
                    </CardContent>
                  </Card>
                ) : null}
              </m.div>
            ) : (
              <m.div
                key="calibration"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                className="space-y-6"
              >
                {startOperationMutation.isPending ? (
                  <Alert className="border-sky-300 bg-sky-50 text-sky-950 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-100">
                    <Clock3 className="h-4 w-4 text-sky-700 dark:text-sky-300" />
                    <AlertTitle>{t("workflow.enhanced.reading_queue_title")}</AlertTitle>
                    <AlertDescription>{t("workflow.enhanced.reading_queue_description")}</AlertDescription>
                  </Alert>
                ) : null}

                {error ? (
                  <Alert variant="destructive">
                    <AlertTitle>{t("workflow.common.error")}</AlertTitle>
                    <AlertDescription>{error instanceof Error ? error.message : String(error)}</AlertDescription>
                  </Alert>
                ) : null}

                {session?.message ? (
                  <Alert className={session.lastError ? "border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100" : undefined}>
                    <AlertDescription>{session.message}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="grid gap-4 xl:grid-cols-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserRound className="h-5 w-5" />
                        {t("workflow.calibration.general")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="calibration-operator">{t("workflow.calibration.operator")}</Label>
                        <Input
                          id="calibration-operator"
                          value={operatorValue}
                          onChange={(event) => setOperator(event.target.value)}
                          disabled={running}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock3 className="h-4 w-4" />
                        {formatDbDateTime(session?.startedAt || new Date(), { format: "dateTimeSeconds" })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FlaskConical className="h-5 w-5" />
                        {t("workflow.enhanced.reference_title")}
                      </CardTitle>
                      <CardDescription>{t("workflow.enhanced.reference_description")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t("workflow.enhanced.standard")}</Label>
                        <Select value={selectedStandardId} onValueChange={setSelectedStandardId} disabled={running || standardsLoading}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("workflow.enhanced.standard_placeholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            {eligibleStandards.map((standard) => (
                              <SelectItem key={standard.Id_Etalon} value={String(standard.Id_Etalon)}>
                                {standard.Etalon_Numero_Serie ?? `#${standard.Id_Etalon}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">{t("workflow.enhanced.standard_help")}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("workflow.enhanced.medium")}</Label>
                        <Select value={selectedMediumId} onValueChange={setSelectedMediumId} disabled={running || mediaLoading}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("workflow.enhanced.medium_placeholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            {media.map((item) => (
                              <SelectItem key={item.Id_Milieu} value={String(item.Id_Milieu)}>
                                {[item.Model, item.Reference].filter(Boolean).join(" / ") || `#${item.Id_Milieu}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">{t("workflow.enhanced.medium_help")}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Timer className="h-5 w-5" />
                        {t("workflow.calibration.cadence")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-semibold">1 min</div>
                      <p className="mt-2 text-sm text-muted-foreground">{t("workflow.calibration.cadenceDescription")}</p>
                      {session?.phase === "acquiring" ? (
                        <Badge className="mt-4" variant="secondary">
                          {t("workflow.enhanced.progress", {
                            count: session.capturedSampleCount,
                            target: session.sampleTarget,
                          })}
                        </Badge>
                      ) : null}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>{t("workflow.calibration.session")}</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <Badge variant={running ? "default" : "secondary"}>{phaseLabel}</Badge>

                      <MetrologyStartFeedback
                        error={startOrReadingError}
                        isPending={startOperationMutation.isPending}
                        sensors={selectedSensors}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={
                          running ||
                          stopPreviewMutation.isPending ||
                          selectedSensorIds.length === 0 ||
                          selectedStandardId.length === 0 ||
                          selectedMediumId.length === 0
                        }
                        onClick={() => {
                          if (previewReadingEnabled) {
                            stopPreviewMutation.mutate()
                          } else {
                            setPreviewReadingEnabled(true)
                          }
                        }}
                      >
                        {previewReadingEnabled ? (
                          <>
                            <Square className="mr-2 h-4 w-4" />
                            {t("workflow.enhanced.stop_reading")}
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            {t("workflow.calibration.startReading")}
                          </>
                        )}
                      </Button>

                      {previewReadingEnabled ? (
                        <p className="text-xs text-muted-foreground">
                          {previewReadingQuery.isFetching
                            ? t("workflow.enhanced.reading")
                            : t("workflow.enhanced.reading_active")}
                        </p>
                      ) : null}

                      {!running ? (
                        <Button
                          type="button"
                          className="w-full"
                          disabled={!canStartOperation || previewReadingQuery.isFetching}
                          onClick={() => {
                            setPreviewReadingEnabled(false)
                            startOperationMutation.mutate()
                          }}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          {t("workflow.calibration.start")}
                        </Button>
                      ) : session.phase === "acquiring" ? (
                        <p className="text-xs text-muted-foreground">
                          {t("workflow.enhanced.progress", {
                            count: session.capturedSampleCount,
                            target: session.sampleTarget,
                          })}
                        </p>
                      ) : null}

                      {running ? (
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => stopMutation.mutate()}
                          disabled={stopMutation.isPending}
                        >
                          <Square className="mr-2 h-4 w-4" />
                          {t("workflow.calibration.stop")}
                        </Button>
                      ) : null}
                    </CardContent>
                  </Card>
                </div>

                {!running && !startOperationMutation.isPending && selectedSensors.length > 0 ? (
                  <CalibrationCoefficientsCard
                    sensors={selectedSensors}
                    readingActive={previewReadingEnabled}
                    operator={operatorValue}
                    standardId={selectedStandardId}
                    mediumId={selectedMediumId}
                  />
                ) : null}

                <Card>
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <CardTitle>{t("workflow.enhanced.last_reading_title")}</CardTitle>
                      <CardDescription>{t("workflow.enhanced.last_reading_description")}</CardDescription>
                    </div>
                    {!running ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAddSensorDialogOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {t("workflow.enhanced.add_sensor")}
                      </Button>
                    ) : null}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="overflow-hidden rounded-lg border">
                      <Table>
                        <TableHeader className="bg-slate-950">
                          <TableRow className="hover:bg-slate-950">
                            <TableHead className="text-white">{t("workflow.table.serial")}</TableHead>
                            <TableHead className="text-white">{t("workflow.table.location")}</TableHead>
                            <TableHead className="text-white">{t("workflow.table.module")}</TableHead>
                            <TableHead className="text-white">{t("workflow.table.value")}</TableHead>
                            <TableHead className="text-white">{t("workflow.table.measuredAt")}</TableHead>
                            <TableHead className="text-white">{t("workflow.table.count")}</TableHead>
                            <TableHead className="text-white">{t("workflow.table.status")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="border-sky-300 bg-sky-100/90 text-base hover:bg-sky-100 dark:border-sky-500/50 dark:bg-sky-500/15 dark:hover:bg-sky-500/20">
                            <TableCell className="py-5 text-lg font-semibold text-sky-950 dark:text-sky-100">
                              {displayedStandardSerial}
                            </TableCell>
                            <TableCell className="py-5 font-medium text-sky-900 dark:text-sky-100">
                              {t("workflow.enhanced.standard_latest")}
                            </TableCell>
                            <TableCell className="py-5 text-sky-900 dark:text-sky-100">-</TableCell>
                            <TableCell className="py-5 font-mono text-xl font-bold text-sky-950 dark:text-sky-50">
                              {formatCampaignValue(
                                displayedStandardReading?.value,
                                displayedStandardReading?.unit ?? session?.standardUnit,
                              )}
                            </TableCell>
                            <TableCell className="py-5 text-sky-900 dark:text-sky-100">
                              {displayedStandardReading
                                ? formatDbDateTime(displayedStandardReading.measuredAt, { format: "dateTimeSeconds" })
                                : "-"}
                            </TableCell>
                            <TableCell className="py-5 text-sky-900 dark:text-sky-100">
                              {session?.standardSamples.length ?? 0}
                            </TableCell>
                            <TableCell className="py-5">
                              {displayedStandardReading?.error ? (
                                <span className="text-destructive">{displayedStandardReading.error}</span>
                              ) : displayedStandardReading?.value != null ? (
                                <span className="font-medium text-emerald-700 dark:text-emerald-300">
                                  {t("workflow.status.read")}
                                </span>
                              ) : (
                                <span className="text-sky-800 dark:text-sky-200">
                                  {t("workflow.status.waiting")}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                          {(session?.sensors ?? selectedSensors).map((sensor) => {
                            const reading = displayedReadings[sensor.id]
                            return (
                              <TableRow key={sensor.id}>
                                <TableCell className="font-medium">{sensor.serialNumber}</TableCell>
                                <TableCell>{sensor.locationName || t("workflow.selection.unassigned")}</TableCell>
                                <TableCell>{sensor.moduleName || "-"}</TableCell>
                                <TableCell>{formatCampaignValue(reading?.value, reading?.unit)}</TableCell>
                                <TableCell>{reading ? formatDbDateTime(reading.measuredAt, { format: "dateTimeSeconds" }) : "-"}</TableCell>
                                <TableCell>{session?.readingCounts[sensor.id] ?? 0}</TableCell>
                                <TableCell>
                                  {reading?.error
                                    ? <span className="text-destructive">{reading.error}</span>
                                    : reading?.value != null
                                      ? <span className="text-emerald-700 dark:text-emerald-300">{t("workflow.status.read")}</span>
                                      : <span className="text-muted-foreground">{t("workflow.status.waiting")}</span>}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <Dialog
                  open={addSensorDialogOpen}
                  onOpenChange={(open) => {
                    setAddSensorDialogOpen(open)
                    if (!open) setAddSensorSearch("")
                  }}
                >
                  <DialogContent className="max-w-xl">
                    <DialogHeader>
                      <DialogTitle>{t("workflow.enhanced.add_sensor")}</DialogTitle>
                      <DialogDescription>
                        {t("workflow.enhanced.add_sensor_description")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        value={addSensorSearch}
                        onChange={(event) => setAddSensorSearch(event.target.value)}
                        placeholder={t("workflow.selection.table.searchPlaceholder")}
                        autoFocus
                      />
                      <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                        {addSensorCandidates.length === 0 ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">
                            {t("workflow.selection.empty")}
                          </p>
                        ) : (
                          addSensorCandidates.map((sensor) => (
                            <div
                              key={sensor.id}
                              className="flex items-center justify-between gap-3 rounded-md border p-3"
                            >
                              <div className="min-w-0">
                                <div className="font-medium">{sensor.serialNumber}</div>
                                <div className="truncate text-xs text-muted-foreground">
                                  {sensor.locationName ?? t("workflow.selection.unassigned")} ·{" "}
                                  {sensor.unit ?? "-"}
                                </div>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                  setSelectedSensorIds((current) =>
                                    current.includes(sensor.id) ? current : [...current, sensor.id],
                                  )
                                  setAddSensorDialogOpen(false)
                                  setAddSensorSearch("")
                                }}
                              >
                                <Plus className="mr-1 h-4 w-4" />
                                {tCommon("add")}
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("workflow.enhanced.all_samples_title")}</CardTitle>
                    <CardDescription>{t("workflow.enhanced.all_samples_description")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {session?.standardSamples.length ? (
                      <div className="overflow-x-auto rounded-lg border">
                        <Table>
                          <TableHeader className="bg-slate-950">
                            <TableRow className="hover:bg-slate-950">
                              <TableHead className="whitespace-nowrap text-white">{t("workflow.enhanced.sample_number")}</TableHead>
                              <TableHead className="whitespace-nowrap bg-sky-900 text-white">
                                {t("workflow.enhanced.standard_column", { serial: session.standardSerial })}
                              </TableHead>
                              {session.sensors.map((sensor) => (
                                <TableHead key={sensor.id} className="whitespace-nowrap text-white">{sensor.serialNumber}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {session.standardSamples.slice(-10).map((standardSample) => (
                              <TableRow key={standardSample.order}>
                                <TableCell>{standardSample.order}</TableCell>
                                <TableCell className="bg-sky-50 font-medium text-sky-950 dark:bg-sky-500/10 dark:text-sky-100">
                                  {formatCampaignValue(standardSample.value, standardSample.unit)}
                                </TableCell>
                                {session.sensors.map((sensor) => {
                                  const sample = session.sensorSamples[sensor.id]?.find(
                                    (item) => item.order === standardSample.order,
                                  )
                                  return (
                                    <TableCell key={sensor.id} className="whitespace-nowrap">
                                      {formatCampaignValue(sample?.value, sample?.unit ?? sensor.unit)}
                                    </TableCell>
                                  )
                                })}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t("workflow.enhanced.no_samples")}</p>
                    )}
                  </CardContent>
                </Card>

                {hasResults && session ? (
                  <Card className="border-emerald-300/60 dark:border-emerald-500/30">
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <CardTitle>{t("workflow.enhanced.results_title")}</CardTitle>
                        <CardDescription>{t("workflow.enhanced.results_description")}</CardDescription>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isExportingCalibrationZip}
                        onClick={() => void exportCalibrationZip()}
                      >
                        <FileArchive className="mr-2 h-4 w-4" />
                        {isExportingCalibrationZip ? tCommon("loading") : `${tCommon("export")} PDF (.zip)`}
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="overflow-x-auto rounded-lg border">
                        <Table>
                          <TableHeader className="bg-emerald-950">
                            <TableRow className="hover:bg-emerald-950">
                              <TableHead className="text-white">{t("workflow.table.serial")}</TableHead>
                              <TableHead className="text-white">{t("workflow.enhanced.mean_standard")}</TableHead>
                              <TableHead className="text-white">{t("workflow.enhanced.mean_sensor")}</TableHead>
                              <TableHead className="text-white">{t("workflow.enhanced.accuracy_error")}</TableHead>
                              <TableHead className="text-white">{t("workflow.enhanced.uncertainty")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.values(session.results).map((result) => {
                              const unit = session.sensors.find((sensor) => sensor.id === result.sensorId)?.unit ?? session.standardUnit
                              return (
                                <TableRow key={result.sensorId}>
                                  <TableCell className="font-medium">{result.serialNumber}</TableCell>
                                  <TableCell>{formatCampaignValue(result.meanStandard, unit)}</TableCell>
                                  <TableCell>{formatCampaignValue(result.meanSensor, unit)}</TableCell>
                                  <TableCell>{formatCampaignValue(result.accuracyError, unit)}</TableCell>
                                  <TableCell>{formatCampaignValue(result.uncertainty, unit)}</TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCalculationDetails((current) => !current)}
                      >
                        {showCalculationDetails
                          ? t("workflow.enhanced.hide_calculation_details")
                          : t("workflow.enhanced.show_calculation_details")}
                      </Button>

                      {showCalculationDetails ? (
                        <div className="space-y-5">
                          {Object.values(session.results).map((result) => {
                            const sensor = session.sensors.find((item) => item.id === result.sensorId)
                            const sensorSamples = session.sensorSamples[result.sensorId] ?? []
                            const standardSamples = session.standardSamples
                            const mediumStability = parseDiagnosticNumber(selectedMedium?.Stabilite)
                            const mediumHomogeneity = parseDiagnosticNumber(selectedMedium?.Homogeneite)
                            let diagnostic: ReturnType<typeof calculateCalibrationResult> | null = null

                            if (
                              sensorSamples.length === standardSamples.length &&
                              sensorSamples.length > 0 &&
                              mediumStability != null &&
                              mediumHomogeneity != null
                            ) {
                              try {
                                diagnostic = calculateCalibrationResult(
                                  sensorSamples.map((sample) => sample.value),
                                  standardSamples.map((sample) => sample.value),
                                  {
                                    standardResolution: session.standardResolution,
                                    standardUncertainty: session.standardUncertainty,
                                    mediumStability,
                                    mediumHomogeneity,
                                    sensorResolution: DEFAULT_SENSOR_RESOLUTION,
                                  },
                                )
                              } catch {
                                diagnostic = null
                              }
                            }

                            const details = diagnostic?.details
                            const uncertaintyComponents = details
                              ? [
                                  ["U1", details.uncertainty.u1],
                                  ["U2", details.uncertainty.u2],
                                  ["U3", details.uncertainty.u3],
                                  ["U4", details.uncertainty.u4],
                                  ["U5", details.uncertainty.u5],
                                  ["U6", details.uncertainty.u6],
                                  ["U7", details.uncertainty.u7],
                                  ["U8", details.uncertainty.u8],
                                  ["U9", details.uncertainty.u9],
                                  ["U10", details.uncertainty.u10],
                                  ["U11", details.uncertainty.u11],
                                ] as const
                              : []

                            return (
                              <div key={result.sensorId} className="space-y-4 rounded-lg border bg-muted/20 p-4">
                                <div>
                                  <h4 className="font-semibold">
                                    {t("workflow.enhanced.calculation_details_title", { serial: result.serialNumber })}
                                  </h4>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {t("workflow.enhanced.calculation_details_description")}
                                  </p>
                                </div>

                                <div className="overflow-x-auto rounded-md border bg-background">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>{t("workflow.enhanced.sample_number")}</TableHead>
                                        <TableHead>{t("workflow.enhanced.raw_standard")}</TableHead>
                                        <TableHead>{t("workflow.enhanced.raw_sensor")}</TableHead>
                                        <TableHead>{t("workflow.enhanced.raw_difference")}</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {standardSamples.map((standardSample, index) => {
                                        const sensorSample = sensorSamples[index]
                                        return (
                                          <TableRow key={standardSample.order}>
                                            <TableCell>{standardSample.order}</TableCell>
                                            <TableCell className="font-mono text-xs">
                                              {formatDiagnosticNumber(standardSample.value)}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                              {formatDiagnosticNumber(sensorSample?.value)}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                              {sensorSample
                                                ? formatDiagnosticNumber(sensorSample.value - standardSample.value)
                                                : "-"}
                                            </TableCell>
                                          </TableRow>
                                        )
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>

                                {details ? (
                                  <>
                                    <div className="grid gap-3 lg:grid-cols-2">
                                      <div className="rounded-md border bg-background p-3 text-sm">
                                        <div className="font-medium">{t("workflow.enhanced.mean_standard")}</div>
                                        <div className="mt-2 font-mono text-xs break-all">
                                          {t("workflow.enhanced.standard_sum")}: {formatDiagnosticNumber(details.standardSum)}
                                        </div>
                                        <div className="mt-1 font-mono text-xs break-all">
                                          {formatDiagnosticNumber(details.standardSum)} / {details.sampleCount} = {formatDiagnosticNumber(details.meanStandard)}
                                        </div>
                                        <div className="mt-2 text-xs text-muted-foreground">
                                          {t("workflow.enhanced.server_value")}: <span className="font-mono">{formatDiagnosticNumber(result.meanStandard)}</span>
                                        </div>
                                      </div>

                                      <div className="rounded-md border bg-background p-3 text-sm">
                                        <div className="font-medium">{t("workflow.enhanced.mean_sensor")}</div>
                                        <div className="mt-2 font-mono text-xs break-all">
                                          {t("workflow.enhanced.sensor_sum")}: {formatDiagnosticNumber(details.sensorSum)}
                                        </div>
                                        <div className="mt-1 font-mono text-xs break-all">
                                          {formatDiagnosticNumber(details.sensorSum)} / {details.sampleCount} = {formatDiagnosticNumber(details.meanSensor)}
                                        </div>
                                        <div className="mt-2 text-xs text-muted-foreground">
                                          {t("workflow.enhanced.server_value")}: <span className="font-mono">{formatDiagnosticNumber(result.meanSensor)}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="rounded-md border bg-background p-3 text-sm">
                                      <div className="font-medium">{t("workflow.enhanced.accuracy_error")}</div>
                                      <div className="mt-2 font-mono text-xs break-all">
                                        {formatDiagnosticNumber(details.meanSensor)} - {formatDiagnosticNumber(details.meanStandard)} = {formatDiagnosticNumber(details.accuracyError)}
                                      </div>
                                      <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                                        <span>
                                          {t("workflow.enhanced.server_value")}: <span className="font-mono">{formatDiagnosticNumber(result.accuracyError)}</span>
                                        </span>
                                        <span>
                                          {t("workflow.enhanced.recalculated_value")}: <span className="font-mono">{formatDiagnosticNumber(details.accuracyError)}</span>
                                        </span>
                                      </div>
                                    </div>

                                    <div className="rounded-md border bg-background p-3 text-sm">
                                      <div className="font-medium">{t("workflow.enhanced.standard_deviation")}</div>
                                      <div className="mt-2 grid gap-1 font-mono text-xs break-all">
                                        <span>{t("workflow.enhanced.squared_deviation_sum")}: {formatDiagnosticNumber(details.standardDeviation.squaredDeviationSum)}</span>
                                        <span>{t("workflow.enhanced.variance")}: {formatDiagnosticNumber(details.standardDeviation.squaredDeviationSum)} / {details.standardDeviation.divisor} = {formatDiagnosticNumber(details.standardDeviation.variance)}</span>
                                        <span>√{formatDiagnosticNumber(details.standardDeviation.variance)} = {formatDiagnosticNumber(details.standardDeviation.value)}</span>
                                      </div>
                                      <div className="mt-2 text-xs text-muted-foreground">
                                        {t("workflow.enhanced.server_value")}: <span className="font-mono">{formatDiagnosticNumber(result.standardDeviation)}</span>
                                      </div>
                                    </div>

                                    <div className="space-y-3 rounded-md border bg-background p-3 text-sm">
                                      <div className="font-medium">{t("workflow.enhanced.uncertainty_components")}</div>
                                      <div className="grid gap-1 font-mono text-xs break-all md:grid-cols-2">
                                        <span>Résolution étalon: {formatDiagnosticNumber(details.uncertainty.standardResolution)}</span>
                                        <span>Incertitude étalon: {formatDiagnosticNumber(details.uncertainty.standardUncertainty)}</span>
                                        <span>Stabilité milieu: {formatDiagnosticNumber(details.uncertainty.mediumStability)}</span>
                                        <span>Homogénéité milieu: {formatDiagnosticNumber(details.uncertainty.mediumHomogeneity)}</span>
                                        <span>Résolution sonde: {formatDiagnosticNumber(details.uncertainty.sensorResolution)}</span>
                                        <span>√3: {formatDiagnosticNumber(details.uncertainty.sqrt3)}</span>
                                      </div>
                                      <div className="overflow-x-auto rounded-md border">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>{t("workflow.enhanced.component")}</TableHead>
                                              <TableHead>{t("workflow.enhanced.raw_value")}</TableHead>
                                              <TableHead>U²</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {uncertaintyComponents.map(([label, value]) => (
                                              <TableRow key={label}>
                                                <TableCell className="font-medium">{label}</TableCell>
                                                <TableCell className="font-mono text-xs">{formatDiagnosticNumber(value)}</TableCell>
                                                <TableCell className="font-mono text-xs">{formatDiagnosticNumber(value ** 2)}</TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                      <div className="grid gap-1 font-mono text-xs break-all">
                                        <span>{t("workflow.enhanced.uncertainty_squared_sum")}: {formatDiagnosticNumber(details.uncertainty.squaredSum)}</span>
                                        <span>√{formatDiagnosticNumber(details.uncertainty.squaredSum)} = {formatDiagnosticNumber(details.uncertainty.value)}</span>
                                      </div>
                                      <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                                        <span>
                                          {t("workflow.enhanced.server_value")}: <span className="font-mono">{formatDiagnosticNumber(result.uncertainty)}</span>
                                        </span>
                                        <span>
                                          {t("workflow.enhanced.recalculated_value")}: <span className="font-mono">{formatDiagnosticNumber(details.uncertainty.value)}</span>
                                        </span>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <Alert>
                                    <AlertDescription>
                                      {t("workflow.enhanced.calculation_details_description")}
                                    </AlertDescription>
                                  </Alert>
                                )}

                                <div className="text-xs text-muted-foreground">
                                  {sensor?.serialNumber ?? result.serialNumber}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                ) : null}
              </m.div>
            )}
          </AnimatePresence>
        </LazyMotion>

        <MetrologySubpagesCards current="calibration" disabled={running} />
      </div>
    </>
  )
}
