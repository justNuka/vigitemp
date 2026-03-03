import { useEffect, useState } from "react"

import type { AuditLog } from "./types"

export function useMonitoringAuditLogs(
  idLieu: number,
  options: {
    enabled: boolean
    errorMessage: string
  },
) {
  const { enabled, errorMessage } = options
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!enabled || isLoaded) return

    const controller = new AbortController()

    const loadAudit = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/lieux/${idLieu}/audit?limit=200`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(errorMessage)
        }

        const payload = await response.json()
        if (!payload?.ok) {
          throw new Error(payload?.message || errorMessage)
        }

        const nextLogs = Array.isArray(payload?.data?.logs) ? (payload.data.logs as AuditLog[]) : []
        setLogs(nextLogs)
        setIsLoaded(true)
      } catch (nextError) {
        if ((nextError as Error)?.name === "AbortError") return
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    void loadAudit()
    return () => controller.abort()
  }, [enabled, errorMessage, idLieu, isLoaded])

  const reset = () => {
    setLogs([])
    setError(null)
    setIsLoaded(false)
  }

  return { logs, isLoading, error, isLoaded, reset }
}
