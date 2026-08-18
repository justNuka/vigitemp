"use client"

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Clock3, FlaskConical, GripVertical, Square, TimerReset } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { useAppAccess } from "@/components/access/app-access-provider"
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
import { Button } from "@/components/ui/button"
import { fetchJson, getJson, isUnauthorizedError } from "@/lib/http"
import { cn } from "@/lib/utils"

const ADJUSTMENT_SESSION_QUERY_KEY = ["metrology-adjustment-session"] as const
const CALIBRATION_SESSION_QUERY_KEY = ["metrology-calibration-session"] as const
const CALIBRATION_MAX_DURATION_MS = 90 * 60 * 1000
const PANEL_MARGIN_PX = 8

type OperationType = "adjustment" | "calibration"

type AdjustmentTimerSession = {
  id: string
  status: "idle" | "running" | "completed" | "cancelled" | "failed"
  startedAt: string
  expiresAt: string
  extensionCount: number
  canExtend: boolean
  sensors: Array<{ id: number }>
}

type CalibrationTimerSession = {
  id: string
  status: "running" | "completed" | "failed"
  startedAt: string
  sensors: Array<{ id: number }>
}

type AdjustmentTimerPayload = {
  session: AdjustmentTimerSession | null
  shouldConfirmStop?: boolean
}

type CalibrationTimerPayload = {
  session: CalibrationTimerSession | null
}

type ActiveOperation = {
  type: OperationType
  id: string
  startedAt: string
  expiresAt: string
  sensorCount: number
  extensionCount: number
  canExtend: boolean
}

type PanelPosition = {
  left: number
  top: number
}

type DragState = {
  pointerId: number
  offsetX: number
  offsetY: number
}

function formatRemainingTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":")
}

function calibrationExpiresAt(startedAt: string) {
  const startedAtMs = new Date(startedAt).getTime()
  return Number.isFinite(startedAtMs)
    ? new Date(startedAtMs + CALIBRATION_MAX_DURATION_MS).toISOString()
    : startedAt
}

function clampPanelPosition(element: HTMLElement | null, left: number, top: number): PanelPosition {
  if (typeof window === "undefined") return { left, top }

  const rect = element?.getBoundingClientRect()
  const width = rect?.width ?? Math.min(352, Math.max(0, window.innerWidth - 32))
  const height = rect?.height ?? 0
  const maxLeft = Math.max(PANEL_MARGIN_PX, window.innerWidth - width - PANEL_MARGIN_PX)
  const maxTop = Math.max(PANEL_MARGIN_PX, window.innerHeight - height - PANEL_MARGIN_PX)

  return {
    left: Math.min(Math.max(PANEL_MARGIN_PX, left), maxLeft),
    top: Math.min(Math.max(PANEL_MARGIN_PX, top), maxTop),
  }
}

