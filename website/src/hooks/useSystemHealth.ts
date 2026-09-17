import { useQuery } from "@tanstack/react-query"

import { getJson, isUnauthorizedError } from "@/lib/http"
import type { SystemHealthSnapshot } from "@/types/system-health"

export function useSystemHealth() {
  return useQuery({
    queryKey: ["admin", "system-health"],
    queryFn: () => getJson<SystemHealthSnapshot>("/api/admin/system-health"),
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 30_000),
    staleTime: 10_000,
  })
}
