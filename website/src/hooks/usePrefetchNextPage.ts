import { useEffect } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";

type PrefetchNextPageOptions<T> = {
  enabled?: boolean;
  page: number;
  pages: number;
  queryKey: (page: number) => QueryKey;
  queryFn: (page: number) => Promise<T>;
  staleTime?: number;
};

export function usePrefetchNextPage<T>({
  enabled = true,
  page,
  pages,
  queryKey,
  queryFn,
  staleTime,
}: PrefetchNextPageOptions<T>) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || page >= pages) return;
    const nextPage = page + 1;
    void queryClient.prefetchQuery({
      queryKey: queryKey(nextPage),
      queryFn: () => queryFn(nextPage),
      staleTime,
    });
  }, [enabled, page, pages, queryClient, queryKey, queryFn, staleTime]);
}
