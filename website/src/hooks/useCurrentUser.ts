import { useQuery } from "@tanstack/react-query";
import type { CurrentUser } from "@/lib/types";
import { getJson } from "@/lib/http";

export function useCurrentUser() {
  return useQuery<CurrentUser>({
    queryKey: ["me"],
    queryFn: async () => {
      return getJson<CurrentUser>("/api/me");
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
}
