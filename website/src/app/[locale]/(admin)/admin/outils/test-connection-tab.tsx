"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle, CircleCheck, RadioTower } from "lucide-react"
import { useLocale, useTranslations } from 'next-intl'

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchJson, getJson } from "@/lib/http"
import { formatNumber } from "@/lib/number-display"

import { buildSensorColumns } from "./_components/build-sensor-columns"
import { SensorsTableCard } from "./_components/sensors-table-card"
import { TestConnectionStats } from "./_components/test-connection-stats"
import type {
  SensorTestCatalogPayload,
  SensorTestSnapshotPayload,
  SensorTestStatus,
  SensorWithSelection,
} from "./_components/sensor-types"

type TestRun = {
  startedAt: string
  endsAt: number
  sensorIds: number[]
  running: boolean
}

export function TestConnectionTab() {
  const t = useTranslations('toolsTestConnection')
  const locale = useLocale()
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isLaunchDialogOpen, setIsLaunchDialogOpen] = useState(false)
  const [testDurationMinutes, setTestDurationMinutes] = useState("1")
  const [run, setRun] = useState<TestRun | null>(null)
  const [snapshot, setSnapshot] = useState<SensorTestSnapshotPayload | null>(null)
  const [testError, setTestError] = useState<string | null>(null)
  const [nowMs, setNowMs] = useState(() => Date.now())

  const catalogQuery = useQuery({
    queryKey: ["tools-sensor-test-catalog"],
    queryFn: () => getJson<SensorTestCatalogPayload>("/api/outils/sensor-tests"),
  })

  const resultBySensorId = useMemo(
    () => new Map((snapshot?.results ?? []).map((result) => [result.sensorId, result])),
    [snapshot?.results],
  )
  const runSensorIds = useMemo(() => new Set(run?.sensorIds ?? []), [run?.sensorIds])

  const sensors = useMemo<SensorWithSelection[]>(() => {
    return (catalogQuery.data?.sensors ?? []).map((sensor) => {
      const result = resultBySensorId.get(sensor.id)
      const wasTested = runSensorIds.has(sensor.id)
      let status: SensorTestStatus = "idle"
      if (wasTested) {
        if (!result || result.totalAttempts === 0) status = run?.running ? "waiting" : "no-data"
        else if (result.receivedAttempts === 0) status = "failed"
        else if ((result.responseRate ?? 0) >= 95) status = "success"
        else status = "partial"
      }

      const signal = result?.lastValue != null
        ? `${formatNumber(result.lastValue, { locale, maximumDecimals: 3, grouping: false })}${result.unit ? ` ${result.unit}` : ""}`
        : null
      const moduleLabel = [sensor.module, sensor.modulePort].filter(Boolean).join(" · ") || null

      return {
        Id_Sonde: sensor.id,
        Sonde_Numero_Serie: sensor.serialNumber,
        Adresse_Sonde: sensor.address,
        Port_Serie: sensor.modulePort,
        Lieu: sensor.location,
        Module: moduleLabel,
        Famille_Sonde: sensor.family,
        Surveillance_Etat: sensor.surveillanceState,
        Frequence_Mesure: sensor.frequencyMeasure,
        Frequence_Recup: sensor.frequencyRecovery,
        Signal_Lu: signal,
        Taux_Reponse: result?.responseRate ?? null,
        Nombre_Total: result?.totalAttempts ?? 0,
        Nombre_Recu: result?.receivedAttempts ?? 0,
        Test_Status: status,
        Derniere_Reponse: result?.lastResponseAt ?? null,
        Rssi: result?.rssi ?? null,
      }
    })
  }, [catalogQuery.data?.sensors, locale, resultBySensorId, run?.running, runSensorIds])

  const isRunning = Boolean(run?.running)
  const selectedCountForStats = run ? run.sensorIds.length : selectedIds.length
  const respondingSensorCount = snapshot?.results.filter((result) => result.receivedAttempts > 0).length ?? 0
  const remainingSeconds = run ? Math.max(0, Math.ceil((run.endsAt - nowMs) / 1000)) : 0
  const durationMs = run ? run.endsAt - new Date(run.startedAt).getTime() : 0
  const elapsedMs = run ? Math.max(0, Math.min(durationMs, nowMs - new Date(run.startedAt).getTime())) : 0
  const progressPercent = run && durationMs > 0 ? Math.min(100, (elapsedMs / durationMs) * 100) : 0

  useEffect(() => {
    if (!run?.running) return
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [run?.running])

  useEffect(() => {
    if (!run?.running) return
    let disposed = false
    let requestPending = false

    const poll = async () => {
      if (disposed || requestPending) return
      requestPending = true
      try {
        const nextSnapshot = await fetchJson<SensorTestSnapshotPayload>("/api/outils/sensor-tests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sensorIds: run.sensorIds, startedAt: run.startedAt }),
        })
        if (!disposed) {
          setSnapshot(nextSnapshot)
          setTestError(null)
        }
      } catch (error) {
        if (!disposed) setTestError(error instanceof Error ? error.message : String(error))
      } finally {
        requestPending = false
        if (!disposed && Date.now() >= run.endsAt) {
          setNowMs(Date.now())
          setRun((current) => current ? { ...current, running: false } : current)
        }
      }
    }

    void poll()
    const interval = window.setInterval(() => { void poll() }, 3000)
    return () => {
      disposed = true
      window.clearInterval(interval)
    }
  }, [run?.endsAt, run?.running, run?.sensorIds, run?.startedAt])

  const handleToggleAll = useCallback(() => {
    if (isRunning) return
    if (selectedIds.length === sensors.length) {
      setSelectedIds([])
      return
    }
    setSelectedIds(sensors.map((sensor) => sensor.Id_Sonde))
  }, [isRunning, sensors, selectedIds.length])

  const handleToggleOne = useCallback((id: number, selected: boolean) => {
    if (isRunning) return
    if (selected) {
      setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
      return
    }
    setSelectedIds((prev) => prev.filter((item) => item !== id))
  }, [isRunning])

  const handleDeselectAll = () => {
    if (!isRunning) setSelectedIds([])
  }

  const handleReset = () => {
    if (isRunning) return
    setSelectedIds([])
    setRun(null)
    setSnapshot(null)
    setTestError(null)
    setNowMs(Date.now())
  }

  const handleLaunchTests = () => {
    if (selectedIds.length === 0 || isRunning) return
    setIsLaunchDialogOpen(true)
  }

  const handleConfirmLaunchTests = () => {
    if (selectedIds.length === 0) return
    const duration = Math.max(1, Math.min(5, Number(testDurationMinutes) || 1))
    const startedAtMs = Date.now()
    setIsLaunchDialogOpen(false)
    setSnapshot(null)
    setTestError(null)
    setNowMs(startedAtMs)
    setRun({
      startedAt: new Date(startedAtMs).toISOString(),
      endsAt: startedAtMs + duration * 60_000,
      sensorIds: [...selectedIds],
      running: true,
    })
  }

  const columns = useMemo(
    () => buildSensorColumns({
      sensors,
      selectedIds,
      selectionDisabled: isRunning,
      locale,
      onToggleAll: handleToggleAll,
      onToggleOne: handleToggleOne,
      labels: {
        headers: {
          sensor: t('table.columns.sensor'),
          location: t('table.columns.location'),
          module: t('table.columns.module'),
          signal: t('table.columns.signal'),
          attempts: t('table.columns.attempts'),
          responseRate: t('table.columns.response_rate'),
          status: t('table.columns.status'),
        },
        status: {
          idle: t('status.idle'),
          waiting: t('status.waiting'),
          success: t('status.success'),
          partial: t('status.partial'),
          failed: t('status.failed'),
          'no-data': t('status.no_data'),
        },
        aria: {
          selectAll: t('table.aria.select_all'),
          selectOne: (serial) => t('table.aria.select_one', { serial: serial || '-' }),
        },
      },
    }),
    [handleToggleAll, handleToggleOne, isRunning, locale, sensors, selectedIds, t],
  )

  return (
    <div className="space-y-6">
      <Alert className="border-sky-200 bg-sky-50/70 dark:border-sky-900 dark:bg-sky-950/30">
        <RadioTower className="h-4 w-4" />
        <AlertTitle>{t('real_test.title')}</AlertTitle>
        <AlertDescription>{t('real_test.description')}</AlertDescription>
      </Alert>

      <TestConnectionStats
        isRunning={isRunning}
        hasRun={Boolean(run)}
        progressPercent={progressPercent}
        remainingSeconds={remainingSeconds}
        globalResponseRate={snapshot?.summary.responseRate ?? null}
        receivedAttempts={snapshot?.summary.receivedAttempts ?? 0}
        totalAttempts={snapshot?.summary.totalAttempts ?? 0}
        selectedCount={selectedCountForStats}
        respondingSensorCount={respondingSensorCount}
      />

      {catalogQuery.error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('errors.catalog_title')}</AlertTitle>
          <AlertDescription>{catalogQuery.error instanceof Error ? catalogQuery.error.message : t('errors.catalog')}</AlertDescription>
        </Alert>
      ) : null}

      {testError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('errors.test_title')}</AlertTitle>
          <AlertDescription>{testError}</AlertDescription>
        </Alert>
      ) : null}

      {run && !isRunning && (snapshot?.summary.totalAttempts ?? 0) === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('real_test.no_attempt_title')}</AlertTitle>
          <AlertDescription>{t('real_test.no_attempt_description')}</AlertDescription>
        </Alert>
      ) : null}

      {run && !isRunning && (snapshot?.summary.receivedAttempts ?? 0) > 0 ? (
        <Alert className="border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30">
          <CircleCheck className="h-4 w-4" />
          <AlertTitle>{t('real_test.completed_title')}</AlertTitle>
          <AlertDescription>{t('real_test.completed_description')}</AlertDescription>
        </Alert>
      ) : null}

      <SensorsTableCard
        sensors={sensors}
        columns={columns}
        isLoading={catalogQuery.isLoading}
        isRunning={isRunning}
        selectedCount={selectedIds.length}
        onLaunchTests={handleLaunchTests}
        onToggleAll={handleToggleAll}
        onDeselectAll={handleDeselectAll}
        onReset={handleReset}
      />

      <AlertDialog open={isLaunchDialogOpen} onOpenChange={setIsLaunchDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('launch_dialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('launch_dialog.description_real', { count: selectedIds.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('launch_dialog.duration_label')}</label>
            <Select value={testDurationMinutes} onValueChange={setTestDurationMinutes}>
              <SelectTrigger>
                <SelectValue placeholder={t('launch_dialog.duration_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((minutes) => (
                  <SelectItem key={minutes} value={String(minutes)}>
                    {t('launch_dialog.duration_option', { count: minutes })}
                    {minutes === 1 ? ` - ${t('launch_dialog.recommended')}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t('launch_dialog.duration_help')}</p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>{t('launch_dialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLaunchTests}>
              {t('launch_dialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
