"use client"

import { useCallback, useEffect, useState } from "react"

import { fetchJson } from "@/lib/http"
import { toApiUtcDateTime } from "@/lib/date-range-api"
import type { MeasureData } from "@/lib/measurements"

type Options = {
  enabled?: boolean
  rowNumber?: number
  startDate?: string | Date | null
  endDate?: string | Date | null
  listenForUpdates?: boolean
  includeMeta?: boolean
  source?: "graphique" | "mesures"
  includeNullNonResponse?: boolean
  rollingHours?: number
  graphMaxPoints?: number
}

export function useLieuMeasurements(
  idLieu: number,
  {
    enabled = true,
    rowNumber = 125,
    startDate,
    endDate,
    listenForUpdates = true,
    includeMeta = false,
    source = "graphique",
    includeNullNonResponse,
    rollingHours,
    graphMaxPoints,
  }: Options = {},
) {
  const [data, setData] = useState<MeasureData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [meta, setMeta] = useState<{
    lieuType?: string | null
    graphMeasureCount?: number
    graphSourceCount?: number
    graphSampled?: boolean
    graphRangeStart?: string | null
    graphRangeEnd?: string | null
  } | null>(null)

  const load = useCallback(
    async (forceFresh = false) => {
    setIsLoading(true)
    try {
        const params = new URLSearchParams({ rowNumber: String(rowNumber) })
        if (rollingHours && rollingHours > 0) {
          const rollingEnd = new Date()
          const rollingStart = new Date(rollingEnd.getTime() - rollingHours * 60 * 60 * 1000)
          params.set("startDate", toApiUtcDateTime(rollingStart))
          params.set("endDate", toApiUtcDateTime(rollingEnd))
        } else if (startDate && endDate) {
          params.set("startDate", startDate instanceof Date ? toApiUtcDateTime(startDate) : startDate)
          params.set("endDate", endDate instanceof Date ? toApiUtcDateTime(endDate) : endDate)
        }
        if (graphMaxPoints && graphMaxPoints > 0) {
          params.set("graphMaxPoints", String(graphMaxPoints))
        }
        if (forceFresh) {
          params.set("fresh", "true")
        }
        if (includeMeta) {
          params.set("includeMeta", "true")
        }
        if (source !== "graphique") {
          params.set("source", source)
        }
        if (typeof includeNullNonResponse === "boolean") {
          params.set("includeNullNonResponse", includeNullNonResponse ? "1" : "0")
        }
        const payload = await fetchJson<
          MeasureData[] | {
            measurements?: MeasureData[]
            lieuType?: string | null
            graphMeasureCount?: number
            graphSourceCount?: number
            graphSampled?: boolean
            graphRangeStart?: string | null
            graphRangeEnd?: string | null
          }
        >(`/api/mesures/${idLieu}?${params}`)
        if (Array.isArray(payload)) {
          setData(payload)
          setMeta(null)
        } else {
          setData(payload.measurements ?? [])
          setMeta({
            lieuType: payload.lieuType ?? null,
            graphMeasureCount:
              typeof payload.graphMeasureCount === "number" ? payload.graphMeasureCount : undefined,
            graphSourceCount:
              typeof payload.graphSourceCount === "number" ? payload.graphSourceCount : undefined,
            graphSampled: Boolean(payload.graphSampled),
            graphRangeStart: payload.graphRangeStart ?? null,
            graphRangeEnd: payload.graphRangeEnd ?? null,
          })
        }
    } catch (error) {
      console.error("Error loading measurements:", error)
      setData([])
      setMeta(null)
    } finally {
      setIsLoading(false)
    }
    },
    [idLieu, rowNumber, includeMeta, startDate, endDate, source, includeNullNonResponse, rollingHours, graphMaxPoints],
  )

  useEffect(() => {
    if (!enabled) return
    load()
  }, [enabled, load])

  useEffect(() => {
    if (!listenForUpdates) return

    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ idLieu?: number }>).detail
      if (!detail?.idLieu || detail.idLieu !== idLieu) return
      load(true)
    }

    const handleRefreshAll = () => {
      load(true)
    }

    window.addEventListener("vigitemp:lieu-updated", handleUpdate)
    window.addEventListener("vigitemp:measurements-refresh", handleRefreshAll)
    return () => {
      window.removeEventListener("vigitemp:lieu-updated", handleUpdate)
      window.removeEventListener("vigitemp:measurements-refresh", handleRefreshAll)
    }
  }, [idLieu, listenForUpdates, load])

  return { data, isLoading, reload: load, meta }
}
