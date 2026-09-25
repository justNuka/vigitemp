import { useQuery } from "@tanstack/react-query";
import { getJson, isAuthDisconnected } from "@/lib/http";
import { useLicense } from "@/components/license/license-provider";

type MessagingEnabledResponse = { enabled: boolean };

export function useMessagingEnabled(): boolean {
  const { license, loading: licenseLoading } = useLicense();
  const hasLicense = license?.ok === true;

  const { data } = useQuery<MessagingEnabledResponse>({
    queryKey: ["settings", "messaging-enabled"],
    queryFn: () => getJson<MessagingEnabledResponse>("/api/settings/messaging-enabled"),
    enabled: hasLicense && !licenseLoading && !isAuthDisconnected(),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: false,
  });

  if (!hasLicense) return false;
  // Fail-open: defaults to true while loading or on fetch error,
  // consistent with the server-side fallback in /api/settings/messaging-enabled.
  return data?.enabled ?? true;
}
