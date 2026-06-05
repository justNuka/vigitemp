import { getJson } from '@/lib/http'
import type { SensorWithLocation } from '@/lib/api'

export type PaginatedSensorsData = {
  pages: Array<{
    sensors: SensorWithLocation[]
    [key: string]: unknown
  }>
  pageParams: unknown[]
}

export function updateSurveillanceStateInCache(
  data: PaginatedSensorsData | undefined,
  ids: number[],
  updater: (sensor: SensorWithLocation) => SensorWithLocation,
) {
  if (!data) return data
  const idSet = new Set(ids.map(String))
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      sensors: (page.sensors ?? []).map((sensor) => {
        const locationId = String(sensor.location.id ?? sensor.id)
        return idSet.has(locationId) ? updater(sensor) : sensor
      }),
    })),
  }
}

export async function prefetchNextSensorsPage(
  queryClient: { prefetchQuery: (args: { queryKey: readonly unknown[]; queryFn: () => Promise<unknown>; staleTime: number }) => void },
  page: number,
  limit: number,
  keyBuilder: (
    limit: number,
    page: number,
    filters?: {
      siteIds?: number[]
      groupIds?: number[]
      surveillanceDisabled?: boolean
    },
  ) => readonly unknown[],
  filters?: {
    siteIds?: number[]
    groupIds?: number[]
    surveillanceDisabled?: boolean
  },
) {
  queryClient.prefetchQuery({
    queryKey: keyBuilder(limit, page, filters),
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (filters?.siteIds?.length) {
        params.set("siteIds", filters.siteIds.join(","))
      }
      if (filters?.groupIds?.length) {
        params.set("groupIds", filters.groupIds.join(","))
      }
      if (typeof filters?.surveillanceDisabled === "boolean") {
        params.set("surveillanceDisabled", filters.surveillanceDisabled ? "1" : "0")
      }
      return getJson(`/api/capteurs/paginated?${params}`)
    },
    staleTime: 30 * 60 * 1000,
  })
}
