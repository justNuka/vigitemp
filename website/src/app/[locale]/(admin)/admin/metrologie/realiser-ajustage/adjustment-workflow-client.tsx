"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react"
import { ArrowRight, BadgeInfo, ChevronLeft, FlaskConical, GaugeCircle, Play, Square, Waves } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { TanStackTable } from "@/components/data-table/tanstack-table"
import { PageHeader } from "@/components/page-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { useAppAccess } from "@/components/access/app-access-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Combobox } from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectEmpty, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAdjustmentSensors } from "@/hooks/useAdjustmentSensors"
import { useIntercomparisonMedia } from "@/hooks/useIntercomparisonMedia"
import { useModules } from "@/hooks/useModules"
import { useStandards } from "@/hooks/useStandards"
import { fetchJson, getJson, isUnauthorizedError } from "@/lib/http"
import { MetrologySubpagesCards } from "../_components/metrology-subpages-cards"

type Step = "selection" | "adjustment"

type SessionApiPayload = {
  session: {
    id: string
    status: "idle" | "running" | "completed" | "cancelled" | "failed"
    operator: string
    displayDecimals: number
    standardId: number
    mediumId: number | null
    plateauDurationMinutes: number
    plateauMaxGap: number
    standardSerial: string
    sensors: Array<{
      id: number
      serialNumber: string
      locationId: number | null
      locationName: string | null
      moduleId: number | null
      moduleName: string | null
      modulePort: string | null
    }>
    latestStandardReading: {
      value: number | null
      rawValue: string | null
      unit: string | null
      error: string | null
      measuredAt: string
    } | null
    latestSensorReadings: Record<
      number,
      {
        value: number | null
        rawValue: string | null
        unit: string | null
        error: string | null
        measuredAt: string
      }
    >
    currentPoint: {
      pointIndex: 1 | 2
      targetValue: number
      startedAt: string
    } | null
    validatedPoints: Partial<
      Record<
        1 | 2,
        {
          pointIndex: 1 | 2
          targetValue: number
          startedAt: string
          completedAt: string
          standardAverage: number | null
          sensorAverages: Record<number, number | null>
        }
      >
    >
    message: string | null
    lastError: string | null
    canStartPointTwo: boolean
    hasValidatedPoint: boolean
    persistedAdjustments: Array<{
      sensorId: number
      serialNumber: string
      adjustmentId: number
      exportFileName: string
      exportUrl: string
    }>
    lastUpdatedAt: string
  } | null
  shouldConfirmStop: boolean
}

function formatDecimalDisplay(value: unknown, maxFractionDigits = 6) {
  if (value === null || value === undefined || value === "") return ""
  const parsed =
    typeof value === "number"
      ? value
      : Number(String(value).replace(",", "."))
  if (!Number.isFinite(parsed)) return String(value)
  return parsed.toFixed(maxFractionDigits).replace(/\.?0+$/, "")
}

function normalizeUnit(value: string | null | undefined) {
  return value?.trim().toLowerCase() || null
}

