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
import type { PublicCalibrationSession } from "@/lib/metrology-calibration-session"
import { MetrologySubpagesCards } from "../_components/metrology-subpages-cards"

type Step = "selection" | "calibration"
type SessionPayload = { session: PublicCalibrationSession | null }

function normalizeUnit(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase().replace(/\s+/g, "") || null
  if (!normalized) return null
  if (["c", "°c", "degc", "celsius"].includes(normalized)) return "°C"
  if (["%", "%rh", "rh", "%hr", "hr"].includes(normalized)) return "%"
  return normalized
}

function formatCampaignValue(value: number | null | undefined, unit?: string | null) {
  if (value == null || !Number.isFinite(value)) return "-"
  return `${formatMeasureValue(value, 6)}${unit ? ` ${unit}` : ""}`
}

export function CalibrationWorkflowClient() {
  const t = useTranslations("metrologyAdmin.calibrationPage")
  const tCommon = useTranslations("common")
  const tTables = useTranslations("tables")
  const tSensorsDialog = useTranslations("sensorsDialog")
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
  const visibleStep = running || hasResults ? "calibration" : step
  const displayedReadings = session?.latestReadings ?? {}

  useEffect(() => {
    if (!session || (session.status !== "running" && Object.keys(session.results).length === 0)) return
    setSelectedSensorIds(session.sensors.map((sensor) => sensor.id))
    setSelectedStandardId(String(session.standardId))
    setSelectedMediumId(String(session.mediumId))
    setOperator(session.operator)
    setStep("calibration")
  }, [session])

  const startReadingMutation = useMutation({
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
      setStep("calibration")
    },
  })

  const startAcquisitionMutation = useMutation({
    mutationFn: () => fetchJson<SessionPayload>("/api/metrologie/etalonnage/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "start-acquisition" }),
    }),
    onSuccess: (data) => queryClient.setQueryData(["metrology-calibration-session"], data),
  })

  const addSensorMutation = useMutation({
    mutationFn: (sensorId: number) => fetchJson<SessionPayload>("/api/metrologie/etalonnage/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ sensorId }),
    }),
    onSuccess: (data) => {
      queryClient.setQueryData(["metrology-calibration-session"], data)
      if (data.session) setSelectedSensorIds(data.session.sensors.map((sensor) => sensor.id))
      setAddSensorSearch("")
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

  const selectedSensors = useMemo(
    () => sensors.filter((sensor) => selectedSensorIds.includes(sensor.id)),
    [selectedSensorIds, sensors],
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

  const runningUnit = normalizeUnit(session?.sensors[0]?.unit)
  const addSensorCandidates = useMemo(() => {
    if (!running || !session || session.phase !== "reading") return []
    const ids = new Set(session.sensors.map((sensor) => sensor.id))
    const query = addSensorSearch.trim().toLowerCase()
    return sensors
      .filter((sensor) => !ids.has(sensor.id))
      .filter((sensor) => runningUnit === null || normalizeUnit(sensor.unit) === runningUnit)
      .filter((sensor) => {
        if (!query) return true
        return sensor.serialNumber.toLowerCase().includes(query) || sensor.locationName?.toLowerCase().includes(query)
      })
      .slice(0, 8)
  }, [addSensorSearch, running, runningUnit, sensors, session])

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
    startReadingMutation.error ??
    startAcquisitionMutation.error ??
    addSensorMutation.error ??
    stopMutation.error

  const canStartReading =
    !running &&
    selectedSensorIds.length > 0 &&
    operatorValue.trim().length > 0 &&
    selectedStandardId.length > 0 &&
    selectedMediumId.length > 0 &&
    !startReadingMutation.isPending

  const phaseLabel = !session
    ? t("workflow.enhanced.phase_ready")
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
                <Button type="button" variant="outline" onClick={() => setStep("selection")}>
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
                {startReadingMutation.isPending ? (
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
                        {formatDbDateTime(session?.startedAt || new Date())}
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

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={running || !canStartReading}
                        onClick={() => startReadingMutation.mutate()}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {t("workflow.calibration.startReading")}
                      </Button>

                      <Button
                        type="button"
                        className="w-full"
                        disabled={
                          !running ||
                          session?.phase !== "reading" ||
                          !session.canStartAcquisition ||
                          startAcquisitionMutation.isPending
                        }
                        onClick={() => startAcquisitionMutation.mutate()}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {t("workflow.calibration.start")}
                      </Button>

                      {!running ? (
                        <p className="text-xs text-muted-foreground">{t("workflow.enhanced.start_reading_hint")}</p>
                      ) : session.phase === "reading" ? (
                        <p className="text-xs text-muted-foreground">
                          {session.canStartAcquisition
                            ? t("workflow.enhanced.reading_active")
                            : t("workflow.enhanced.reading_required")}
                        </p>
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

                {running && session?.phase === "reading" ? (
                  <Card className="border-primary/20 bg-primary/[0.02]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        {tSensorsDialog("title_create")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        value={addSensorSearch}
                        onChange={(event) => setAddSensorSearch(event.target.value)}
                        placeholder={t("workflow.selection.table.searchPlaceholder")}
                      />
                      <div className="max-h-56 space-y-2 overflow-y-auto">
                        {addSensorCandidates.length === 0 ? (
                          <p className="text-sm text-muted-foreground">{t("workflow.selection.empty")}</p>
                        ) : addSensorCandidates.map((sensor) => (
                          <div key={sensor.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                            <div className="min-w-0">
                              <div className="font-medium">{sensor.serialNumber}</div>
                              <div className="truncate text-xs text-muted-foreground">
                                {sensor.locationName ?? t("workflow.selection.unassigned")} · {sensor.unit ?? "-"}
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => addSensorMutation.mutate(sensor.id)}
                              disabled={addSensorMutation.isPending}
                            >
                              <Plus className="mr-1 h-4 w-4" />
                              {tCommon("add")}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                <Card>
                  <CardHeader>
                    <CardTitle>{t("workflow.enhanced.last_reading_title")}</CardTitle>
                    <CardDescription>{t("workflow.enhanced.last_reading_description")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-md border border-sky-200 bg-sky-50 p-3 dark:border-sky-500/40 dark:bg-sky-500/10">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className="font-medium text-sky-950 dark:text-sky-100">
                          {t("workflow.enhanced.standard_latest")}: {session?.standardSerial ?? "-"}
                        </span>
                        <span className="font-mono text-sky-900 dark:text-sky-100">
                          {formatCampaignValue(session?.latestStandardReading?.value, session?.latestStandardReading?.unit ?? session?.standardUnit)}
                        </span>
                        <span className="text-xs text-sky-800 dark:text-sky-200">
                          {session?.latestStandardReading ? formatDbDateTime(session.latestStandardReading.measuredAt) : "-"}
                        </span>
                      </div>
                    </div>

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
                          {(session?.sensors ?? selectedSensors).map((sensor) => {
                            const reading = displayedReadings[sensor.id]
                            return (
                              <TableRow key={sensor.id}>
                                <TableCell className="font-medium">{sensor.serialNumber}</TableCell>
                                <TableCell>{sensor.locationName || t("workflow.selection.unassigned")}</TableCell>
                                <TableCell>{sensor.moduleName || "-"}</TableCell>
                                <TableCell>{formatCampaignValue(reading?.value, reading?.unit)}</TableCell>
                                <TableCell>{reading ? formatDbDateTime(reading.measuredAt) : "-"}</TableCell>
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

                <Card>
                  <CardHeader>
                    <CardTitle>{t("workflow.enhanced.standard_samples_title")}</CardTitle>
                    <CardDescription>{t("workflow.enhanced.standard_samples_description")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {session?.standardSamples.length ? (
                      <div className="overflow-hidden rounded-lg border">
                        <Table>
                          <TableHeader className="bg-sky-950">
                            <TableRow className="hover:bg-sky-950">
                              <TableHead className="text-white">{t("workflow.enhanced.sample_number")}</TableHead>
                              <TableHead className="text-white">{t("workflow.enhanced.measured_at")}</TableHead>
                              <TableHead className="text-white">{t("workflow.table.value")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {session.standardSamples.map((sample) => (
                              <TableRow key={sample.order} className="bg-sky-50/70 dark:bg-sky-500/5">
                                <TableCell>{sample.order}</TableCell>
                                <TableCell>{formatDbDateTime(sample.measuredAt)}</TableCell>
                                <TableCell className="font-medium">{formatCampaignValue(sample.value, sample.unit)}</TableCell>
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
                            {session.standardSamples.map((standardSample, index) => (
                              <TableRow key={standardSample.order}>
                                <TableCell>{standardSample.order}</TableCell>
                                <TableCell className="bg-sky-50 font-medium text-sky-950 dark:bg-sky-500/10 dark:text-sky-100">
                                  {formatCampaignValue(standardSample.value, standardSample.unit)}
                                </TableCell>
                                {session.sensors.map((sensor) => {
                                  const sample = session.sensorSamples[sensor.id]?.[index]
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
                    <CardHeader>
                      <CardTitle>{t("workflow.enhanced.results_title")}</CardTitle>
                      <CardDescription>{t("workflow.enhanced.results_description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto rounded-lg border">
                        <Table>
                          <TableHeader className="bg-emerald-950">
                            <TableRow className="hover:bg-emerald-950">
                              <TableHead className="text-white">{t("workflow.table.serial")}</TableHead>
                              <TableHead className="text-white">{t("workflow.enhanced.mean_sensor")}</TableHead>
                              <TableHead className="text-white">{t("workflow.enhanced.mean_standard")}</TableHead>
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
                                  <TableCell>{formatCampaignValue(result.meanSensor, unit)}</TableCell>
                                  <TableCell>{formatCampaignValue(result.meanStandard, unit)}</TableCell>
                                  <TableCell>{formatCampaignValue(result.accuracyError, unit)}</TableCell>
                                  <TableCell>{formatCampaignValue(result.uncertainty, unit)}</TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </m.div>
            )}
          </AnimatePresence>
        </LazyMotion>

        <Card>
          <CardHeader>
            <CardTitle>{t("workflow.navigation.title")}</CardTitle>
            <CardDescription>{t("workflow.navigation.description")}</CardDescription>
          </CardHeader>
          <CardContent><MetrologySubpagesCards current="calibration" /></CardContent>
        </Card>
      </div>
    </>
  )
}
