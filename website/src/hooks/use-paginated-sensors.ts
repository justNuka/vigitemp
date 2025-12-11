import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import type { SensorWithLocation } from "@/lib/api";

interface PaginatedResponse {
  data: SensorWithLocation[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
    count: number;
  };
}

interface UsePaginatedSensorsProps {
  siteId: number | null;
  groupIds: number[];
  limit?: number;
  enabled?: boolean;
}

/**
 * Hook React Query pour charger les sensors avec pagination infinie
 * Utilise useInfiniteQuery pour supporter le scroll infini
 */
export function usePaginatedSensors({
  siteId,
  groupIds,
  limit = 8,
  enabled = true,
}: UsePaginatedSensorsProps) {
  const query = useInfiniteQuery<PaginatedResponse, Error>({
    queryKey: ["sensors", "paginated", siteId, groupIds],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams();
      params.append("offset", String(pageParam ?? 0));
      params.append("limit", limit.toString());

      if (siteId !== null) {
        params.append("siteId", siteId.toString());
      }

      if (groupIds.length > 0) {
        params.append("groupIds", groupIds.join(","));
      }

      const response = await axios.get<PaginatedResponse>(
        `/api/sensors/paginated?${params}`
      );
      return response.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        // Retourner le prochain offset
        return lastPage.pagination.offset + lastPage.pagination.limit;
      }
      return undefined;
    },
    enabled,
  });

  // Aplatir les pages en un seul tableau
  const flattenedData = query.data?.pages.flatMap((page: PaginatedResponse) => page.data) || [];
  const totalCount = query.data?.pages[0]?.pagination?.total || 0;
  const hasMore = query.hasNextPage || false;

  return {
    // Données
    sensors: flattenedData,
    total: totalCount,
    hasMore,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,

    // Actions
    loadMore: query.fetchNextPage,
    isLoadingMore: query.isFetchingNextPage,

    // Refetch
    refetch: query.refetch,
  };
}
