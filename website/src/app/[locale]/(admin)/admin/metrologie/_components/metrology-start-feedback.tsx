"use client"

import { AlertTriangle, LoaderCircle } from "lucide-react"
import { useTranslations } from "next-intl"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { HttpError } from "@/lib/http"

type SensorIdentity = {
  serialNumber: string
  isGso: boolean
}

type Props = {
  error: unknown
  isPending?: boolean
  sensors: readonly SensorIdentity[]
}

function resolveSerial(error: unknown) {
  if (error instanceof HttpError && typeof error.payload?.serial === "string") {
    const serial = error.payload.serial.trim()
    if (serial) return serial
  }

  const message = error instanceof Error ? error.message : String(error ?? "")
  const match = /(?:SP[A-Z0-9]{2}-\d+|SO[A-Z0-9]{2}-\d+(?:-[TH])?)/i.exec(message)
  return match?.[0]?.toUpperCase() ?? null
}

export function MetrologyStartFeedback({ error, isPending = false, sensors }: Props) {
  const t = useTranslations("metrologyAdmin.startFailure")

  if (isPending) {
    return (
      <Alert className="border-sky-300 bg-sky-50 text-sky-950 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-100">
        <LoaderCircle className="h-4 w-4 animate-spin text-sky-700 dark:text-sky-300" />
        <AlertTitle>{t("pendingTitle")}</AlertTitle>
        <AlertDescription>{t("pendingDescription")}</AlertDescription>
      </Alert>
    )
  }

  if (!error) return null

  const message = error instanceof Error ? error.message : String(error)
  const serial = resolveSerial(error)
  const matchingSensor = serial
    ? sensors.find((sensor) => sensor.serialNumber.trim().toUpperCase() === serial)
    : null
  const errorCode = error instanceof HttpError ? error.payload?.error : null
  const isKnownGspFailure = errorCode === "gsp_sensor_unreachable"
  const isGso = matchingSensor?.isGso ?? (serial?.startsWith("SO") ?? false)
  const showGspHelp = isKnownGspFailure || (serial ? !isGso : true)
  const showGsoHelp = serial ? isGso : !isKnownGspFailure

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{t("title")}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{message}</p>
        {serial ? (
          <p className="font-medium">
            {t("sensor", { serial })}
          </p>
        ) : null}
        <div className="space-y-2 rounded-md border border-destructive/30 bg-background/60 p-3 text-sm text-foreground">
          <p className="font-medium">{t("checksTitle")}</p>
          {showGspHelp ? <p><strong>{t("gspLabel")}</strong> {t("gspHelp")}</p> : null}
          {showGsoHelp ? <p><strong>{t("gsoLabel")}</strong> {t("gsoHelp")}</p> : null}
        </div>
      </AlertDescription>
    </Alert>
  )
}
