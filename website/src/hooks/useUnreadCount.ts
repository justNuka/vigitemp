import { useQuery } from "@tanstack/react-query";
import { getJson, isAuthDisconnected } from "@/lib/http";
import { useMessagingEnabled } from "@/hooks/useMessagingEnabled";

type UnreadCountResponse = { count: number };
const UNREAD_COUNT_POLL_MS = 30_000;

export function useUnreadCount(): number {
  const messagingEnabled = useMessagingEnabled();

  const { data } = useQuery<UnreadCountResponse>({
    queryKey: ["chat", "unread-count"],
    queryFn: () => getJson<UnreadCountResponse>("/api/chat/unread-count"),
    enabled: messagingEnabled && !isAuthDisconnected(),
    // Poll only while the tab is active to avoid noisy background traffic.
    refetchInterval: () => {
      if (typeof document === "undefined") return false;
      const isVisible = document.visibilityState === "visible";
      const isFocused = typeof document.hasFocus === "function" ? document.hasFocus() : true;
      return isVisible && isFocused ? UNREAD_COUNT_POLL_MS : false;
    },
    refetchIntervalInBackground: false,
    staleTime: 0,
    retry: false,
  });

  return data?.count ?? 0;
}
