"use client"

import { useInfiniteQuery } from "@tanstack/react-query"

import type { SensorWithLocation } from "@/lib/api"
import { getJson } from "@/lib/http"

type PaginatedResponse = {
  total: number
  page: number
  limit: number
  totalPages: number
  sensors: SensorWithLocation[]
}

export function usePaginatedSensors({ limit = 100 }: { limit?: number } = {}) {
  return useInfiniteQuery({
    queryKey: ["capteurs", "paginated", limit],
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
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

