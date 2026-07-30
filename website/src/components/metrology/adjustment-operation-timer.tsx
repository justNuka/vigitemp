"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Clock3, FlaskConical, Square, TimerReset } from "lucide-react"
import { useTranslations } from "next-intl"

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

const SESSION_QUERY_KEY = ["metrology-adjustment-session"] as const

type AdjustmentTimerSession = {
  id: string
  status: "idle" | "running" | "completed" | "cancelled" | "failed"
  expiresAt: string
  extensionCount: number
  canExtend: boolean
  sensors: Array<{ id: number }>
}

type AdjustmentTimerPayload = {
  session: AdjustmentTimerSession | null
  shouldConfirmStop?: boolean
}

function formatRemainingTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":")
}

export function AdjustmentOperationTimer() {
  const t = useTranslations("metrologyAdmin.adjustmentPage.operationTimer")
  const queryClient = useQueryClient()
  const { user, isStandard, isExpert, hasPermission } = useAppAccess()
  const [now, setNow] = useState<number | null>(null)
  const [extensionError, setExtensionError] = useState<string | null>(null)
  const [stopError, setStopError] = useState<string | null>(null)
  const [stopDialogOpen, setStopDialogOpen] = useState(false)
  const canAccessAdjustment =
    Boolean(user) && (isStandard || isExpert) && hasPermission("METROLOGY_OPERATION_ACCESS")

  const sessionQuery = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: () => getJson<AdjustmentTimerPayload>("/api/metrologie/ajustage/session"),
    enabled: canAccessAdjustment,
    retry: false,
    refetchInterval: (query) => {
      if (isUnauthorizedError(query.state.error)) return false
      const payload = query.state.data as AdjustmentTimerPayload | undefined
      return payload?.session?.status === "running" ? 5_000 : 15_000
    },
    refetchIntervalInBackground: true,
  })

  const session = sessionQuery.data?.session ?? null
  const isRunning = session?.status === "running"
  const remainingSeconds =
    isRunning && session && now !== null
      ? Math.max(0, Math.ceil((new Date(session.expiresAt).getTime() - now) / 1000))
      : 0
  const isUrgent = remainingSeconds <= 30 * 60
  const canExtend =
    session?.canExtend ||
    (isRunning &&
      remainingSeconds > 0 &&
      remainingSeconds <= 30 * 60 &&
      session?.extensionCount === 0)

  useEffect(() => {
    if (!isRunning) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [isRunning])

  useEffect(() => {
    if (session?.expiresAt) setNow(Date.now())
  }, [session?.expiresAt])

  const extensionMutation = useMutation({
    mutationFn: () =>
      fetchJson<{ session: AdjustmentTimerSession }>("/api/metrologie/ajustage/session", {
        method: "PATCH",
      }),
    onSuccess: async () => {
      setExtensionError(null)
      await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY })
    },
    onError: (error) => {
      setExtensionError(error instanceof Error ? error.message : t("extensionError"))
    },
  })

  const stopMutation = useMutation({
    mutationFn: () =>
      fetchJson<{ session: AdjustmentTimerSession | null }>("/api/metrologie/ajustage/session", {
        method: "DELETE",
        body: JSON.stringify({ cancelResults: true }),
      }),
    onSuccess: async () => {
      setStopError(null)
      setStopDialogOpen(false)
      await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY })
    },
    onError: (error) => {
      setStopError(error instanceof Error ? error.message : t("stopError"))
    },
  })

  if (!isRunning || !session) return null

  return (
    <>
      <aside
        aria-live="polite"
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
            <p className="text-sm font-semibold">{t("title")}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("sensorCount", { count: session.sensors.length })}
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
                setStopDialogOpen(true)
              }}
            >
              <Square className="size-4" />
              {t("stop")}
            </Button>
            {extensionError ? (
              <p className="mt-2 text-xs text-destructive">{extensionError}</p>
            ) : null}
          </div>
        </div>
      </aside>

      <AlertDialog open={stopDialogOpen} onOpenChange={setStopDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("stopTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("stopDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          {stopError ? <p className="text-sm text-destructive">{stopError}</p> : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={stopMutation.isPending}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={stopMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault()
                stopMutation.mutate()
              }}
            >
              {stopMutation.isPending ? t("stopping") : t("confirmStop")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
