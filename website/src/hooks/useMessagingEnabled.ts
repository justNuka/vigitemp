import { useQuery } from "@tanstack/react-query";
import { getJson, isAuthDisconnected } from "@/lib/http";
import { useLicense } from "@/components/license/license-provider";
import { isStandardOrExpert } from "@/lib/license-access";

type MessagingEnabledResponse = { enabled: boolean };

export function useMessagingEnabled(): boolean {
  const { license, loading: licenseLoading } = useLicense();
  const hasLicense = isStandardOrExpert(license);

  const { data } = useQuery<MessagingEnabledResponse>({
    queryKey: ["settings", "messaging-enabled"],
    queryFn: () => getJson<MessagingEnabledResponse>("/api/settings/messaging-enabled"),
    enabled: hasLicense && !licenseLoading && !isAuthDisconnected(),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: false,
  });

  if (!hasLicense) return false;
  // Optimistic default: true while the response has not yet arrived
  return data?.enabled ?? true;
}
