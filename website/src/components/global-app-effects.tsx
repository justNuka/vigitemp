"use client"

import { useEffect, useMemo, useRef } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

import { stripLocalePrefix } from "@/i18n/pathnames"
import { useRouter } from "@/i18n/navigation"
import { useCurrentUser } from "@/hooks/useCurrentUser"
function isPublicRoute(pathname: string) {
  const normalized = stripLocalePrefix(pathname)
  return normalized === "/login" || normalized === "/reset-password" || normalized === "/force-password-change"
}

export function GlobalAppEffects() {
  const t = useTranslations("globalAppEffects")
  const router = useRouter()
  const pathname = usePathname()
  const seenAlarmIdsRef = useRef<Set<number>>(new Set())
  const alarmStreamUrl = useMemo(() => "/api/alarmes/stream", [])

  const { data: currentUser } = useCurrentUser({ enabled: !isPublicRoute(pathname) })

  useEffect(() => {
    if (!currentUser) return

    const eventSource = new EventSource(alarmStreamUrl)

    const onAlarm = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as {
          id: number
          lieu: string
          type: string
          valeur: number | null
          unite: string | null
        }

        if (seenAlarmIdsRef.current.has(data.id)) return
        seenAlarmIdsRef.current.add(data.id)

        const labelType =
          data.type === "H"
            ? t("alarm.type.high")
            : data.type === "B"
              ? t("alarm.type.low")
              : t("alarm.type.default")
        const value =
          data.valeur === null
            ? t("alarm.value.na")
            : `${data.valeur}${data.unite ?? "°C"}`

        toast.error(t("alarm.toast.title", { type: labelType, lieu: data.lieu }), {
          description: t("alarm.toast.description", { value }),
          action: {
            label: t("alarm.toast.action"),
            onClick: () => router.push("/surveillance"),
          },
        })
      } catch {
        // ignore
      }
    }

    const onError = () => {
      // Stop the stream on first error to avoid auto-reconnect spamming 401s when logged out.
      eventSource.close()
    }

    eventSource.addEventListener("alarm", onAlarm)
    eventSource.addEventListener("error", onError)

    return () => {
      eventSource.removeEventListener("alarm", onAlarm)
      eventSource.removeEventListener("error", onError)
      eventSource.close()
    }
  }, [alarmStreamUrl, currentUser, router, t])

  return null
}