export function AdjustmentOperationTimer() {
  const t = useTranslations("metrologyAdmin.adjustmentPage.operationTimer")
  const tCalibration = useTranslations("metrologyAdmin.calibrationPage")
  const locale = useLocale()
  const queryClient = useQueryClient()
  const { user, isStandard, isExpert, hasPermission } = useAppAccess()
  const panelRef = useRef<HTMLElement | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const [position, setPosition] = useState<PanelPosition | null>(null)
  const [now, setNow] = useState<number | null>(null)
  const [extensionError, setExtensionError] = useState<string | null>(null)
  const [stopError, setStopError] = useState<string | null>(null)
  const [stopDialogOpen, setStopDialogOpen] = useState(false)
  const [stopOperationType, setStopOperationType] = useState<OperationType | null>(null)
  const canAccessMetrologyOperation =
    Boolean(user) && (isStandard || isExpert) && hasPermission("METROLOGY_OPERATION_ACCESS")

  const adjustmentSessionQuery = useQuery({
    queryKey: ADJUSTMENT_SESSION_QUERY_KEY,
    queryFn: () => getJson<AdjustmentTimerPayload>("/api/metrologie/ajustage/session"),
    enabled: canAccessMetrologyOperation,
    retry: false,
    refetchInterval: (query) => {
      if (isUnauthorizedError(query.state.error)) return false
      const payload = query.state.data as AdjustmentTimerPayload | undefined
      return payload?.session?.status === "running" ? 5_000 : 15_000
    },
    refetchIntervalInBackground: true,
  })

  const calibrationSessionQuery = useQuery({
    queryKey: CALIBRATION_SESSION_QUERY_KEY,
    queryFn: () => getJson<CalibrationTimerPayload>("/api/metrologie/etalonnage/session"),
    enabled: canAccessMetrologyOperation,
    retry: false,
    refetchInterval: (query) => {
      if (isUnauthorizedError(query.state.error)) return false
      const payload = query.state.data as CalibrationTimerPayload | undefined
      return payload?.session?.status === "running" ? 5_000 : 15_000
    },
    refetchIntervalInBackground: true,
  })

  const adjustmentSession = adjustmentSessionQuery.data?.session ?? null
  const calibrationSession = calibrationSessionQuery.data?.session ?? null
  const activeOperations: ActiveOperation[] = []

  if (adjustmentSession?.status === "running") {
    activeOperations.push({
      type: "adjustment",
      id: adjustmentSession.id,
      startedAt: adjustmentSession.startedAt,
      expiresAt: adjustmentSession.expiresAt,
      sensorCount: adjustmentSession.sensors.length,
      extensionCount: adjustmentSession.extensionCount,
      canExtend: adjustmentSession.canExtend,
    })
  }

  if (calibrationSession?.status === "running") {
    activeOperations.push({
      type: "calibration",
      id: calibrationSession.id,
      startedAt: calibrationSession.startedAt,
      expiresAt: calibrationExpiresAt(calibrationSession.startedAt),
      sensorCount: calibrationSession.sensors.length,
      extensionCount: 0,
      canExtend: false,
    })
  }

  activeOperations.sort((left, right) => {
    const leftStartedAt = new Date(left.startedAt).getTime()
    const rightStartedAt = new Date(right.startedAt).getTime()
    if (!Number.isFinite(leftStartedAt)) return 1
    if (!Number.isFinite(rightStartedAt)) return -1
    return rightStartedAt - leftStartedAt
  })

  const activeOperation = activeOperations[0] ?? null
  const expirationMs = activeOperation ? new Date(activeOperation.expiresAt).getTime() : Number.NaN
  const remainingSeconds =
    activeOperation && now !== null && Number.isFinite(expirationMs)
      ? Math.max(0, Math.ceil((expirationMs - now) / 1000))
      : 0
  const isUrgent = Boolean(activeOperation) && remainingSeconds <= 30 * 60
  const canExtend =
    activeOperation?.type === "adjustment" &&
    (activeOperation.canExtend ||
      (remainingSeconds > 0 && remainingSeconds <= 30 * 60 && activeOperation.extensionCount === 0))
  const isFr = locale.toLowerCase().startsWith("fr")
  const operationTitle =
    activeOperation?.type === "calibration"
      ? isFr
        ? "Étalonnage en cours"
        : "Calibration in progress"
      : t("title")

  useEffect(() => {
    if (!activeOperation) {
      setPosition(null)
      return
    }

    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    setNow(Date.now())
    return () => window.clearInterval(timer)
  }, [activeOperation?.id, activeOperation?.type])

  useEffect(() => {
    const handleResize = () => {
      setPosition((current) =>
        current
          ? clampPanelPosition(panelRef.current, current.left, current.top)
          : current,
      )
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const extensionMutation = useMutation({
    mutationFn: () =>
      fetchJson<{ session: AdjustmentTimerSession }>("/api/metrologie/ajustage/session", {
        method: "PATCH",
      }),
    onSuccess: async () => {
      setExtensionError(null)
      await queryClient.invalidateQueries({ queryKey: ADJUSTMENT_SESSION_QUERY_KEY })
    },
    onError: (error) => {
      setExtensionError(error instanceof Error ? error.message : t("extensionError"))
    },
  })

  const stopMutation = useMutation({
    mutationFn: (operationType: OperationType) => {
      if (operationType === "calibration") {
        return fetchJson<{ session: CalibrationTimerSession | null }>("/api/metrologie/etalonnage/session", {
          method: "DELETE",
        })
      }

      return fetchJson<{ session: AdjustmentTimerSession | null }>("/api/metrologie/ajustage/session", {
        method: "DELETE",
        body: JSON.stringify({ cancelResults: true }),
      })
    },
    onSuccess: async (_data, operationType) => {
      setStopError(null)
      setStopDialogOpen(false)
      setStopOperationType(null)
      await queryClient.invalidateQueries({
        queryKey:
          operationType === "calibration"
            ? CALIBRATION_SESSION_QUERY_KEY
            : ADJUSTMENT_SESSION_QUERY_KEY,
      })
    },
    onError: (error, operationType) => {
      const fallback =
        operationType === "calibration"
          ? isFr
            ? "Impossible d'arrêter l'étalonnage."
            : "Unable to stop calibration."
          : t("stopError")
      setStopError(error instanceof Error ? error.message : fallback)
    },
  })

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const panel = panelRef.current
    if (!panel) return

    const rect = panel.getBoundingClientRect()
    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setPosition({ left: rect.left, top: rect.top })
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    setPosition(
      clampPanelPosition(
        panelRef.current,
        event.clientX - drag.offsetX,
        event.clientY - drag.offsetY,
      ),
    )
  }

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  if (!activeOperation) return null

  const stoppingCalibration = stopOperationType === "calibration"
  const stopTitle = stoppingCalibration
    ? isFr
      ? "Arrêter l'étalonnage ?"
      : "Stop calibration?"
    : t("stopTitle")
  const stopDescription = stoppingCalibration
    ? isFr
      ? "L'étalonnage en cours sera arrêté et les sondes retrouveront leur état précédent."
      : "The current calibration will be stopped and the sensors will return to their previous state."
    : t("stopDescription")
  const stopButtonLabel =
    activeOperation.type === "calibration" ? tCalibration("workflow.calibration.stop") : t("stop")
  const confirmStopLabel = stoppingCalibration
    ? tCalibration("workflow.calibration.stop")
    : t("confirmStop")

  return (
    <>
      <aside
        ref={panelRef}
        aria-live="polite"
        style={position ? { left: position.left, top: position.top, right: "auto" } : undefined}
        className={cn(
          "fixed right-4 top-20 z-[70] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-card shadow-xl",
          isUrgent ? "border-amber-400/70" : "border-cyan-400/50",
        )}
      >
        <div
          className={cn(
            "h-1 w-full",
            isUrgent
              ? "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"
              : "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500",
          )}
        />
        <div
          className="flex touch-none cursor-grab select-none items-center gap-2 border-b bg-muted/35 px-3 py-2 active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          title={isFr ? "Déplacer le panneau" : "Move panel"}
        >
          <GripVertical className="size-4 shrink-0 text-muted-foreground" />
          <p className="min-w-0 flex-1 truncate text-sm font-semibold">{operationTitle}</p>
        </div>
        <div className="flex items-start gap-3 p-4">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              isUrgent
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-300"
                : "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
            )}
          >
            <FlaskConical className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">
              {t("sensorCount", { count: activeOperation.sensorCount })}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Clock3 className="size-4 text-muted-foreground" />
              <span className="font-mono text-2xl font-semibold tabular-nums">
                {now === null ? "--:--:--" : formatRemainingTime(remainingSeconds)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t("remaining")}</p>

            {canExtend ? (
              <Button
                className="mt-3 w-full"
                size="sm"
                variant="outline"
                disabled={extensionMutation.isPending || stopMutation.isPending}
                onClick={() => extensionMutation.mutate()}
              >
                <TimerReset className="size-4" />
                {extensionMutation.isPending ? t("extending") : t("extend")}
              </Button>
            ) : null}
            <Button
              className="mt-3 w-full"
              size="sm"
              variant="destructive"
              disabled={stopMutation.isPending}
              onClick={() => {
                setStopError(null)
                setStopOperationType(activeOperation.type)
                setStopDialogOpen(true)
              }}
            >
              <Square className="size-4" />
              {stopButtonLabel}
            </Button>
            {extensionError ? (
              <p className="mt-2 text-xs text-destructive">{extensionError}</p>
            ) : null}
          </div>
        </div>
      </aside>

      <AlertDialog
        open={stopDialogOpen}
        onOpenChange={(open) => {
          setStopDialogOpen(open)
          if (!open && !stopMutation.isPending) setStopOperationType(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{stopTitle}</AlertDialogTitle>
            <AlertDialogDescription>{stopDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          {stopError ? <p className="text-sm text-destructive">{stopError}</p> : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={stopMutation.isPending}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={stopMutation.isPending || !stopOperationType}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault()
                if (stopOperationType) stopMutation.mutate(stopOperationType)
              }}
            >
              {stopMutation.isPending ? t("stopping") : confirmStopLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
