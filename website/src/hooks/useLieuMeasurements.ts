"use client"

import { useCallback, useEffect, useState } from "react"

import { fetchJson } from "@/lib/http"
import type { MeasureData } from "@/lib/measurements"

type Options = {
  enabled?: boolean
  rowNumber?: number
}

export function useLieuMeasurements(idLieu: number, { enabled = true, rowNumber = 125 }: Options = {}) {
  const [data, setData] = useState<MeasureData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const measures = await fetchJson<MeasureData[]>(`/api/mesures/${idLieu}?rowNumber=${rowNumber}`)
      setData(measures)
    } catch (error) {
      console.error("Error loading measurements:", error)
      setData([])
    } finally {
      setIsLoading(false)
    }
  }, [idLieu, rowNumber])

  useEffect(() => {
    if (!enabled) return
    load()
  }, [enabled, load])

  return { data, isLoading, reload: load }
}

