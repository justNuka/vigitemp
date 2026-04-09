import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { CurrentUser } from "@/lib/types";
import { getJson, isAuthDisconnected } from "@/lib/http";

export function useCurrentUser(options?: { enabled?: boolean }) {
  const queryClient = useQueryClient()
  const queryKey = ["me"] as const
  const cachedData = queryClient.getQueryData<CurrentUser>(queryKey)
  const enabled = (options?.enabled ?? true) && !isAuthDisconnected()

  return useQuery<CurrentUser>({
    queryKey,
    initialData: cachedData,
    queryFn: async () => {
      return getJson<CurrentUser>("/api/me");
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    enabled,
  });
}