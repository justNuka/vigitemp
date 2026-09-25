"use client"

import { useQuery } from "@tanstack/react-query"
import { CheckCircle2, LoaderCircle } from "lucide-react"
import { useTranslations } from "next-intl"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getJson } from "@/lib/http"

type SensorIdentity = {
  id: number
  serialNumber: string
  isGso: boolean
}

type GsoStatusPayload = {
  statuses: Array<{
    sensorId: number
    serialNumber: string
    metrologyInProgress: boolean
    commandSent: boolean
  }>
}

export function MetrologyGsoCommandFeedback({ sensors }: { sensors: readonly SensorIdentity[] }) {
  const t = useTranslations("metrologyAdmin.startFailure")
  const gsoIds = sensors.filter((sensor) => sensor.isGso).map((sensor) => sensor.id)
  const query = useQuery({
    queryKey: ["metrology-gso-command-status", gsoIds],
    queryFn: () => getJson<GsoStatusPayload>(`/api/metrologie/gso-command-status?ids=${gsoIds.join(",")}`),
    enabled: gsoIds.length > 0,
    refetchInterval: gsoIds.length > 0 ? 2_000 : false,
    refetchIntervalInBackground: false,
  })

  const active = query.data?.statuses.filter((status) => status.metrologyInProgress) ?? []
  if (active.length === 0) return null

  const pending = active.filter((status) => !status.commandSent)
  const serials = (pending.length > 0 ? pending : active).map((status) => status.serialNumber).join(", ")

  if (pending.length > 0) {
    return (
      <Alert className="border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        <AlertTitle>{t("gsoCommandPendingTitle")}</AlertTitle>
        <AlertDescription>{t("gsoCommandPendingDescription", { serials })}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100">
      <CheckCircle2 className="h-4 w-4" />
      <AlertTitle>{t("gsoCommandSentTitle")}</AlertTitle>
      <AlertDescription>{t("gsoCommandSentDescription", { serials })}</AlertDescription>
    </Alert>
  )
}
