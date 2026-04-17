"use client"

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useRef } from "react"

import type { SensorWithLocation } from "@/lib/api"
import { getJson } from "@/lib/http"

export type PaginatedResponse = {
  total: number
  page: number
  limit: number
  totalPages: number
  sensors: SensorWithLocation[]
}

type Filters = {
  siteIds?: number[]
  groupIds?: number[]
  surveillanceDisabled?: boolean
}

export const paginatedSensorsPageKey = (
  limit: number,
  page: number,
  { siteIds = [], groupIds = [], surveillanceDisabled }: Filters = {},
) =>
  [
    "capteurs",
    "paginated",
    limit,
    "sites",
    siteIds.join(","),
    "groups",
    groupIds.join(","),
    "surveillanceDisabled",
    surveillanceDisabled === undefined ? "all" : surveillanceDisabled ? "1" : "0",
    "page",
    page,
  ] as const

export function usePaginatedSensors({
  limit = 100,
  enabled = true,
  siteIds = [],
  groupIds = [],
  surveillanceDisabled,
}: { limit?: number; enabled?: boolean } & Filters = {}) {
  const queryClient = useQueryClient()
  const queryKey = [
    "capteurs",
    "paginated",
    limit,
    "sites",
    siteIds.join(","),
    "groups",
    groupIds.join(","),
    "surveillanceDisabled",
    surveillanceDisabled === undefined ? "all" : surveillanceDisabled ? "1" : "0",
  ] as const
  const bypassCacheRef = useRef(false)

  // Hardening: when the page subtree is re-rendered/remounted by App Router, avoid re-fetching
  // the heavy paginated list if we already have it in React Query cache.
  const hasCachedData = queryClient.getQueryData(queryKey) !== undefined
  const effectiveEnabled = enabled && !hasCachedData

  const query = useInfiniteQuery({
    queryKey,
    enabled: effectiveEnabled,
    queryFn: async ({ pageParam }) => {
      const page = Number(pageParam ?? 1)
      if (!bypassCacheRef.current) {
        const cached = queryClient.getQueryData<PaginatedResponse>(
          paginatedSensorsPageKey(limit, page, { siteIds, groupIds, surveillanceDisabled }),
        )
        if (cached) return cached
      }

      // Fire-and-forget: trigger snooze reactivation on first page load only.
      // This replaces the side-effect that was previously embedded in the GET handler.
      if (page === 1) {
        fetch("/api/capteurs/reactivate", { method: "POST" }).catch(() => undefined)
      }

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (siteIds.length > 0) {
        params.set("siteIds", siteIds.join(","))
      }
      if (groupIds.length > 0) {
        params.set("groupIds", groupIds.join(","))
      }
      if (typeof surveillanceDisabled === "boolean") {
        params.set("surveillanceDisabled", surveillanceDisabled ? "1" : "0")
      }
      if (bypassCacheRef.current) {
        params.set("fresh", "true")
      }

      const response = await getJson<PaginatedResponse>(`/api/capteurs/paginated?${params}`)
      queryClient.setQueryData(paginatedSensorsPageKey(limit, page, { siteIds, groupIds, surveillanceDisabled }), response)
      return response
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse) => {
      if (!lastPage?.page || !lastPage?.totalPages) return undefined
      return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined
    },
    // Important: eviter de refetch toutes les pages a chaque retour sur /surveillance.
    // On privilegie le cache + des mises a jour ciblees (SSE / delta) plutot qu'un refetch global.
    staleTime: 30 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    retry: false,
  })
  const { refetch } = query

  const forceRefresh = useCallback(async () => {
    bypassCacheRef.current = true
    try {
      await queryClient.removeQueries({
        queryKey: [
          "capteurs",
          "paginated",
          limit,
          "sites",
          siteIds.join(","),
          "groups",
          groupIds.join(","),
          "surveillanceDisabled",
          surveillanceDisabled === undefined ? "all" : surveillanceDisabled ? "1" : "0",
          "page",
        ],
      })
      await refetch()
    } finally {
      bypassCacheRef.current = false
    }
  }, [groupIds, limit, queryClient, refetch, siteIds, surveillanceDisabled])

  return {
    ...query,
    forceRefresh,
  }
}
