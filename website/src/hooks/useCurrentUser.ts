import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { CurrentUser } from "@/lib/types";
import { getJson } from "@/lib/http";

export function useCurrentUser(options?: { enabled?: boolean }) {
  const queryClient = useQueryClient()
  const queryKey = ["me"] as const
  const hasCachedData = queryClient.getQueryData(queryKey) !== undefined
  const enabled = (options?.enabled ?? true) && !hasCachedData

  return useQuery<CurrentUser>({
    queryKey,
    queryFn: async () => {
      return getJson<CurrentUser>("/api/me");
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    enabled,
  });
}
