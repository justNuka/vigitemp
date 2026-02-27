import { useQuery } from "@tanstack/react-query";
import { getJson, isAuthDisconnected } from "@/lib/http";
import { useMessagingEnabled } from "@/hooks/useMessagingEnabled";

type UnreadCountResponse = { count: number };

export function useUnreadCount(): number {
  const messagingEnabled = useMessagingEnabled();

  const { data } = useQuery<UnreadCountResponse>({
    queryKey: ["chat", "unread-count"],
    queryFn: () => getJson<UnreadCountResponse>("/api/chat/unread-count"),
    enabled: messagingEnabled && !isAuthDisconnected(),
    refetchInterval: 10_000,
    staleTime: 0,
    retry: false,
  });

  return data?.count ?? 0;
}
