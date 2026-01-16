"use client"

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"

import type { SensorWithLocation } from "@/lib/api"
import { getJson } from "@/lib/http"

type PaginatedResponse = {
  total: number
  page: number
  limit: number
  totalPages: number
  sensors: SensorWithLocation[]
}

export function usePaginatedSensors({
  limit = 100,
  enabled = true,
}: { limit?: number; enabled?: boolean } = {}) {
  const queryClient = useQueryClient()
  const queryKey = ["capteurs", "paginated", limit] as const

  // Hardening: when the page subtree is re-rendered/remounted by App Router, avoid re-fetching
  // the heavy paginated list if we already have it in React Query cache.
  const hasCachedData = queryClient.getQueryData(queryKey) !== undefined
  const effectiveEnabled = enabled && !hasCachedData

  return useInfiniteQuery({
    queryKey,
    enabled: effectiveEnabled,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        page: String(pageParam ?? 1),
        limit: String(limit),
      })
      return getJson<PaginatedResponse>(`/api/capteurs/paginated?${params}`)
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse) => {
      if (!lastPage?.page || !lastPage?.totalPages) return undefined
      return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined
    },
    // Important: éviter de refetch toutes les pages à chaque retour sur /surveillance.
    // On privilégie le cache + des mises à jour ciblées (SSE / delta) plutôt qu'un refetch global.
    staleTime: 30 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    refetchOnMount: "stale",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    retry: false,
  })
}
