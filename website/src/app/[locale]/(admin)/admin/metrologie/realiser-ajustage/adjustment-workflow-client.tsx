"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react"
import { ArrowRight, BadgeInfo, CheckCircle2, ChevronLeft, CircleX, FileArchive, FlaskConical, GaugeCircle, Play, Square, TimerReset, Waves } from "lucide-react"
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
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectEmpty, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAdjustmentSensors, type AdjustmentSensorRow } from "@/hooks/useAdjustmentSensors"
import { useIntercomparisonMedia } from "@/hooks/useIntercomparisonMedia"
import { useModules } from "@/hooks/useModules"
import { useStandards } from "@/hooks/useStandards"
import { fetchJson, getJson, HttpError, isUnauthorizedError } from "@/lib/http"
import { formatDbDateTime } from "@/lib/date-display"
import { formatMeasureValue } from "@/lib/measurements"
import { MetrologySubpagesCards } from "../_components/metrology-subpages-cards"

type Step = "selection" | "adjustment"
type CoefficientKey = "a" | "b" | "c"

const COEFFICIENT_DISPLAY_DECIMALS = 3

function readGspFrameField(rawValue: string | null, field: string) {
  if (!rawValue) return null
  const match = new RegExp(`(?:^|\\r?\\n)\\s*${field}\\s*=\\s*([^\\r\\n]+)`, "i").exec(rawValue)
  return match?.[1]?.trim() || null
}

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
    measurementIntervalSeconds: number
    standardSerial: string
    standardIsExternal: boolean
    coefficientsLocked: boolean
    coefficientApplication: {
      status: "not-applicable" | "pending" | "applied" | "declined"
      gspSensorCount: number
      gsoSensorCount: number
      previousConfigurationRestored: boolean
    }
    sensors: Array<{
      id: number
      serialNumber: string
      locationId: number | null
      locationName: string | null
      moduleId: number | null
      moduleName: string | null
      modulePort: string | null
      isGso: boolean
      coeffA: number
      coeffB: number
      coeffC: number
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
      startedAt: string | null
    } | null
    plateauStatus: {
      status: "idle" | "running" | "waiting" | "failed" | "ready" | "validated"
      pointIndex: 1 | 2 | null
      startedAt: string | null
      endedAt: string | null
      standardSampleCount: number
      lastGap: number | null
      maxGap: number
      resetCount: number
      lastResetAt: string | null
    }
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

function formatCoefficientDisplay(value: unknown) {
  if (value === null || value === undefined || value === "") return ""
  const parsed = typeof value === "number" ? value : Number(String(value).replace(",", "."))
  if (!Number.isFinite(parsed)) return String(value)
  return parsed.toFixed(COEFFICIENT_DISPLAY_DECIMALS)
}

function normalizeUnit(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase().replace(/\s+/g, "") || null
  if (!normalized) return null
  if (["c", "°c", "degc", "celsius"].includes(normalized)) return "température: °C"
  if (["%", "%rh", "rh", "%hr", "hr"].includes(normalized)) return "humidité: %"
  return normalized
}

function getDownloadFileName(contentDisposition: string | null, fallback: string) {
  const match = contentDisposition?.match(/filename="?([^";]+)"?/i)
  return match?.[1]?.trim() || fallback
}

