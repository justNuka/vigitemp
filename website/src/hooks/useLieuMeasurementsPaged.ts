"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { fetchJson } from "@/lib/http"
import { toApiUtcDateTime } from "@/lib/date-range-api"
import type { MeasureData } from "@/lib/measurements"

type Options = {
  enabled?: boolean
  pageIndex?: number
  pageSize?: number
  startDate?: string | Date | null
  endDate?: string | Date | null
  includeNullNonResponse?: boolean
  sortBy?: "date" | "value" | null
  sortDirection?: "asc" | "desc" | null
}

type PaginatedResponse = {
  measurements: MeasureData[]
  total: number
  page: number
  pageSize: number
}

type CacheEntry = {
  data: MeasureData[]
  total: number
  pageCount: number
  cachedAt: number
}

const pageCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 60_000

function buildKey(
  idLieu: number,
  pageIndex: number,
  pageSize: number,
  startDate?: string | Date | null,
  endDate?: string | Date | null,
  includeNullNonResponse?: boolean,
  sortBy?: "date" | "value" | null,
  sortDirection?: "asc" | "desc" | null,
) {
  const start =
    startDate instanceof Date ? toApiUtcDateTime(startDate) : startDate ?? ""
  const end = endDate instanceof Date ? toApiUtcDateTime(endDate) : endDate ?? ""
  return `${idLieu}|${pageIndex}|${pageSize}|${start}|${end}|${includeNullNonResponse ? "1" : "0"}|${sortBy ?? ""}|${sortDirection ?? ""}`
}

export function useLieuMeasurementsPaged(
  idLieu: number,
  {
    enabled = true,
    pageIndex = 0,
    pageSize = 20,
    startDate,
    endDate,
    includeNullNonResponse,
    sortBy,
    sortDirection,
  }: Options = {},
) {
  const [data, setData] = useState<MeasureData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const lastKeyRef = useRef<string | null>(null)

  const key = useMemo(
    () => buildKey(idLieu, pageIndex, pageSize, startDate, endDate, includeNullNonResponse, sortBy, sortDirection),
    [idLieu, pageIndex, pageSize, startDate, endDate, includeNullNonResponse, sortBy, sortDirection],
  )

  const pageCount = useMemo(() => {
    if (!pageSize) return 0
    return Math.max(1, Math.ceil(totalRows / pageSize))
  }, [pageSize, totalRows])

  const fetchPage = useCallback(
    async (targetPageIndex: number, useCache = true) => {
      const cacheKey = buildKey(
        idLieu,
        targetPageIndex,
        pageSize,
        startDate,
        endDate,
        includeNullNonResponse,
        sortBy,
        sortDirection,
      )
      if (useCache) {
        const cached = pageCache.get(cacheKey)
        if (cached && Date.now() - cached.cachedAt <= CACHE_TTL_MS) {
          return cached
        }
        if (cached) {
          pageCache.delete(cacheKey)
        }
      }

      const params = new URLSearchParams({
        page: String(targetPageIndex + 1),
        pageSize: String(pageSize),
        source: "mesures",
      })
      if (startDate && endDate) {
        params.set(
          "startDate",
          startDate instanceof Date ? toApiUtcDateTime(startDate) : startDate,
        )
        params.set(
          "endDate",
          endDate instanceof Date ? toApiUtcDateTime(endDate) : endDate,
        )
      }
      if (typeof includeNullNonResponse === "boolean") {
        params.set("includeNullNonResponse", includeNullNonResponse ? "1" : "0")
      }
      if (sortBy) {
        params.set("sortBy", sortBy)
      }
      if (sortDirection) {
        params.set("sortDirection", sortDirection)
      }
      const payload = await fetchJson<PaginatedResponse>(
        `/api/mesures/${idLieu}?${params}`,
      )
      const nextPageCount = Math.max(
        1,
        Math.ceil((payload.total ?? 0) / pageSize),
      )
      const entry: CacheEntry = {
        data: payload.measurements ?? [],
        total: payload.total ?? 0,
        pageCount: nextPageCount,
        cachedAt: Date.now(),
      }
      pageCache.set(cacheKey, entry)
      return entry
    },
    [endDate, idLieu, pageSize, startDate, includeNullNonResponse, sortBy, sortDirection],
  )

  useEffect(() => {
    if (!enabled) return

    let isActive = true
    const run = async () => {
      setIsLoading(true)
      try {
        const entry = await fetchPage(pageIndex, true)
        if (!isActive) return
        setData(entry.data)
        setTotalRows(entry.total)
        lastKeyRef.current = key
      } catch (error) {
        console.error("Error loading measurements page:", error)
        if (!isActive) return
        setData([])
        setTotalRows(0)
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    run()

    return () => {
      isActive = false
    }
  }, [enabled, fetchPage, key, pageIndex])

  useEffect(() => {
    if (!enabled) return
    if (isLoading) return
    if (!Number.isFinite(pageCount) || pageCount <= 1) return
    if (pageIndex + 1 >= pageCount) return

    fetchPage(pageIndex + 1, true).catch(() => {})
  }, [enabled, fetchPage, isLoading, pageCount, pageIndex])

  return {
    data,
    isLoading,
    totalRows,
    pageCount,
  }
}