export function AdjustmentWorkflowClient() {
  const t = useTranslations("metrologyAdmin.adjustmentPage")
  const locale = useLocale()
  const { user } = useAppAccess()
  const queryClient = useQueryClient()
  const { data: sensors = [], isLoading: isSensorsLoading } = useAdjustmentSensors()
  const { data: standards = [], isLoading: isStandardsLoading } = useStandards()
  const { data: media = [], isLoading: isMediaLoading } = useIntercomparisonMedia(true)
  const { data: modules = [] } = useModules(true)

  const [selectedSensorIds, setSelectedSensorIds] = useState<number[]>([])
  const [step, setStep] = useState<Step>("selection")
  const [direction, setDirection] = useState(1)
  const [operator, setOperator] = useState("")
  const [displayDecimals, setDisplayDecimals] = useState("2")
  const [selectedStandardId, setSelectedStandardId] = useState<string>("")
  const [isExternalStandard, setIsExternalStandard] = useState(false)
  const [selectedMediumId, setSelectedMediumId] = useState<string>("")
  const [stabilityPlateauDuration, setStabilityPlateauDuration] = useState("30")
  const [stabilityPlateauMaxGap, setStabilityPlateauMaxGap] = useState("0.2")
  const [pointOne, setPointOne] = useState("")
  const [pointTwo, setPointTwo] = useState("")
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date())
  const [actionError, setActionError] = useState<string | null>(null)
  const [showStopConfirm, setShowStopConfirm] = useState(false)

  const { data: sessionPayload } = useQuery({
    queryKey: ["metrology-adjustment-session"],
    queryFn: () => getJson<SessionApiPayload>("/api/metrologie/ajustage/session"),
    refetchInterval: (query) => {
      if (isUnauthorizedError(query.state.error)) return false
      const payload = query.state.data as SessionApiPayload | undefined
      return payload?.session?.status === "running" ? 2000 : false
    },
  })

  const session = sessionPayload?.session ?? null
  const shouldConfirmStop = sessionPayload?.shouldConfirmStop ?? false
  const isAdjustmentRunning = session?.status === "running"
  const signalReadings = session?.latestSensorReadings ?? {}
  const validatedPoints = {
    pointOne: Boolean(session?.validatedPoints?.[1]),
    pointTwo: Boolean(session?.validatedPoints?.[2]),
  }
  const latestStandardMeasure = session?.latestStandardReading
    ? session.latestStandardReading.value != null
      ? `${session.latestStandardReading.value}${session.latestStandardReading.unit ? ` ${session.latestStandardReading.unit}` : ""}`
      : session.latestStandardReading.error || t("adjustment.cards.standardMeasure.waiting")
    : ""

  const refreshSession = async () => {
    await queryClient.invalidateQueries({ queryKey: ["metrology-adjustment-session"] })
  }

  const startMutation = useMutation({
    mutationFn: async () =>
      fetchJson<{ session: SessionApiPayload["session"] }>("/api/metrologie/ajustage/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedSensorIds,
          operator,
          displayDecimals: Number(displayDecimals || 2),
          standardId: Number(selectedStandardId),
          mediumId: selectedMediumId ? Number(selectedMediumId) : null,
          plateauDurationMinutes: Number(stabilityPlateauDuration || 30),
          plateauMaxGap: Number(stabilityPlateauMaxGap || 0.2),
        }),
      }),
    onSuccess: async () => {
      setActionError(null)
      setDirection(1)
      setStep("adjustment")
      await refreshSession()
    },
    onError: (error) => {
      setActionError(error instanceof Error ? error.message : String(error))
    },
  })

  const stopMutation = useMutation({
    mutationFn: async (cancelResults: boolean) =>
      fetchJson<SessionApiPayload>("/api/metrologie/ajustage/session", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelResults }),
      }),
    onSuccess: async () => {
      setActionError(null)
      setShowStopConfirm(false)
      await refreshSession()
    },
    onError: (error) => {
      setActionError(error instanceof Error ? error.message : String(error))
      setShowStopConfirm(false)
    },
  })

  const validatePointMutation = useMutation({
    mutationFn: async (payload: { pointIndex: 1 | 2; targetValue: number }) =>
      fetchJson<{ session: SessionApiPayload["session"] }>("/api/metrologie/ajustage/session/point", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      setActionError(null)
      await refreshSession()
    },
    onError: (error) => {
      setActionError(error instanceof Error ? error.message : String(error))
    },
  })

  useEffect(() => {
    const interval = window.setInterval(() => setCurrentDateTime(new Date()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (operator.trim().length > 0) return
    const fullName = [user?.Prenom, user?.Nom].filter(Boolean).join(" ").trim()
    setOperator(fullName || user?.Login || "")
  }, [operator, user?.Login, user?.Nom, user?.Prenom])

  const selectedStandard = useMemo(
    () => standards.find((item) => String(item.Id_Etalon) === selectedStandardId) ?? null,
    [selectedStandardId, standards],
  )

  const selectedModule = useMemo(() => {
    if (!selectedStandard?.Id_Module) return null
    return modules.find((item) => item.Id_Module === selectedStandard.Id_Module) ?? null
  }, [modules, selectedStandard?.Id_Module])

  const selectedMedium = useMemo(
    () => media.find((item) => String(item.Id_Milieu) === selectedMediumId) ?? null,
    [media, selectedMediumId],
  )

  useEffect(() => {
    if (!selectedStandard) return
    setIsExternalStandard(Boolean(selectedStandard.Est_Sonde_Externe))
  }, [selectedStandard])

  useEffect(() => {
    if (!session) return
    setSelectedSensorIds(session.sensors.map((sensor) => sensor.id))
    setOperator(session.operator)
    setDisplayDecimals(String(session.displayDecimals))
    setSelectedStandardId(String(session.standardId))
    setSelectedMediumId(session.mediumId != null ? String(session.mediumId) : "")
    setStabilityPlateauDuration(String(session.plateauDurationMinutes))
    setStabilityPlateauMaxGap(String(session.plateauMaxGap))
    if (step === "selection") {
      setDirection(1)
      setStep("adjustment")
    }
  }, [session, step])

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

  useEffect(() => {
    if (!lockedUnit) return
    setSelectedSensorIds((current) =>
      current.filter((sensorId) => {
        const sensor = sensors.find((item) => item.id === sensorId)
        return normalizeUnit(sensor?.unit) === lockedUnit
      }),
    )
  }, [lockedUnit, sensors])
  const allSensorIds = useMemo(() => sensors.map((sensor) => sensor.id), [sensors])
  const selectableSensorIds = useMemo(
    () =>
      lockedUnit === null
        ? allSensorIds
        : sensors
            .filter((sensor) => normalizeUnit(sensor.unit) === lockedUnit)
            .map((sensor) => sensor.id),
    [allSensorIds, lockedUnit, sensors],
  )
  const allSelected =
    selectableSensorIds.length > 0 && selectableSensorIds.every((id) => selectedSensorIds.includes(id))
  const someSelected = selectableSensorIds.some((id) => selectedSensorIds.includes(id))

  const selectedSensorsColumns = useMemo<ColumnDef<(typeof selectedSensors)[number]>[]>(
    () => [
      {
        accessorKey: "serialNumber",
        header: t("adjustment.selectedSensors.columns.sensor"),
      },
      {
        id: "module",
        header: t("adjustment.selectedSensors.columns.module"),
        cell: ({ row }) => {
          const moduleName = row.original.moduleName ?? t("adjustment.selectedSensors.unassignedModule")
          const modulePort = row.original.modulePort ? ` (${row.original.modulePort})` : ""
          return `${moduleName}${modulePort}`
        },
      },
      {
        accessorKey: "currentCalibrationValue",
        header: t("adjustment.selectedSensors.columns.currentCalibrationValue"),
        cell: ({ row }) => {
          const reading = signalReadings[row.original.id]
          if (!reading) return t("adjustment.selectedSensors.pending")
          if (reading.value == null) return reading.error || t("adjustment.selectedSensors.pending")
          return `${reading.value}${reading.unit ? ` ${reading.unit}` : ""}`
        },
      },
      {
        id: "signalRead",
        header: t("adjustment.selectedSensors.columns.signalRead"),
        cell: ({ row }) => {
          const reading = signalReadings[row.original.id]
          return reading?.rawValue ?? reading?.error ?? t("adjustment.selectedSensors.pending")
        },
      },
    ],
    [signalReadings, t],
  )

  const sensorsColumns = useMemo<ColumnDef<(typeof sensors)[number]>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        header: () => (
          <div className="flex justify-center">
            <Checkbox
              checked={allSelected ? true : someSelected ? "indeterminate" : false}
              disabled={isAdjustmentRunning}
              onCheckedChange={(checked) => {
                setSelectedSensorIds(checked === true ? selectableSensorIds : [])
              }}
              aria-label={t("selection.table.selectAll")}
            />
          </div>
        ),
        cell: ({ row }) => {
          const id = row.original.id
          return (
            <div className="flex justify-center">
              <Checkbox
                checked={selectedSensorIds.includes(id)}
                disabled={
                  isAdjustmentRunning ||
                  (lockedUnit !== null && normalizeUnit(row.original.unit) !== lockedUnit)
                }
                onCheckedChange={(checked) => {
                  setSelectedSensorIds((current) =>
                    checked === true ? Array.from(new Set([...current, id])) : current.filter((item) => item !== id),
                  )
                }}
                aria-label={t("selection.table.selectOne", { serial: row.original.serialNumber })}
              />
            </div>
          )
        },
      },
      {
        accessorKey: "serialNumber",
        header: t("selection.table.columns.serial"),
      },
      {
        accessorKey: "locationName",
        header: t("selection.table.columns.location"),
        cell: ({ row }) => row.original.locationName ?? t("selection.table.unassigned"),
      },
      {
        accessorKey: "unit",
        header: t("selection.table.columns.unit"),
        cell: ({ row }) => row.original.unit ?? t("selection.table.unitUnknown"),
      },
    ],
    [allSelected, selectableSensorIds, selectedSensorIds, someSelected, t],
  )

  const standardDisabled = isExternalStandard || isAdjustmentRunning
  const canRunAdjustment =
    !isAdjustmentRunning && selectedSensors.length > 0 && !isExternalStandard && !!selectedStandardId && !startMutation.isPending

  const formattedDateTime = new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(currentDateTime)

  const sliderVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 72 : -72 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -72 : 72 }),
  }

  return (
    <>
      <PageHeader title={t("header.title")} description={t("header.description")} />
      <div className="space-y-6 p-6">
        {actionError ? (
          <Alert variant="destructive">
            <AlertTitle>{t("adjustment.status.errorTitle")}</AlertTitle>
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        ) : null}

        {session?.message ? (
          <Alert className={session.lastError ? "border-amber-300 bg-amber-50 text-amber-900" : undefined}>
            <AlertTitle>{session.lastError ? t("adjustment.status.warningTitle") : t("adjustment.status.infoTitle")}</AlertTitle>
            <AlertDescription>{session.message}</AlertDescription>
          </Alert>
        ) : null}

        {session?.persistedAdjustments?.length ? (
          <Alert className="border-emerald-300 bg-emerald-50 text-emerald-900">
            <AlertTitle>{t("adjustment.status.exportReadyTitle")}</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>{t("adjustment.status.exportReadyDescription")}</p>
              <div className="flex flex-wrap gap-2">
                {session.persistedAdjustments.map((item) => (
                  <Button key={item.adjustmentId} type="button" variant="outline" asChild>
                    <a href={item.exportUrl}>{t("adjustment.status.exportReadyCta", { serial: item.serialNumber })}</a>
                  </Button>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

        {selectedSensorIds.length > 0 ? (
          <Alert className="border-primary/30 bg-primary/5">
            <ArrowRight className="h-4 w-4 text-primary" />
            <AlertTitle>{t("selection.banner.title", { count: selectedSensorIds.length })}</AlertTitle>
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{t("selection.banner.description")}</span>
              {step === "selection" ? (
                <Button
                  type="button"
                  onClick={() => {
                    setDirection(1)
                    setStep("adjustment")
                  }}
                >
                  {t("selection.banner.cta")}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDirection(-1)
                    setStep("selection")
                  }}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {t("adjustment.backToSelection")}
                </Button>
              )}
            </AlertDescription>
          </Alert>
        ) : null}

        {lockedUnit ? (
          <Alert className="border-sky-200 bg-sky-50 text-sky-900">
            <BadgeInfo className="h-4 w-4 text-sky-700" />
            <AlertTitle>{t("selection.unitLock.title", { unit: lockedUnit })}</AlertTitle>
            <AlertDescription>{t("selection.unitLock.description")}</AlertDescription>
          </Alert>
        ) : null}

        <div className="overflow-hidden">
          <LazyMotion features={domAnimation}>
            <AnimatePresence custom={direction} mode="wait">
              {step === "selection" ? (
                <m.div
                  key="selection"
                  custom={direction}
                  variants={sliderVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("selection.title")}</CardTitle>
                      <CardDescription>{t("selection.description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TanStackTable
                        columns={sensorsColumns}
                        data={sensors}
                        searchField={["serialNumber", "locationName"]}
                        searchPlaceholder={t("selection.table.searchPlaceholder")}
                        isLoading={isSensorsLoading}
                        emptyMessage={t("selection.table.empty")}
                        maxHeight="60vh"
                        headerClassName="!bg-sidebar !text-sidebar-foreground"
                        headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
                        tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
                        exportFileName={t("selection.table.exportFileName")}
                      />
                    </CardContent>
                  </Card>
                </m.div>
              ) : (
                <m.div
                  key="adjustment"
                  custom={direction}
                  variants={sliderVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-6"
                >
                  <div className="grid gap-4 xl:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-3 text-primary">
                            <GaugeCircle className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle>{t("adjustment.cards.general.title")}</CardTitle>
                            <CardDescription>{t("adjustment.cards.general.description")}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="adjustment-current-datetime">{t("adjustment.cards.general.currentDateTime")}</Label>
                          <Input id="adjustment-current-datetime" value={formattedDateTime} readOnly />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="adjustment-operator">{t("adjustment.cards.general.operator")}</Label>
                          <Input
                            id="adjustment-operator"
                            value={operator}
                            onChange={(event) => setOperator(event.target.value)}
                            placeholder={t("adjustment.cards.general.operatorPlaceholder")}
                            disabled={isAdjustmentRunning}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="adjustment-display-decimals">{t("adjustment.cards.general.displayDecimals")}</Label>
                          <Input
                            id="adjustment-display-decimals"
                            type="number"
                            min={0}
                            max={6}
                            value={displayDecimals}
                            onChange={(event) => setDisplayDecimals(event.target.value)}
                            disabled={isAdjustmentRunning}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-3 text-primary">
                            <FlaskConical className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle>{t("adjustment.cards.standard.title")}</CardTitle>
                            <CardDescription>{t("adjustment.cards.standard.description")}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Alert className="border-amber-300 bg-amber-50 text-amber-900">
                          <BadgeInfo className="h-4 w-4 text-amber-700" />
                          <AlertTitle>{t("adjustment.cards.standard.coefficientsAlertTitle")}</AlertTitle>
                          <AlertDescription>{t("adjustment.cards.standard.coefficientsAlertDescription")}</AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id="adjustment-external-standard"
                              checked={isExternalStandard}
                              onCheckedChange={(checked) => setIsExternalStandard(checked === true)}
                              disabled={isAdjustmentRunning}
                            />
                            <Label htmlFor="adjustment-external-standard">
                              {t("adjustment.cards.standard.externalProbe")}
                            </Label>
                          </div>
                          {isExternalStandard ? (
                            <p className="text-sm text-amber-700">
                              {t("adjustment.cards.standard.externalProbeHint")}
                            </p>
                          ) : null}
                        </div>

                        <div className="space-y-2">
                          <Label>{t("adjustment.cards.standard.standardProbe")}</Label>
                          <Combobox
                            triggerId="adjustment-standard-probe"
                            value={selectedStandardId}
                            onValueChange={setSelectedStandardId}
                            disabled={standardDisabled || isStandardsLoading}
                            placeholder={t("adjustment.cards.standard.standardProbePlaceholder")}
                            searchPlaceholder={t("adjustment.cards.standard.standardProbeSearchPlaceholder")}
                            emptyMessage={t("adjustment.cards.standard.standardProbeEmpty")}
                            options={standards.map((item) => ({
                              value: String(item.Id_Etalon),
                              label: item.Etalon_Numero_Serie ?? `#${item.Id_Etalon}`,
                              searchText: [
                                item.Etalon_Numero_Serie,
                                item.Organisme,
                                item.Num_Certif,
                                item.Unite,
                              ]
                                .filter(Boolean)
                                .join(" "),
                            }))}
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>{t("adjustment.cards.standard.organization")}</Label>
                            <Input value={selectedStandard?.Organisme ?? ""} readOnly disabled={standardDisabled} />
                          </div>
                          <div className="space-y-2">
                            <Label>{t("adjustment.cards.standard.certificateDate")}</Label>
                            <Input value={selectedStandard?.Date_Certif ?? ""} readOnly disabled={standardDisabled} />
                          </div>
                          <div className="space-y-2">
                            <Label>{t("adjustment.cards.standard.certificateNumber")}</Label>
                            <Input value={selectedStandard?.Num_Certif ?? ""} readOnly disabled={standardDisabled} />
                          </div>
                          <div className="space-y-2">
                            <Label>{t("adjustment.cards.standard.unit")}</Label>
                            <Input value={selectedStandard?.Unite ?? ""} readOnly disabled={standardDisabled} />
                          </div>
                          <div className="space-y-2">
                            <Label>{t("adjustment.cards.standard.resolution")}</Label>
                            <Input
                              value={formatDecimalDisplay(selectedStandard?.Resolution)}
                              readOnly
                              disabled={standardDisabled}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t("adjustment.cards.standard.standardDecimals")}</Label>
                            <Input
                              value={selectedStandard?.Nb_Decimale != null ? String(selectedStandard.Nb_Decimale) : ""}
                              readOnly
                              disabled={standardDisabled}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-3 text-primary">
                            <Waves className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle>{t("adjustment.cards.module.title")}</CardTitle>
                            <CardDescription>{t("adjustment.cards.module.description")}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>{t("adjustment.cards.module.module")}</Label>
                          <Input
                            value={selectedModule?.Module_Numero_Serie ?? ""}
                            readOnly
                            disabled={standardDisabled || !selectedStandard}
                            placeholder={t("adjustment.cards.module.empty")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("adjustment.cards.module.serialPort")}</Label>
                          <Input
                            value={selectedModule?.Port_Serie ?? selectedStandard?.Port_Serie ?? ""}
                            readOnly
                            disabled={standardDisabled || !selectedStandard}
                            placeholder={t("adjustment.cards.module.empty")}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>{t("adjustment.cards.medium.title")}</CardTitle>
                      <CardDescription>{t("adjustment.cards.medium.description")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 md:max-w-md">
                        <Label>{t("adjustment.cards.medium.select")}</Label>
                        <Select
                          value={selectedMediumId}
                          onValueChange={setSelectedMediumId}
                          disabled={isExternalStandard || isMediaLoading || isAdjustmentRunning}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("adjustment.cards.medium.selectPlaceholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            {media.length === 0 ? (
                              <SelectEmpty>{t("adjustment.cards.medium.empty")}</SelectEmpty>
                            ) : (
                              media.map((item) => (
                                <SelectItem key={item.Id_Milieu} value={String(item.Id_Milieu)}>
                                  {`${item.Model ?? "-"} / ${item.Reference ?? "-"}`}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                          <Label>{t("adjustment.cards.medium.model")}</Label>
                          <Input value={selectedMedium?.Model ?? ""} readOnly disabled={isExternalStandard} />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("adjustment.cards.medium.reference")}</Label>
                          <Input value={selectedMedium?.Reference ?? ""} readOnly disabled={isExternalStandard} />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("adjustment.cards.medium.stability")}</Label>
                          <Input
                            value={formatDecimalDisplay(selectedMedium?.Stabilite)}
                            readOnly
                            disabled={isExternalStandard}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("adjustment.cards.medium.homogeneity")}</Label>
                          <Input
                            value={formatDecimalDisplay(selectedMedium?.Homogeneite)}
                            readOnly
                            disabled={isExternalStandard}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-4 xl:grid-cols-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("adjustment.cards.run.title")}</CardTitle>
                        <CardDescription>{t("adjustment.cards.run.description")}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button
                          type="button"
                          className="w-full"
                          variant={isAdjustmentRunning ? "destructive" : "default"}
                          disabled={isAdjustmentRunning ? stopMutation.isPending : !canRunAdjustment}
                          onClick={() => {
                            if (isAdjustmentRunning) {
                              if (shouldConfirmStop) {
                                setShowStopConfirm(true)
                                return
                              }
                              stopMutation.mutate(false)
                              return
                            }
                            startMutation.mutate()
                          }}
                        >
                          {isAdjustmentRunning ? (
                            <>
                              <Square className="mr-2 h-4 w-4" />
                              {t("adjustment.cards.run.stop")}
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              {t("adjustment.cards.run.start")}
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>{t("adjustment.cards.points.title")}</CardTitle>
                        <CardDescription>{t("adjustment.cards.points.description")}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-end gap-2">
                          <div className="flex-1 space-y-2">
                            <Label htmlFor="adjustment-point-one">{t("adjustment.cards.points.pointOne")}</Label>
                            <Input
                              id="adjustment-point-one"
                              value={pointOne}
                              onChange={(event) => {
                                setPointOne(event.target.value)
                              }}
                              disabled={!isAdjustmentRunning || isExternalStandard || Boolean(session?.validatedPoints?.[1])}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={
                              !isAdjustmentRunning ||
                              isExternalStandard ||
                              pointOne.trim().length === 0 ||
                              Boolean(session?.validatedPoints?.[1]) ||
                              Boolean(session?.currentPoint) ||
                              validatePointMutation.isPending
                            }
                            onClick={() => {
                              const value = Number(pointOne.replace(",", "."))
                              if (!Number.isFinite(value)) {
                                setActionError(t("adjustment.cards.points.invalidValue"))
                                return
                              }
                              validatePointMutation.mutate({ pointIndex: 1, targetValue: value })
                            }}
                          >
                            {t("adjustment.cards.points.validate")}
                          </Button>
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1 space-y-2">
                            <Label htmlFor="adjustment-point-two">{t("adjustment.cards.points.pointTwo")}</Label>
                            <Input
                              id="adjustment-point-two"
                              value={pointTwo}
                              onChange={(event) => {
                                setPointTwo(event.target.value)
                              }}
                              disabled={!isAdjustmentRunning || isExternalStandard || !validatedPoints.pointOne || Boolean(session?.validatedPoints?.[2])}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={
                              !isAdjustmentRunning ||
                              isExternalStandard ||
                              pointTwo.trim().length === 0 ||
                              !validatedPoints.pointOne ||
                              Boolean(session?.validatedPoints?.[2]) ||
                              Boolean(session?.currentPoint) ||
                              validatePointMutation.isPending
                            }
                            onClick={() => {
                              const value = Number(pointTwo.replace(",", "."))
                              if (!Number.isFinite(value)) {
                                setActionError(t("adjustment.cards.points.invalidValue"))
                                return
                              }
                              validatePointMutation.mutate({ pointIndex: 2, targetValue: value })
                            }}
                          >
                            {t("adjustment.cards.points.validate")}
                          </Button>
                        </div>
                        {session?.currentPoint ? (
                          <p className="text-sm text-muted-foreground">
                            {t("adjustment.cards.points.collecting", { point: session.currentPoint.pointIndex })}
                          </p>
                        ) : null}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>{t("adjustment.cards.standardMeasure.title")}</CardTitle>
                        <CardDescription>{t("adjustment.cards.standardMeasure.description")}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {t("adjustment.cards.standardMeasure.lastMeasure")}
                          </p>
                          <p className="mt-2 text-2xl font-semibold">
                            {latestStandardMeasure || t("adjustment.cards.standardMeasure.empty")}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>{t("adjustment.cards.plateau.title")}</CardTitle>
                        <CardDescription>{t("adjustment.cards.plateau.description")}</CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="adjustment-plateau-duration">
                            {t("adjustment.cards.plateau.durationMinutes")}
                          </Label>
                          <Input
                            id="adjustment-plateau-duration"
                            type="number"
                            min={1}
                            step="1"
                            value={stabilityPlateauDuration}
                            onChange={(event) => setStabilityPlateauDuration(event.target.value)}
                            disabled={isExternalStandard || isAdjustmentRunning}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="adjustment-plateau-max-gap">
                            {t("adjustment.cards.plateau.maxGap")}
                          </Label>
                          <Input
                            id="adjustment-plateau-max-gap"
                            type="number"
                            min={0}
                            step="0.01"
                            value={stabilityPlateauMaxGap}
                            onChange={(event) => setStabilityPlateauMaxGap(event.target.value)}
                            disabled={isExternalStandard || isAdjustmentRunning}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>{t("adjustment.selectedSensors.title")}</CardTitle>
                      <CardDescription>{t("adjustment.selectedSensors.description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TanStackTable
                        columns={selectedSensorsColumns}
                        data={selectedSensors}
                        isLoading={isSensorsLoading}
                        emptyMessage={t("adjustment.selectedSensors.empty")}
                        maxHeight="40vh"
                        headerClassName="!bg-sidebar !text-sidebar-foreground"
                        headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
                        tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
                        exportFileName={t("adjustment.selectedSensors.exportFileName")}
                      />
                    </CardContent>
                  </Card>
                </m.div>
              )}
            </AnimatePresence>
          </LazyMotion>
        </div>

        <MetrologySubpagesCards current="adjustment" />

        <AlertDialog open={showStopConfirm} onOpenChange={setShowStopConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("adjustment.stopConfirm.title")}</AlertDialogTitle>
              <AlertDialogDescription>{t("adjustment.stopConfirm.description")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("adjustment.stopConfirm.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={(event) => {
                  event.preventDefault()
                  stopMutation.mutate(true)
                }}
              >
                {t("adjustment.stopConfirm.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  )
}
