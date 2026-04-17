"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

type MeasurementUpdate = {
  idLieu: number
  currentValue?: number | null
  lastMeasurement?: string
  status?: "ok" | "warning" | "critical"
}

type InfiniteSensorsData = {
  pages: Array<{
    sensors?: Array<any>
    [key: string]: any
  }>
  pageParams: any[]
}

export function useSurveillanceLiveUpdates({
  enabled = true,
}: {
  enabled?: boolean
}) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) return

    const es = new EventSource("/api/surveillance/stream")

    const onMeasurement = (event: MessageEvent) => {
      let payload: MeasurementUpdate | null = null
      try {
        payload = JSON.parse(event.data) as MeasurementUpdate
      } catch {
        return
      }
      if (!payload) return

      const id = String(payload.idLieu)

      queryClient.setQueriesData({ queryKey: ["capteurs", "paginated"] }, (old: unknown) => {
        const data = old as InfiniteSensorsData | undefined
        if (!data?.pages?.length) return old

        let changed = false
        const nextPages = data.pages.map((page) => {
          const sensors = page.sensors ?? []
          const nextSensors = sensors.map((s) => {
            if (!s || s.id !== id) return s
            changed = true
            return {
              ...s,
              currentValue: payload.currentValue ?? s.currentValue,
              lastMeasurement: payload.lastMeasurement ? new Date(payload.lastMeasurement) : s.lastMeasurement,
              status: payload.status ?? s.status,
            }
          })

          return nextSensors === sensors ? page : { ...page, sensors: nextSensors }
        })

        if (!changed) return old
        return { ...data, pages: nextPages }
      })
    }

    const close = () => {
      try {
        es.close()
      } catch {
        // ignore
      }
    }

    es.addEventListener("measurement", onMeasurement as any)
    es.addEventListener("error", close)

    return () => {
      es.removeEventListener("measurement", onMeasurement as any)
      es.removeEventListener("error", close)
      close()
    }
  }, [enabled, queryClient])
}

