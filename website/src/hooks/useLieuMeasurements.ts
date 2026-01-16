"use client"

import { useCallback, useEffect, useState } from "react"

import { fetchJson } from "@/lib/http"
import type { MeasureData } from "@/lib/measurements"

type Options = {
  enabled?: boolean
  rowNumber?: number
  listenForUpdates?: boolean
}

export function useLieuMeasurements(
  idLieu: number,
  { enabled = true, rowNumber = 125, listenForUpdates = true }: Options = {},
) {
  const [data, setData] = useState<MeasureData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(
    async (forceFresh = false) => {
    setIsLoading(true)
    try {
        const params = new URLSearchParams({ rowNumber: String(rowNumber) })
        if (forceFresh) {
          params.set("fresh", "true")
        }
        const measures = await fetchJson<MeasureData[]>(`/api/mesures/${idLieu}?${params}`)
      setData(measures)
    } catch (error) {
      console.error("Error loading measurements:", error)
      setData([])
    } finally {
      setIsLoading(false)
    }
    },
    [idLieu, rowNumber],
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

    window.addEventListener("vigitemp:lieu-updated", handleUpdate)
    return () => window.removeEventListener("vigitemp:lieu-updated", handleUpdate)
  }, [idLieu, listenForUpdates, load])

  return { data, isLoading, reload: load }
}