export function AdjustmentWorkflowClient() {
  const t = useTranslations("metrologyAdmin.adjustmentPage")
  const tCommon = useTranslations("common")
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
  const [measurementIntervalSeconds, setMeasurementIntervalSeconds] = useState("15")
  const [pointOne, setPointOne] = useState("")
  const [pointTwo, setPointTwo] = useState("")
  const [standardModeNotice, setStandardModeNotice] = useState<string | null>(null)
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date())
  const [actionError, setActionError] = useState<string | null>(null)
  const [showStopConfirm, setShowStopConfirm] = useState(false)
  const [showFirstPointConfirm, setShowFirstPointConfirm] = useState(false)
  const [showCalculationDetails, setShowCalculationDetails] = useState(false)
  const [isExportingAdjustmentZip, setIsExportingAdjustmentZip] = useState(false)
  const [coefficientDrafts, setCoefficientDrafts] = useState<
    Record<number, { a: string; b: string; c: string }>
  >({})
  const [coefficientTouched, setCoefficientTouched] = useState<
    Record<number, Partial<Record<CoefficientKey, boolean>>>
  >({})
  const coefficientSessionIdRef = useRef<string | null>(null)

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
  const localeTag = locale === "fr" ? "fr-FR" : "en-US"
  const signalReadings = useMemo(
    () => (isAdjustmentRunning ? session?.latestSensorReadings ?? {} : {}),
    [isAdjustmentRunning, session?.latestSensorReadings],
  )
  const validatedPoints = {
    pointOne: Boolean(session?.validatedPoints?.[1]),
    pointTwo: Boolean(session?.validatedPoints?.[2]),
  }
  const isExternalSession = Boolean(session?.standardIsExternal)
  const usesExternalStandard = isAdjustmentRunning
    ? isExternalSession
    : isExternalStandard
  const allSensorReadingsAvailable = Boolean(
    session?.sensors.length &&
      session.sensors.every((sensor) => Number.isFinite(session.latestSensorReadings[sensor.id]?.value)),
  )
  const pointOneManualValue = Number(pointOne.trim().replace(",", "."))
  const pointTwoManualValue = Number(pointTwo.trim().replace(",", "."))
  const coefficientsLocked = Boolean(session?.coefficientsLocked)
  const hasUnsavedCoefficientChanges = Object.values(coefficientTouched).some((fields) =>
    Object.values(fields).some(Boolean),
  )
  const activeAcquisitionPoint = session?.currentPoint?.pointIndex ?? null
  const hasReadableStandard = isExternalSession
    ? true
    : Number.isFinite(session?.latestStandardReading?.value)
  const canStartPointOneAcquisition = Boolean(
    isAdjustmentRunning &&
      !validatedPoints.pointOne &&
      activeAcquisitionPoint == null &&
      allSensorReadingsAvailable &&
      hasReadableStandard &&
      (!isExternalSession || (pointOne.trim().length > 0 && Number.isFinite(pointOneManualValue))),
  )
  const canStartPointTwoAcquisition = Boolean(
    isAdjustmentRunning &&
      validatedPoints.pointOne &&
      !validatedPoints.pointTwo &&
      activeAcquisitionPoint == null &&
      allSensorReadingsAvailable &&
      hasReadableStandard &&
      (!isExternalSession || (pointTwo.trim().length > 0 && Number.isFinite(pointTwoManualValue))),
  )
  const latestStandardMeasure = session?.latestStandardReading
    ? session.latestStandardReading.value != null
      ? `${session.latestStandardReading.value}${session.latestStandardReading.unit ? ` ${session.latestStandardReading.unit}` : ""}`
      : session.latestStandardReading.error || t("adjustment.cards.standardMeasure.waiting")
    : ""
  const plateauDurationMs = Math.max(1, session?.plateauDurationMinutes ?? 1) * 60_000
  const plateauStartedAt = session?.plateauStatus.startedAt
    ? new Date(session.plateauStatus.startedAt).getTime()
    : null
  const plateauElapsedMs =
    plateauStartedAt == null ? 0 : Math.max(0, currentDateTime.getTime() - plateauStartedAt)
  const plateauRemainingSeconds = Math.max(
    0,
    Math.ceil((plateauDurationMs - plateauElapsedMs) / 1000),
  )
  const plateauProgress = Math.min(100, (plateauElapsedMs / plateauDurationMs) * 100)
  const plateauTimerLabel = `${String(Math.floor(plateauRemainingSeconds / 60)).padStart(2, "0")}:${String(
    plateauRemainingSeconds % 60,
  ).padStart(2, "0")}`

  const refreshSession = async () => {
    await queryClient.invalidateQueries({ queryKey: ["metrology-adjustment-session"] })
  }

  const getActionErrorMessage = (error: unknown) => {
    if (error instanceof HttpError && error.payload?.error === "gsp_sensor_unreachable") {
      return t("adjustment.errors.sensorUnreachable")
    }
    return error instanceof Error ? error.message : String(error)
  }

  const exportAdjustmentZip = async () => {
    if (!session || isExportingAdjustmentZip) return
    const ids = session.persistedAdjustments.map((item) => item.adjustmentId)
    if (ids.length === 0) return

    setIsExportingAdjustmentZip(true)
    setActionError(null)
    try {
      const response = await fetch("/api/metrologie/ajustage/export/bulk", {
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
      anchor.download = getDownloadFileName(response.headers.get("Content-Disposition"), "Ajustages.zip")
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      setActionError(getActionErrorMessage(error))
    } finally {
      setIsExportingAdjustmentZip(false)
    }
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
          measurementIntervalSeconds: sensors.some(
            (sensor) => selectedSensorIds.includes(sensor.id) && sensor.isGso,
          )
            ? 60
            : measurementIntervalSeconds === "30"
              ? 30
              : 15,
        }),
      }),
    onSuccess: async () => {
      setActionError(null)
      setPointOne("")
      setPointTwo("")
      setShowCalculationDetails(false)
      setDirection(1)
      setStep("adjustment")
      await refreshSession()
    },
    onError: (error) => {
      setActionError(getActionErrorMessage(error))
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

  const updateCoefficientsMutation = useMutation({
    mutationFn: async (
      coefficients: Array<{ sensorId: number; coeffA: number; coeffB: number; coeffC: number }>,
    ) =>
      fetchJson<{ session: SessionApiPayload["session"] }>("/api/metrologie/ajustage/session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-coefficients",
          coefficients,
        }),
      }),
    onSuccess: async () => {
      setActionError(null)
      setCoefficientTouched({})
      await refreshSession()
    },
    onError: (error) => {
      setActionError(error instanceof Error ? error.message : String(error))
    },
  })

  const resolveCalculatedCoefficientsMutation = useMutation({
    mutationFn: async (apply: boolean) =>
      fetchJson<{ session: SessionApiPayload["session"] }>("/api/metrologie/ajustage/session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resolve-calculated-coefficients",
          apply,
        }),
      }),
    onSuccess: async () => {
      setActionError(null)
      await refreshSession()
    },
    onError: (error) => {
      setActionError(getActionErrorMessage(error))
    },
  })

  const startPointAcquisitionMutation = useMutation({
    mutationFn: async (payload: { pointIndex: 1 | 2; targetValue?: number }) =>
      fetchJson<{ session: SessionApiPayload["session"] }>("/api/metrologie/ajustage/session/point", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      setActionError(null)
      setShowFirstPointConfirm(false)
      await refreshSession()
    },
    onError: (error) => {
      setActionError(error instanceof Error ? error.message : String(error))
      setShowFirstPointConfirm(false)
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
    if (!session || session.status !== "running") {
      coefficientSessionIdRef.current = null
      setCoefficientDrafts({})
      setCoefficientTouched({})
      return
    }

    const startsNewSession = coefficientSessionIdRef.current !== session.id
    coefficientSessionIdRef.current = session.id
    if (startsNewSession) setCoefficientTouched({})
    setCoefficientDrafts((current) =>
      Object.fromEntries(
        session.sensors.map((sensor) => [
          sensor.id,
          startsNewSession || !current[sensor.id]
            ? {
                a: formatCoefficientDisplay(sensor.coeffA),
                b: formatCoefficientDisplay(sensor.coeffB),
                c: formatCoefficientDisplay(sensor.coeffC),
              }
            : current[sensor.id],
        ]),
      ),
    )
    setSelectedSensorIds(session.sensors.map((sensor) => sensor.id))
    setOperator(session.operator)
    setDisplayDecimals(String(session.displayDecimals))
    setSelectedStandardId(String(session.standardId))
    setIsExternalStandard(session.standardIsExternal)
    setSelectedMediumId(session.mediumId != null ? String(session.mediumId) : "")
    setStabilityPlateauDuration(String(session.plateauDurationMinutes))
    setStabilityPlateauMaxGap(String(session.plateauMaxGap))
    setMeasurementIntervalSeconds(String(session.measurementIntervalSeconds))
    if (step === "selection") {
      setDirection(1)
      setStep("adjustment")
    }
  }, [session, step])

  const selectedSensors = useMemo(
    () => sensors.filter((sensor) => selectedSensorIds.includes(sensor.id)),
    [selectedSensorIds, sensors],
  )
  const coefficientSensors = useMemo(
    () => isAdjustmentRunning && session ? session.sensors : selectedSensors,
    [isAdjustmentRunning, selectedSensors, session],
  )
  const hasSelectedGso = useMemo(
    () => selectedSensors.some((sensor) => sensor.isGso),
    [selectedSensors],
  )
  const lockedUnit = useMemo(() => {
    const knownSelectedUnits = selectedSensors
      .map((sensor) => normalizeUnit(sensor.unit))
      .filter((value): value is string => Boolean(value))

    return knownSelectedUnits[0] ?? null
  }, [selectedSensors])

  const allSensorIds = useMemo(() => sensors.map((sensor) => sensor.id), [sensors])
  const availableUnits = useMemo(
    () =>
      Array.from(
        new Set(
          sensors
            .map((sensor) => normalizeUnit(sensor.unit))
            .filter((unit): unit is string => unit !== null),
        ),
      ),
    [sensors],
  )
  const selectableSensorIds = useMemo(
    () =>
      lockedUnit === null
        ? allSensorIds
        : sensors
            .filter((sensor) => normalizeUnit(sensor.unit) === lockedUnit)
            .map((sensor) => sensor.id),
    [allSensorIds, lockedUnit, sensors],
  )
  const canSelectAll = lockedUnit !== null || availableUnits.length <= 1
  const allSelected =
    selectableSensorIds.length > 0 && selectableSensorIds.every((id) => selectedSensorIds.includes(id))
  const someSelected = selectableSensorIds.some((id) => selectedSensorIds.includes(id))

  const adjustmentSensors = useMemo<AdjustmentSensorRow[]>(() => {
    if (!isAdjustmentRunning || !session) return selectedSensors

    const sensorsById = new Map(sensors.map((sensor) => [sensor.id, sensor]))
    return session.sensors.map((sessionSensor) => {
      const sensor = sensorsById.get(sessionSensor.id)
      return (
        sensor ?? {
          ...sessionSensor,
          unit: null,
          currentCalibrationValue: 0,
        }
      )
    })
  }, [isAdjustmentRunning, selectedSensors, sensors, session])

  const selectedSensorsColumns = useMemo<ColumnDef<AdjustmentSensorRow>[]>(
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
          return `${formatMeasureValue(
            reading.value,
            session?.displayDecimals ?? null,
            localeTag,
          )}${reading.unit ? ` ${reading.unit}` : ""}`
        },
      },
      {
        id: "signalRead",
        header: t("adjustment.selectedSensors.columns.signalRead"),
        cell: ({ row }) => {
          const reading = signalReadings[row.original.id]
          if (!reading) return t("adjustment.selectedSensors.pending")
          if (reading.value == null) return reading.error || t("adjustment.selectedSensors.pending")

          const sensorDateTime = formatDbDateTime(
            readGspFrameField(reading.rawValue, "DateHeure") ?? reading.measuredAt,
            {
              format: "dateTimeSeconds",
              locale: localeTag,
              timeZone: "Europe/Paris",
            },
          )
          const measurement = formatMeasureValue(
            reading.value,
            session?.displayDecimals ?? null,
            localeTag,
          )

          return (
            <div className="grid gap-0.5">
              <span>{sensorDateTime}</span>
              <span className="font-medium">
                {measurement}
                {reading.unit ? ` ${reading.unit}` : ""}
              </span>
            </div>
          )
        },
      },
    ],
    [localeTag, session?.displayDecimals, signalReadings, t],
  )

  const selectionSummaryColumns = useMemo<ColumnDef<AdjustmentSensorRow>[]>(
    () => [
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
    [t],
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
              disabled={isAdjustmentRunning || !canSelectAll}
              onCheckedChange={(checked) => {
                setSelectedSensorIds((current) =>
                  checked === true
                    ? Array.from(new Set([...current, ...selectableSensorIds]))
                    : current.filter((id) => !selectableSensorIds.includes(id)),
                )
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
    [
      allSelected,
      canSelectAll,
      isAdjustmentRunning,
      lockedUnit,
      selectableSensorIds,
      selectedSensorIds,
      someSelected,
      t,
    ],
  )

  const standardDisabled = isAdjustmentRunning
  const measurementIntervalValue =
    hasSelectedGso ? 60 : measurementIntervalSeconds === "30" ? 30 : 15
  const plateauDurationValue = Number(stabilityPlateauDuration)
  const isMeasurementIntervalValid =
    hasSelectedGso
      ? measurementIntervalValue === 60
      : measurementIntervalValue === 15 || measurementIntervalValue === 30
  const expectedPlateauCycles =
    isMeasurementIntervalValid && Number.isFinite(plateauDurationValue) && plateauDurationValue > 0
      ? Math.ceil((plateauDurationValue * 60) / measurementIntervalValue)
      : null
  const hasPlateauIntervalMismatch =
    expectedPlateauCycles != null && (expectedPlateauCycles > 120 || expectedPlateauCycles < 2)
  const canRunAdjustment =
    !isAdjustmentRunning &&
    selectedSensors.length > 0 &&
    !!selectedStandardId &&
    isMeasurementIntervalValid &&
    !startMutation.isPending

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
                <Button
                  type="button"
                  variant="outline"
                  disabled={isExportingAdjustmentZip}
                  onClick={() => void exportAdjustmentZip()}
                >
                  <FileArchive className="mr-2 h-4 w-4" />
                  {isExportingAdjustmentZip ? tCommon("loading") : t("adjustment.status.exportZipCta")}
                </Button>
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

                  {selectedSensors.length > 0 ? (
                    <Card className="border-primary/20 bg-primary/2">
                      <CardHeader>
                        <CardTitle>{t("adjustment.selectionSummary.title")}</CardTitle>
                        <CardDescription>
                          {t("adjustment.selectionSummary.description")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <TanStackTable
                          columns={selectionSummaryColumns}
                          data={selectedSensors}
                          emptyMessage={t("adjustment.selectedSensors.empty")}
                          maxHeight="32vh"
                          headerClassName="!bg-sidebar !text-sidebar-foreground"
                          headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
                          tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
                          exportFileName={t("selection.table.exportFileName")}
                        />
                      </CardContent>
                    </Card>
                  ) : null}
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
                              onCheckedChange={(checked) => {
                                const external = checked === true
                                setIsExternalStandard(external)
                                const replacement = standards.find(
                                  (item) => Boolean(item.Est_Sonde_Externe) === external,
                                )
                                if (
                                  selectedStandard &&
                                  Boolean(selectedStandard.Est_Sonde_Externe) !== external
                                ) {
                                  setSelectedStandardId(
                                    replacement ? String(replacement.Id_Etalon) : "",
                                  )
                                }
                                setStandardModeNotice(
                                  external
                                    ? t("adjustment.cards.standard.externalModeEnabled")
                                    : t("adjustment.cards.standard.internalModeEnabled"),
                                )
                              }}
                              disabled={isAdjustmentRunning}
                            />
                            <Label htmlFor="adjustment-external-standard">
                              {t("adjustment.cards.standard.externalProbe")}
                            </Label>
                          </div>
                          {isExternalStandard ? (
                            <p className="text-sm text-amber-700">
                              {t("adjustment.cards.standard.externalProbeEnabledHint")}
                            </p>
                          ) : null}
                          {standardModeNotice ? (
                            <Alert className="border-sky-200 bg-sky-50 text-sky-900">
                              <BadgeInfo className="h-4 w-4" />
                              <AlertDescription>{standardModeNotice}</AlertDescription>
                            </Alert>
                          ) : null}
                        </div>

                        <div className="space-y-2">
                          <Label>{t("adjustment.cards.standard.standardProbe")}</Label>
                          <Combobox
                            triggerId="adjustment-standard-probe"
                            value={selectedStandardId}
                            onValueChange={(value) => {
                              const nextStandard =
                                standards.find((item) => String(item.Id_Etalon) === value) ?? null
                              const external = Boolean(nextStandard?.Est_Sonde_Externe)
                              setSelectedStandardId(value)
                              setIsExternalStandard(external)
                              setStandardModeNotice(
                                external
                                  ? t("adjustment.cards.standard.externalAutoSelected")
                                  : t("adjustment.cards.standard.internalAutoSelected"),
                              )
                            }}
                            disabled={standardDisabled || isStandardsLoading}
                            placeholder={t("adjustment.cards.standard.standardProbePlaceholder")}
                            searchPlaceholder={t("adjustment.cards.standard.standardProbeSearchPlaceholder")}
                            emptyMessage={t("adjustment.cards.standard.standardProbeEmpty")}
                            options={standards.map((item) => ({
                              value: String(item.Id_Etalon),
                              label: item.Etalon_Numero_Serie ?? `#${item.Id_Etalon}`,
                              group: item.Est_Sonde_Externe
                                ? t("adjustment.cards.standard.externalGroup")
                                : t("adjustment.cards.standard.internalGroup"),
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
                          disabled={isMediaLoading || isAdjustmentRunning}
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
                          <Input value={selectedMedium?.Model ?? ""} readOnly />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("adjustment.cards.medium.reference")}</Label>
                          <Input value={selectedMedium?.Reference ?? ""} readOnly />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("adjustment.cards.medium.stability")}</Label>
                          <Input
                            value={formatDecimalDisplay(selectedMedium?.Stabilite)}
                            readOnly
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("adjustment.cards.medium.homogeneity")}</Label>
                          <Input
                            value={formatDecimalDisplay(selectedMedium?.Homogeneite)}
                            readOnly
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {coefficientSensors.length > 0 ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("adjustment.cards.coefficients.title")}</CardTitle>
                        <CardDescription>
                          {t("adjustment.cards.coefficients.description")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="overflow-x-auto">
                          <div className="min-w-[620px] space-y-3">
                            <div className="grid grid-cols-[minmax(180px,1fr)_repeat(3,minmax(110px,0.5fr))] gap-3 text-sm font-medium text-muted-foreground">
                              <span>{t("adjustment.cards.coefficients.sensor")}</span>
                              <span>{t("adjustment.cards.coefficients.coeffA")}</span>
                              <span>{t("adjustment.cards.coefficients.coeffB")}</span>
                              <span>{t("adjustment.cards.coefficients.coeffC")}</span>
                            </div>
                            {coefficientSensors.map((sensor) => {
                              const draft = coefficientDrafts[sensor.id] ?? {
                                a: formatCoefficientDisplay(sensor.coeffA),
                                b: formatCoefficientDisplay(sensor.coeffB),
                                c: formatCoefficientDisplay(sensor.coeffC),
                              }
                              return (
                                <div
                                  key={sensor.id}
                                  className="grid grid-cols-[minmax(180px,1fr)_repeat(3,minmax(110px,0.5fr))] items-center gap-3"
                                >
                                  <div>
                                    <p className="font-medium">{sensor.serialNumber}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {sensor.locationName ?? t("adjustment.cards.coefficients.noLocation")}
                                    </p>
                                  </div>
                                  {(["a", "b", "c"] as const).map((coefficient) => (
                                    <Input
                                      key={coefficient}
                                      inputMode="decimal"
                                      aria-label={`${sensor.serialNumber} ${coefficient}`}
                                      value={draft[coefficient]}
                                      readOnly={!isAdjustmentRunning || coefficientsLocked}
                                      disabled={updateCoefficientsMutation.isPending || coefficientsLocked}
                                      onChange={(event) => {
                                        if (!isAdjustmentRunning || coefficientsLocked) return
                                        const value = event.target.value
                                        setCoefficientDrafts((current) => ({
                                          ...current,
                                          [sensor.id]: {
                                            ...(current[sensor.id] ?? draft),
                                            [coefficient]: value,
                                          },
                                        }))
                                        setCoefficientTouched((current) => ({
                                          ...current,
                                          [sensor.id]: {
                                            ...current[sensor.id],
                                            [coefficient]: true,
                                          },
                                        }))
                                      }}
                                    />
                                  ))}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        {coefficientsLocked ? (
                          <Alert className="border-amber-300 bg-amber-50 text-amber-950">
                            <BadgeInfo className="h-4 w-4" />
                            <AlertTitle>{t("adjustment.cards.coefficients.lockedTitle")}</AlertTitle>
                            <AlertDescription>{t("adjustment.cards.coefficients.lockedDescription")}</AlertDescription>
                          </Alert>
                        ) : null}
                        {isAdjustmentRunning && session ? (
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-muted-foreground">
                              {t("adjustment.cards.coefficients.nextReadNotice")}
                            </p>
                            <Button
                              type="button"
                              disabled={updateCoefficientsMutation.isPending || coefficientsLocked}
                              onClick={() => {
                                const coefficients = session.sensors.map((sensor) => {
                                  const draft = coefficientDrafts[sensor.id]
                                  const touched = coefficientTouched[sensor.id] ?? {}
                                  const parseCoefficient = (value: string | undefined) => {
                                    const normalized = value?.trim().replace(",", ".") ?? ""
                                    return normalized.length > 0 ? Number(normalized) : Number.NaN
                                  }
                                  return {
                                    sensorId: sensor.id,
                                    coeffA: touched.a ? parseCoefficient(draft?.a) : sensor.coeffA,
                                    coeffB: touched.b ? parseCoefficient(draft?.b) : sensor.coeffB,
                                    coeffC: touched.c ? parseCoefficient(draft?.c) : sensor.coeffC,
                                  }
                                })
                                if (
                                  coefficients.some(
                                    (item) =>
                                      !Number.isFinite(item.coeffA) ||
                                      !Number.isFinite(item.coeffB) ||
                                      !Number.isFinite(item.coeffC) ||
                                      (Math.abs(item.coeffC) > 1e-12 &&
                                        Math.abs(item.coeffA) <= 1e-12),
                                  )
                                ) {
                                  setActionError(t("adjustment.cards.coefficients.invalid"))
                                  return
                                }
                                updateCoefficientsMutation.mutate(coefficients)
                              }}
                            >
                              {updateCoefficientsMutation.isPending
                                ? t("adjustment.cards.coefficients.saving")
                                : t("adjustment.cards.coefficients.validate")}
                            </Button>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  ) : null}

                  <div
                    className={`grid gap-4 ${
                      usesExternalStandard ? "xl:grid-cols-3" : "xl:grid-cols-4"
                    }`}
                  >
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
                          disabled={
                            isAdjustmentRunning
                              ? stopMutation.isPending
                              : !canRunAdjustment
                          }
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
                          ) : startMutation.isPending ? (
                            <>
                              <TimerReset className="mr-2 h-4 w-4 animate-pulse" />
                              {t("adjustment.cards.run.queued")}
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
                              value={
                                session?.validatedPoints?.[1]?.targetValue != null
                                  ? formatDecimalDisplay(session.validatedPoints[1].targetValue)
                                  : pointOne
                              }
                              readOnly={!isExternalSession}
                              onChange={(event) => setPointOne(event.target.value)}
                              disabled={!isAdjustmentRunning || Boolean(session?.validatedPoints?.[1]) || activeAcquisitionPoint === 1}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={!canStartPointOneAcquisition || startPointAcquisitionMutation.isPending || updateCoefficientsMutation.isPending}
                            onClick={() => {
                              if (isExternalSession && !Number.isFinite(pointOneManualValue)) {
                                setActionError(t("adjustment.cards.points.invalidValue"))
                                return
                              }
                              setShowFirstPointConfirm(true)
                            }}
                          >
                            {t("adjustment.cards.points.startFirstAcquisition")}
                          </Button>
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1 space-y-2">
                            <Label htmlFor="adjustment-point-two">{t("adjustment.cards.points.pointTwo")}</Label>
                            <Input
                              id="adjustment-point-two"
                              value={
                                session?.validatedPoints?.[2]?.targetValue != null
                                  ? formatDecimalDisplay(session.validatedPoints[2].targetValue)
                                  : pointTwo
                              }
                              readOnly={!isExternalSession}
                              onChange={(event) => setPointTwo(event.target.value)}
                              disabled={!isAdjustmentRunning || !validatedPoints.pointOne || Boolean(session?.validatedPoints?.[2]) || activeAcquisitionPoint === 2}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={!canStartPointTwoAcquisition || startPointAcquisitionMutation.isPending}
                            onClick={() => {
                              if (isExternalSession && !Number.isFinite(pointTwoManualValue)) {
                                setActionError(t("adjustment.cards.points.invalidValue"))
                                return
                              }
                              startPointAcquisitionMutation.mutate({
                                pointIndex: 2,
                                targetValue: isExternalSession ? pointTwoManualValue : undefined,
                              })
                            }}
                          >
                            {t("adjustment.cards.points.startSecondAcquisition")}
                          </Button>
                        </div>
                        {activeAcquisitionPoint ? (
                          <p className="text-sm text-muted-foreground">
                            {t("adjustment.cards.points.collecting", { point: activeAcquisitionPoint })}
                          </p>
                        ) : null}
                      </CardContent>
                    </Card>

                    <Card
                      className={
                        usesExternalStandard
                          ? "border-dashed bg-muted/40 opacity-60"
                          : undefined
                      }
                      aria-disabled={usesExternalStandard}
                    >
                      <CardHeader>
                        <CardTitle>{t("adjustment.cards.standardMeasure.title")}</CardTitle>
                        <CardDescription>{t("adjustment.cards.standardMeasure.description")}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
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

                    {!usesExternalStandard ? (
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
                        <div className="space-y-2">
                          <Label htmlFor="adjustment-measurement-interval">
                            {t.rich("adjustment.cards.plateau.measurementIntervalSeconds", {
                              strong: (chunks) => <strong>{chunks}</strong>,
                            })}
                          </Label>
                          <Select
                            value={hasSelectedGso ? "60" : measurementIntervalSeconds === "30" ? "30" : "15"}
                            onValueChange={setMeasurementIntervalSeconds}
                            disabled={isExternalStandard || isAdjustmentRunning || hasSelectedGso}
                          >
                            <SelectTrigger id="adjustment-measurement-interval">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {hasSelectedGso ? (
                                <SelectItem value="60">60 s</SelectItem>
                              ) : (
                                <>
                                  <SelectItem value="15">15 s</SelectItem>
                                  <SelectItem value="30">30 s</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            {hasSelectedGso
                              ? t("adjustment.cards.plateau.gsoFixedInterval")
                              : t("adjustment.cards.plateau.measurementIntervalHelp")}
                          </p>
                        </div>
                        {!isMeasurementIntervalValid ? (
                          <Alert variant="destructive">
                            <AlertTitle>{t("adjustment.cards.plateau.invalidIntervalTitle")}</AlertTitle>
                            <AlertDescription>
                              {t("adjustment.cards.plateau.invalidIntervalDescription")}
                            </AlertDescription>
                          </Alert>
                        ) : null}
                        {hasPlateauIntervalMismatch ? (
                          <Alert className="border-amber-300 bg-amber-50 text-amber-950">
                            <BadgeInfo className="h-4 w-4" />
                            <AlertTitle>{t("adjustment.cards.plateau.mismatchTitle")}</AlertTitle>
                            <AlertDescription>
                              {t("adjustment.cards.plateau.mismatchDescription", {
                                count: expectedPlateauCycles ?? 0,
                              })}
                            </AlertDescription>
                          </Alert>
                        ) : null}
                        {session?.plateauStatus.status === "running" ? (
                          <div className="grid gap-3 rounded-xl border border-sky-300 bg-sky-50 p-4 text-sky-950">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 font-medium">
                                <TimerReset className="size-4 animate-pulse" />
                                {t("adjustment.cards.points.collecting", {
                                  point: session.plateauStatus.pointIndex ?? 1,
                                })}
                              </div>
                              <span className="font-mono text-lg font-semibold">{plateauTimerLabel}</span>
                            </div>
                            <Progress
                              value={plateauProgress}
                              className="h-2 bg-sky-100"
                              indicatorClassName="bg-sky-500"
                            />
                            <div className="flex justify-between text-xs text-sky-800">
                              <span>{session.plateauStatus.standardSampleCount} mesure(s)</span>
                              <span>
                                {session.plateauStatus.lastGap == null
                                  ? `- / ${formatDecimalDisplay(session.plateauStatus.maxGap)}`
                                  : `${formatDecimalDisplay(session.plateauStatus.lastGap)} / ${formatDecimalDisplay(session.plateauStatus.maxGap)}`}
                              </span>
                            </div>
                            {session.plateauStatus.lastResetAt ? (
                              <p className="text-xs font-medium text-amber-800">
                                {session.message}
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                        {session?.plateauStatus.status === "waiting" ? (
                          <div className="grid gap-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
                            <div className="flex items-center gap-2 font-medium">
                              <TimerReset className="size-4" />
                              {session.message}
                            </div>
                            {session.plateauStatus.startedAt ? (
                              <Progress
                                value={100}
                                className="h-2 bg-amber-100"
                                indicatorClassName="bg-amber-500"
                              />
                            ) : null}
                          </div>
                        ) : null}
                        {session?.plateauStatus.status === "failed" ? (
                          <div className="grid gap-2 rounded-xl border border-red-300 bg-red-50 p-4 text-red-950">
                            <div className="flex items-center gap-2 font-semibold">
                              <CircleX className="size-5" />
                              {session.message}
                            </div>
                            <div className="font-mono text-sm">
                              {formatDecimalDisplay(session.plateauStatus.lastGap)} &gt;{" "}
                              {formatDecimalDisplay(session.plateauStatus.maxGap)}
                            </div>
                          </div>
                        ) : null}
                        {session?.plateauStatus.status === "validated" ? (
                          <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-4 font-medium text-emerald-950">
                            <CheckCircle2 className="size-5" />
                            {session.message}
                          </div>
                        ) : null}
                        </CardContent>
                      </Card>
                    ) : null}
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>{t("adjustment.selectedSensors.title")}</CardTitle>
                      <CardDescription>{t("adjustment.selectedSensors.description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TanStackTable
                        columns={selectedSensorsColumns}
                        data={adjustmentSensors}
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

                  {session?.validatedPoints?.[1] && session?.validatedPoints?.[2] ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("adjustment.cards.calculation.title")}</CardTitle>
                        <CardDescription>{t("adjustment.cards.calculation.description")}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCalculationDetails((current) => !current)}
                        >
                          {showCalculationDetails
                            ? t("adjustment.cards.calculation.hideDetails")
                            : t("adjustment.cards.calculation.showDetails")}
                        </Button>

                        {showCalculationDetails ? (
                          <div className="space-y-4">
                            {session.sensors.map((sensor) => {
                              const pointOneResult = session.validatedPoints[1]
                              const pointTwoResult = session.validatedPoints[2]
                              if (!pointOneResult || !pointTwoResult) return null
                              const rawOne = pointOneResult.sensorAverages[sensor.id]
                              const rawTwo = pointTwoResult.sensorAverages[sensor.id]
                              const standardOne = pointOneResult.standardAverage
                              const standardTwo = pointTwoResult.standardAverage
                              const denominator =
                                rawOne != null && rawTwo != null ? rawTwo - rawOne : null
                              const coeffA =
                                denominator != null && denominator !== 0 && standardOne != null && standardTwo != null
                                  ? (standardTwo - standardOne) / denominator
                                  : null
                              const coeffB =
                                coeffA != null && rawOne != null && standardOne != null
                                  ? standardOne - coeffA * rawOne
                                  : null

                              return (
                                <div key={sensor.id} className="space-y-3 rounded-xl border p-4">
                                  <p className="font-semibold">{sensor.serialNumber}</p>
                                  <div className="grid gap-2 text-sm md:grid-cols-2">
                                    <p>{t("adjustment.cards.calculation.pointOne", { standard: String(standardOne ?? "-"), sensor: String(rawOne ?? "-") })}</p>
                                    <p>{t("adjustment.cards.calculation.pointTwo", { standard: String(standardTwo ?? "-"), sensor: String(rawTwo ?? "-") })}</p>
                                  </div>
                                  {coeffA == null || coeffB == null ? (
                                    <p className="text-sm text-destructive">
                                      {t("adjustment.cards.calculation.invalid")}
                                    </p>
                                  ) : (
                                    <div className="space-y-2 rounded-lg bg-muted/40 p-3 font-mono text-sm">
                                      <p>
                                        {t("adjustment.cards.calculation.formulaA", {
                                          standardTwo: formatDecimalDisplay(standardTwo),
                                          standardOne: formatDecimalDisplay(standardOne),
                                          sensorTwo: formatDecimalDisplay(rawTwo),
                                          sensorOne: formatDecimalDisplay(rawOne),
                                          result: formatCoefficientDisplay(coeffA),
                                        })}
                                      </p>
                                      <p>
                                        {t("adjustment.cards.calculation.formulaB", {
                                          standardOne: formatDecimalDisplay(standardOne),
                                          coefficientA: formatCoefficientDisplay(coeffA),
                                          sensorOne: formatDecimalDisplay(rawOne),
                                          result: formatCoefficientDisplay(coeffB),
                                        })}
                                      </p>
                                      <p>{t("adjustment.cards.calculation.formulaC")}</p>
                                    </div>
                                  )}
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
        </div>

        <MetrologySubpagesCards current="adjustment" />

        <AlertDialog
          open={session?.coefficientApplication.status === "pending"}
          onOpenChange={() => undefined}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("adjustment.cards.calculatedCoefficients.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("adjustment.cards.calculatedCoefficients.description", {
                  count: session?.coefficientApplication.gspSensorCount ?? 0,
                })}
              </AlertDialogDescription>
              {(session?.coefficientApplication.gsoSensorCount ?? 0) > 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("adjustment.cards.calculatedCoefficients.gsoNotice", {
                    count: session?.coefficientApplication.gsoSensorCount ?? 0,
                  })}
                </p>
              ) : null}
            </AlertDialogHeader>
            {resolveCalculatedCoefficientsMutation.error ? (
              <Alert variant="destructive">
                <AlertTitle>{t("adjustment.status.errorTitle")}</AlertTitle>
                <AlertDescription>
                  {getActionErrorMessage(resolveCalculatedCoefficientsMutation.error)}
                </AlertDescription>
              </Alert>
            ) : null}
            <AlertDialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={resolveCalculatedCoefficientsMutation.isPending}
                onClick={() => resolveCalculatedCoefficientsMutation.mutate(false)}
              >
                {t("adjustment.cards.calculatedCoefficients.keepPrevious")}
              </Button>
              <AlertDialogAction
                disabled={resolveCalculatedCoefficientsMutation.isPending}
                onClick={(event) => {
                  event.preventDefault()
                  resolveCalculatedCoefficientsMutation.mutate(true)
                }}
              >
                {resolveCalculatedCoefficientsMutation.isPending
                  ? t("adjustment.cards.calculatedCoefficients.applying")
                  : t("adjustment.cards.calculatedCoefficients.apply")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showFirstPointConfirm} onOpenChange={setShowFirstPointConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("adjustment.cards.points.confirmCoefficientsTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {hasUnsavedCoefficientChanges
                  ? t("adjustment.cards.points.confirmCoefficientsUnsavedDescription")
                  : t("adjustment.cards.points.confirmCoefficientsDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("adjustment.cards.points.confirmCoefficientsCancel")}</AlertDialogCancel>
              <AlertDialogAction
                disabled={startPointAcquisitionMutation.isPending || updateCoefficientsMutation.isPending || hasUnsavedCoefficientChanges}
                onClick={() => {
                  setShowFirstPointConfirm(false)
                  startPointAcquisitionMutation.mutate({
                    pointIndex: 1,
                    targetValue: isExternalSession ? pointOneManualValue : undefined,
                  })
                }}
              >
                {t("adjustment.cards.points.confirmCoefficientsStart")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
