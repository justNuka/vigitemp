"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react"
import { ArrowRight, BadgeInfo, ChevronLeft, Clock3, Play, Square, Timer, UserRound } from "lucide-react"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAdjustmentSensors, type AdjustmentSensorRow } from "@/hooks/useAdjustmentSensors"
import { formatDbDateTime } from "@/lib/date-display"
import { fetchJson, getJson } from "@/lib/http"
import { formatMeasureValue } from "@/lib/measurements"
import type { PublicCalibrationSession } from "@/lib/metrology-calibration-session"
import type { MetrologyPreviewReading } from "@/lib/metrology-reading-preview"
import { MetrologySubpagesCards } from "../_components/metrology-subpages-cards"

type Step = "selection" | "calibration"
type SessionPayload = { session: PublicCalibrationSession | null }

function normalizeUnit(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase().replace(/\s+/g, "") || null
  if (!normalized) return null
  if (["c", "Â°c", "degc", "celsius"].includes(normalized)) return "tempÃ©rature: Â°C"
  if (["%", "%rh", "rh", "%hr", "hr"].includes(normalized)) return "humiditÃ©: %"
  return normalized
}

export function CalibrationWorkflowClient() {
  const t = useTranslations("metrologyAdmin.calibrationPage")
  const { user } = useAppAccess()
  const queryClient = useQueryClient()
  const { data: sensors = [], isLoading: sensorsLoading } = useAdjustmentSensors()
  const [step, setStep] = useState<Step>("selection")
  const [selectedSensorIds, setSelectedSensorIds] = useState<number[]>([])
  const [operator, setOperator] = useState("")
  const [previewReadingEnabled, setPreviewReadingEnabled] = useState(false)
  const defaultOperator = [user?.Prenom, user?.Nom].filter(Boolean).join(" ").trim() || user?.Login || ""
  const operatorValue = operator || defaultOperator

  const sessionQuery = useQuery({
    queryKey: ["metrology-calibration-session"],
    queryFn: () => getJson<SessionPayload>("/api/metrologie/etalonnage/session"),
    refetchInterval: (query) => query.state.data?.session?.status === "running" ? 2_000 : false,
  })
  const session = sessionQuery.data?.session ?? null
  const running = session?.status === "running"
  const visibleStep = running ? "calibration" : step
  const previewReadingQuery = useQuery({
    queryKey: ["metrology-reading-preview", "ETALONNAGE", selectedSensorIds],
    queryFn: ({ signal }) =>
      fetchJson<{
        readings: Record<number, MetrologyPreviewReading>
        readAt: string
      }>("/api/metrologie/lecture-sondes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal,
        body: JSON.stringify({ selectedSensorIds, operation: "ETALONNAGE" }),
      }),
    enabled:
      previewReadingEnabled &&
      selectedSensorIds.length > 0 &&
      !running &&
      step === "calibration",
    refetchInterval: previewReadingEnabled ? 60_000 : false,
    refetchIntervalInBackground: false,
  })
  const displayedReadings = running
    ? session?.latestReadings ?? {}
    : previewReadingQuery.data?.readings ?? {}

  const stopPreviewReading = () => {
    setPreviewReadingEnabled(false)
    return fetchJson<{ stopped: boolean }>("/api/metrologie/lecture-sondes", {
      method: "DELETE",
      credentials: "include",
    }).catch(() => null)
  }

  const startMutation = useMutation({
    mutationFn: () => fetchJson<SessionPayload>("/api/metrologie/etalonnage/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ selectedSensorIds, operator: operatorValue }),
    }),
    onSuccess: (data) => {
      queryClient.setQueryData(["metrology-calibration-session"], data)
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
  const allSensorIds = useMemo(() => sensors.map((sensor) => sensor.id), [sensors])
  const availableUnits = useMemo(
    () => Array.from(new Set(sensors.map((sensor) => normalizeUnit(sensor.unit)).filter((unit): unit is string => unit !== null))),
    [sensors],
  )
  const selectableSensorIds = useMemo(
    () => lockedUnit === null
      ? allSensorIds
      : sensors.filter((sensor) => normalizeUnit(sensor.unit) === lockedUnit).map((sensor) => sensor.id),
    [allSensorIds, lockedUnit, sensors],
  )
  const canSelectAll = lockedUnit !== null || availableUnits.length <= 1
  const allSelected = selectableSensorIds.length > 0 && selectableSensorIds.every((id) => selectedSensorIds.includes(id))
  const someSelected = selectableSensorIds.some((id) => selectedSensorIds.includes(id))

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
    ],
    [t],
  )

  const sensorsColumns = useMemo<ColumnDef<AdjustmentSensorRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        header: () => (
          <div className="flex justify-center">
            <Checkbox
              checked={allSelected ? true : someSelected ? "indeterminate" : false}
              disabled={running || !canSelectAll}
              onCheckedChange={(checked) => {
                setSelectedSensorIds((current) => checked === true
                  ? Array.from(new Set([...current, ...selectableSensorIds]))
                  : current.filter((id) => !selectableSensorIds.includes(id)))
              }}
              aria-label={t("workflow.selection.selectAll")}
            />
          </div>
        ),
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
    [allSelected, canSelectAll, lockedUnit, running, selectableSensorIds, selectedSensorIds, someSelected, t],
  )

  const error = startMutation.error ?? stopMutation.error

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
                    void stopPreviewReading()
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
          <Alert className="border-sky-200 bg-sky-50 text-sky-900">
            <BadgeInfo className="h-4 w-4 text-sky-700" />
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
                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>{t("workflow.common.error")}</AlertTitle>
                    <AlertDescription>{error instanceof Error ? error.message : String(error)}</AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4 lg:grid-cols-3">
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5" />{t("workflow.calibration.general")}</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="calibration-operator">{t("workflow.calibration.operator")}</Label>
                        <Input id="calibration-operator" value={operatorValue} onChange={(event) => setOperator(event.target.value)} disabled={running} />
                      </div>
                      <div className="flex items-center gap-2 text-sm"><Clock3 className="h-4 w-4" />{formatDbDateTime(session?.startedAt || new Date())}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Timer className="h-5 w-5" />{t("workflow.calibration.cadence")}</CardTitle></CardHeader>
                    <CardContent>
                      <div className="text-3xl font-semibold">1 min</div>
                      <p className="mt-2 text-sm text-muted-foreground">{t("workflow.calibration.cadenceDescription")}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>{t("workflow.calibration.session")}</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <Badge variant={running ? "default" : "secondary"}>
                        {running ? t("workflow.status.running") : session?.status === "completed" ? t("workflow.status.completed") : t("workflow.status.ready")}
                      </Badge>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={
                          running ||
                          selectedSensorIds.length === 0
                        }
                        onClick={() => {
                          if (previewReadingEnabled) {
                            void stopPreviewReading()
                            return
                          }
                          setPreviewReadingEnabled(true)
                        }}
                      >
                        {previewReadingEnabled ? (
                          <>
                            <Square className="mr-2 h-4 w-4" />
                            {t("workflow.calibration.stopReading")}
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
                            ? t("workflow.calibration.reading")
                            : t("workflow.calibration.readingActive")}
                        </p>
                      ) : null}
                      {previewReadingQuery.error ? (
                        <p className="text-xs text-destructive">
                          {previewReadingQuery.error instanceof Error
                            ? previewReadingQuery.error.message
                            : t("workflow.calibration.readingError")}
                        </p>
                      ) : null}
                      {running ? (
                        <Button variant="destructive" className="w-full" onClick={() => stopMutation.mutate()} disabled={stopMutation.isPending}>
                          <Square className="mr-2 h-4 w-4" />{t("workflow.calibration.stop")}</Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => {
                            setPreviewReadingEnabled(false)
                            startMutation.mutate()
                          }}
                          disabled={
                            !operatorValue.trim() ||
                            selectedSensorIds.length === 0 ||
                            startMutation.isPending ||
                            previewReadingQuery.isFetching
                          }
                        >
                          <Play className="mr-2 h-4 w-4" />{t("workflow.calibration.start")}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("workflow.readings.title")}</CardTitle>
                    <CardDescription>{t("workflow.readings.description")}</CardDescription>
                  </CardHeader>
                  <CardContent>
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
                          {(running ? session?.sensors ?? [] : selectedSensors).map((sensor) => {
                            const reading = displayedReadings[sensor.id]
                            return (
                              <TableRow key={sensor.id}>
                                <TableCell className="font-medium">{sensor.serialNumber}</TableCell>
                                <TableCell>{sensor.locationName || t("workflow.selection.unassigned")}</TableCell>
                                <TableCell>{sensor.moduleName || "-"}</TableCell>
                                <TableCell>
                                  {reading?.value == null
                                    ? "-"
                                    : `${formatMeasureValue(reading.value, 2)}${reading.unit ? ` ${reading.unit}` : ""}`}
                                </TableCell>
                                <TableCell>{reading ? formatDbDateTime(reading.measuredAt) : "-"}</TableCell>
                                <TableCell>
                                  {running ? session?.readingCounts[sensor.id] ?? 0 : reading ? 1 : 0}
                                </TableCell>
                                <TableCell>
                                  {reading?.error
                                    ? <span className="text-destructive">{reading.error}</span>
                                    : reading?.value != null
                                      ? <span className="text-emerald-700">{t("workflow.status.read")}</span>
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
