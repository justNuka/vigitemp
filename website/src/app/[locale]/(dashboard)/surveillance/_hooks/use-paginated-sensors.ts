"use client"

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo, useRef } from "react"

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
  const queryKey = useMemo(() => [
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
  ] as const, [groupIds, limit, searchTerm, siteIds, surveillanceDisabled])
  const bypassCacheRef = useRef(false)

  const fetchPage = useCallback(
    async (page: number) => {
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
      return response
    },
    [groupIds, limit, searchTerm, siteIds, surveillanceDisabled],
  )

  const query = useInfiniteQuery({
    queryKey,
    enabled,
    queryFn: async ({ pageParam }) => fetchPage(Number(pageParam ?? 1)),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse) => {
      if (!lastPage?.page || !lastPage?.totalPages) return undefined
      return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: "always",
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
  }, [fetchPage, queryClient, queryKey])

  return {
    ...query,
    forceRefresh,
  }
}
