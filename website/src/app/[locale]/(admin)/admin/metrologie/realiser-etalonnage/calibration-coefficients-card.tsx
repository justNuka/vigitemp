"use client"

import { useMemo, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { AdjustmentSensorRow } from "@/hooks/useAdjustmentSensors"
import { fetchJson } from "@/lib/http"

type CoefficientKey = "a" | "b" | "c"
type CoefficientDraft = { a: string; b: string; c: string }
type CoefficientUpdate = {
  sensorId: number
  coeffA: number
  coeffB: number
  coeffC: number
}

type Props = {
  sensors: AdjustmentSensorRow[]
  readingActive: boolean
  operator: string
  standardId: string
  mediumId: string
}

function formatCoefficientDisplay(value: unknown) {
  if (value === null || value === undefined || value === "") return ""
  const parsed = typeof value === "number" ? value : Number(String(value).replace(",", "."))
  if (!Number.isFinite(parsed)) return String(value)
  return parsed.toFixed(3)
}

function parseCoefficient(value: string | undefined) {
  const normalized = value?.trim().replace(",", ".") ?? ""
  return normalized.length > 0 ? Number(normalized) : Number.NaN
}

export function CalibrationCoefficientsCard({
  sensors,
  readingActive,
  operator,
  standardId,
  mediumId,
}: Props) {
  const t = useTranslations("metrologyAdmin.calibrationPage.workflow.enhanced")
  const tAdjustment = useTranslations("metrologyAdmin.adjustmentPage")
  const queryClient = useQueryClient()
  const [drafts, setDrafts] = useState<Record<number, Partial<CoefficientDraft>>>({})
  const [touched, setTouched] = useState<Record<number, Partial<Record<CoefficientKey, boolean>>>>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const changedSensorIds = useMemo(
    () => Object.entries(touched)
      .filter(([, values]) => Boolean(values.a || values.b || values.c))
      .map(([sensorId]) => Number(sensorId)),
    [touched],
  )
  const hasChanges = changedSensorIds.length > 0

  const updateMutation = useMutation({
    mutationFn: (coefficients: CoefficientUpdate[]) =>
      fetchJson<{ coefficients: CoefficientUpdate[]; message: string }>(
        "/api/metrologie/etalonnage/coefficients",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            operator,
            standardId: Number(standardId),
            mediumId: Number(mediumId),
            coefficients,
          }),
        },
      ),
    onSuccess: async (data) => {
      const updateById = new Map(data.coefficients.map((item) => [item.sensorId, item]))
      queryClient.setQueryData<AdjustmentSensorRow[]>(["metrology-adjustment-sensors"], (current) =>
        current?.map((sensor) => {
          const update = updateById.get(sensor.id)
          return update
            ? { ...sensor, coeffA: update.coeffA, coeffB: update.coeffB, coeffC: update.coeffC }
            : sensor
        }),
      )
      setDrafts({})
      setTouched({})
      setSuccessMessage(t("coefficients_saved"))
      await queryClient.invalidateQueries({ queryKey: ["metrology-adjustment-sensors"] })
    },
    onError: () => setSuccessMessage(null),
  })

  const handleValidate = () => {
    setSuccessMessage(null)
    const changedIds = new Set(changedSensorIds)
    const coefficients = sensors
      .filter((sensor) => changedIds.has(sensor.id))
      .map((sensor) => {
        const sensorDraft = drafts[sensor.id] ?? {}
        const sensorTouched = touched[sensor.id] ?? {}
        return {
          sensorId: sensor.id,
          coeffA: sensorTouched.a ? parseCoefficient(sensorDraft.a) : sensor.coeffA ?? 1,
          coeffB: sensorTouched.b ? parseCoefficient(sensorDraft.b) : sensor.coeffB ?? 0,
          coeffC: sensorTouched.c ? parseCoefficient(sensorDraft.c) : sensor.coeffC ?? 0,
        }
      })

    if (
      coefficients.length === 0 ||
      coefficients.some(
        (item) =>
          !Number.isFinite(item.coeffA) ||
          !Number.isFinite(item.coeffB) ||
          !Number.isFinite(item.coeffC) ||
          (Math.abs(item.coeffC) > 1e-12 && Math.abs(item.coeffA) <= 1e-12),
      )
    ) {
      return
    }

    updateMutation.mutate(coefficients)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("coefficients_title")}</CardTitle>
        <CardDescription>{t("coefficients_description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!readingActive ? (
          <Alert>
            <AlertDescription>{t("coefficients_reading_required")}</AlertDescription>
          </Alert>
        ) : null}

        {successMessage ? (
          <Alert className="border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        ) : null}

        {updateMutation.error ? (
          <Alert variant="destructive">
            <AlertDescription>
              {updateMutation.error instanceof Error
                ? updateMutation.error.message
                : tAdjustment("adjustment.cards.coefficients.invalid")}
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="overflow-x-auto">
          <div className="min-w-[620px] space-y-3">
            <div className="grid grid-cols-[minmax(180px,1fr)_repeat(3,minmax(110px,0.5fr))] gap-3 text-sm font-medium text-muted-foreground">
              <span>{tAdjustment("adjustment.cards.coefficients.sensor")}</span>
              <span>{tAdjustment("adjustment.cards.coefficients.coeffA")}</span>
              <span>{tAdjustment("adjustment.cards.coefficients.coeffB")}</span>
              <span>{tAdjustment("adjustment.cards.coefficients.coeffC")}</span>
            </div>

            {sensors.map((sensor) => {
              const sensorDraft = drafts[sensor.id] ?? {}
              const sensorTouched = touched[sensor.id] ?? {}
              const values: CoefficientDraft = {
                a: sensorTouched.a ? sensorDraft.a ?? "" : formatCoefficientDisplay(sensor.coeffA),
                b: sensorTouched.b ? sensorDraft.b ?? "" : formatCoefficientDisplay(sensor.coeffB),
                c: sensorTouched.c ? sensorDraft.c ?? "" : formatCoefficientDisplay(sensor.coeffC),
              }

              return (
                <div
                  key={sensor.id}
                  className="grid grid-cols-[minmax(180px,1fr)_repeat(3,minmax(110px,0.5fr))] items-center gap-3"
                >
                  <div>
                    <p className="font-medium">{sensor.serialNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {sensor.locationName ?? tAdjustment("adjustment.cards.coefficients.noLocation")}
                    </p>
                  </div>

                  {(["a", "b", "c"] as const).map((coefficient) => (
                    <Input
                      key={coefficient}
                      inputMode="decimal"
                      aria-label={`${sensor.serialNumber} ${coefficient}`}
                      value={values[coefficient]}
                      readOnly={!readingActive}
                      disabled={updateMutation.isPending}
                      onChange={(event) => {
                        if (!readingActive) return
                        const value = event.target.value
                        setSuccessMessage(null)
                        setDrafts((current) => ({
                          ...current,
                          [sensor.id]: {
                            ...current[sensor.id],
                            [coefficient]: value,
                          },
                        }))
                        setTouched((current) => ({
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

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{t("coefficients_apply_on_start")}</p>
          <Button
            type="button"
            disabled={
              !readingActive ||
              !hasChanges ||
              !standardId ||
              !mediumId ||
              updateMutation.isPending
            }
            onClick={handleValidate}
          >
            {updateMutation.isPending
              ? tAdjustment("adjustment.cards.coefficients.saving")
              : tAdjustment("adjustment.cards.coefficients.validate")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
