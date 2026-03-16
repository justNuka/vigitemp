import { useEffect, useState } from "react"

import { fetchJson } from "@/lib/http"
import { toApiUtcDateTime } from "@/lib/date-range-api"
import type { MeasureData } from "@/lib/measurements"
import { sortMeasuresChronologically } from "@/lib/measurements"

export function useMonitoringRangeMeasurements(
  idLieu: number,
  options: {
    enabled: boolean
    rangeStart: Date | null
    rangeEnd: Date | null
    includeNullNonResponse: boolean
  },
) {
  const { enabled, rangeStart, rangeEnd, includeNullNonResponse } = options
  const [data, setData] = useState<MeasureData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!enabled || !rangeStart || !rangeEnd) {
      setData([])
      setIsLoading(false)
      return
    }

    let isActive = true
    const controller = new AbortController()

    const loadAllMeasures = async () => {
      setIsLoading(true)
      try {
        const all: MeasureData[] = []
        const pageSize = 500
        let page = 1
        let total = 0

        do {
          const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
            source: "mesures",
            startDate: toApiUtcDateTime(rangeStart),
            endDate: toApiUtcDateTime(rangeEnd),
            includeNullNonResponse: includeNullNonResponse ? "1" : "0",
          })

          const payload = await fetchJson<{
            measurements: MeasureData[]
            total: number
          }>(`/api/mesures/${idLieu}?${params}`, { signal: controller.signal })

          if (!isActive) return

          if (Array.isArray(payload?.measurements)) {
            all.push(...payload.measurements)
          }

          total = payload?.total ?? all.length
          page += 1
        } while (all.length < total)

        if (!isActive) return
        setData(sortMeasuresChronologically(all))
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return
        console.error("Erreur chargement mesures (range):", error)
        if (!isActive) return
        setData([])
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    void loadAllMeasures()
    return () => {
      isActive = false
      controller.abort()
    }
  }, [enabled, idLieu, includeNullNonResponse, rangeEnd, rangeStart])

  return { data, isLoading }
}
