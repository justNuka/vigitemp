"use client"

import { useEffect, useMemo, useRef } from "react"
import { usePathname } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

import { stripLocalePrefix } from "@/i18n/pathnames"
import { useRouter } from "@/i18n/navigation"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import {
  API_ERROR_EVENT,
  AUTH_STATE_EVENT,
  setAuthDisconnected,
  type ApiErrorEventDetail,
  type AuthStateEventDetail,
} from "@/lib/http"
import { markDisconnectReason } from "@/lib/auth-disconnect-marker"

function isPublicRoute(pathname: string) {
  const normalized = stripLocalePrefix(pathname)
  return normalized === "/login" || normalized === "/connexion" || normalized === "/reset-password" || normalized === "/reinitialisation-mot-de-passe" || normalized === "/force-password-change" || normalized === "/changement-mot-de-passe-obligatoire"
}

export function GlobalAppEffects() {
  const t = useTranslations("globalAppEffects")
  const tSessionExpired = useTranslations("login.toasts.session_expired")
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const seenAlarmIdsRef = useRef<Set<number>>(new Set())
  const hasSessionToastRef = useRef(false)
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
            : `${data.valeur}${data.unite ?? "\u00b0C"}`

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
      // Close the stream on error; do not force global disconnect here because
      // EventSource does not expose HTTP status (can be transient network/server hiccup).
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

  useEffect(() => {
    const onApiError = (event: Event) => {
      const customEvent = event as CustomEvent<ApiErrorEventDetail>
      const detail = customEvent.detail
      if (!detail) return

      const baseMessage = detail.message || t("errors.default")
      const description = detail.errorId
        ? t("errors.with_id", { message: baseMessage, id: detail.errorId })
        : baseMessage

      toast.error(t("errors.title"), {
        description,
      })
    }

    const onAuthState = (event: Event) => {
      const customEvent = event as CustomEvent<AuthStateEventDetail>
      const detail = customEvent.detail
      if (!detail?.disconnected) return
      const reason = detail.reason ?? "unauthorized"

      queryClient.cancelQueries()
      queryClient.clear()
      seenAlarmIdsRef.current.clear()

      const shouldShowSessionExpiredToast =
        reason === "auto_logout" || reason === "unauthorized" || reason === "stream_unauthorized"

      if (shouldShowSessionExpiredToast && !hasSessionToastRef.current) {
        hasSessionToastRef.current = true
        toast.warning(tSessionExpired("title"), { description: tSessionExpired("description") })
      }

      if (!isPublicRoute(pathname)) {
        if (shouldShowSessionExpiredToast) {
          markDisconnectReason("inactivity")
        }
        if (shouldShowSessionExpiredToast) {
          router.push({ pathname: "/login", query: { reason: "inactivity" } } as any)
        } else {
          router.push("/login")
        }
      }
    }

    window.addEventListener(API_ERROR_EVENT, onApiError as EventListener)
    window.addEventListener(AUTH_STATE_EVENT, onAuthState as EventListener)

    return () => {
      window.removeEventListener(API_ERROR_EVENT, onApiError as EventListener)
      window.removeEventListener(AUTH_STATE_EVENT, onAuthState as EventListener)
    }
  }, [pathname, queryClient, router, t])

  return null
}
