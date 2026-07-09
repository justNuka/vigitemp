"use client"

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useRef } from "react"

import type { SensorWithLocation } from "@/lib/api"
import type { SurveillanceTreeSiteCounter } from "@/lib/api"
import { getJson } from "@/lib/http"

export type PaginatedResponse = {
  total: number
  page: number
  limit: number
  totalPages: number
  sensors: SensorWithLocation[]
  treeCounters?: SurveillanceTreeSiteCounter[]
}

type Filters = {
  siteIds?: number[]
  groupIds?: number[]
  surveillanceDisabled?: boolean
  searchTerm?: string
}

export const paginatedSensorsPageKey = (
  limit: number,
  page: number,
  { siteIds = [], groupIds = [], surveillanceDisabled, searchTerm = "" }: Filters = {},
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
    "search",
    searchTerm.trim().toLocaleLowerCase("fr"),
    "page",
    page,
  ] as const

export function usePaginatedSensors({
  limit = 100,
  enabled = true,
  siteIds = [],
  groupIds = [],
  surveillanceDisabled,
  searchTerm = "",
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
    "search",
    searchTerm.trim().toLocaleLowerCase("fr"),
  ] as const
  const bypassCacheRef = useRef(false)

  const fetchPage = useCallback(
    async (page: number) => {
      if (!bypassCacheRef.current) {
        const cached = queryClient.getQueryData<PaginatedResponse>(
          paginatedSensorsPageKey(limit, page, { siteIds, groupIds, surveillanceDisabled, searchTerm }),
        )
        if (cached) return cached
      }

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
      if (searchTerm.trim().length > 0) {
        params.set("searchTerm", searchTerm.trim())
      }
      if (bypassCacheRef.current) {
        params.set("fresh", "true")
      }

      const response = await getJson<PaginatedResponse>(`/api/capteurs/paginated?${params}`)
      queryClient.setQueryData(
        paginatedSensorsPageKey(limit, page, { siteIds, groupIds, surveillanceDisabled, searchTerm }),
        response,
      )
      return response
    },
    [groupIds, limit, queryClient, searchTerm, siteIds, surveillanceDisabled],
  )

  // Hardening: when the page subtree is re-rendered/remounted by App Router, avoid re-fetching
  // the heavy paginated list if we already have it in React Query cache.
  const hasCachedData = queryClient.getQueryData(queryKey) !== undefined
  const effectiveEnabled = enabled && !hasCachedData

  const query = useInfiniteQuery({
    queryKey,
    enabled: effectiveEnabled,
    queryFn: async ({ pageParam }) => fetchPage(Number(pageParam ?? 1)),
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
  const forceRefresh = useCallback(async (options?: { fetchAllPages?: boolean; pagesToFetch?: number }) => {
    bypassCacheRef.current = true
    try {
      const fetchAllPages = options?.fetchAllPages === true
      const explicitPagesToFetch = Number.isFinite(options?.pagesToFetch)
        ? Math.max(Number(options?.pagesToFetch), 1)
        : null
      const currentData = queryClient.getQueryData<{
        pages?: PaginatedResponse[]
        pageParams?: unknown[]
      }>(queryKey)
      const loadedPagesCount = Math.max(currentData?.pages?.length ?? 1, 1)

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
          "search",
          searchTerm.trim().toLocaleLowerCase("fr"),
          "page",
        ],
      })
      const firstPage = await fetchPage(1)
      const totalPagesToFetch = fetchAllPages
        ? Math.max(firstPage?.totalPages ?? 1, 1)
        : explicitPagesToFetch ?? loadedPagesCount
      const pages =
        totalPagesToFetch <= 1
          ? [firstPage]
          : [
              firstPage,
              ...(await Promise.all(
                Array.from({ length: totalPagesToFetch - 1 }, (_, index) => fetchPage(index + 2)),
              )),
            ]
      queryClient.setQueryData(queryKey, {
        pages,
        pageParams: pages.map((page) => page.page),
      })
    } finally {
      bypassCacheRef.current = false
    }
  }, [fetchPage, groupIds, limit, queryClient, queryKey, searchTerm, siteIds, surveillanceDisabled])

  return {
    ...query,
    forceRefresh,
  }
}
