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
      sensors: (page.sensors ?? []).map((sensor) => (idSet.has(sensor.id) ? updater(sensor) : sensor)),
    })),
  }
}

export async function prefetchNextSensorsPage(
  queryClient: { prefetchQuery: (args: { queryKey: readonly unknown[]; queryFn: () => Promise<unknown>; staleTime: number }) => void },
  page: number,
  limit: number,
  keyBuilder: (limit: number, page: number) => readonly unknown[],
) {
  queryClient.prefetchQuery({
    queryKey: keyBuilder(limit, page),
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      return getJson(`/api/capteurs/paginated?${params}`)
    },
    staleTime: 30 * 60 * 1000,
  })
}
