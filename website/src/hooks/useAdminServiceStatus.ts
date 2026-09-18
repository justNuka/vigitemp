import { useQuery } from "@tanstack/react-query"

import {
  summarizeMailingService,
  type MailingServiceStatus,
  type TelephonyServiceStatus,
} from "@/lib/admin-service-status"
import { getJson, isUnauthorizedError } from "@/lib/http"

type SmtpConfigResponse = {
  enabled: boolean
  host: string
  port: number
  user: string
  password: string
  sender: string
  passwordConfigured?: boolean
}

export function useMailingServiceStatus() {
  return useQuery<MailingServiceStatus>({
    queryKey: ["admin", "services", "mailing"],
    queryFn: async () => {
      const config = await getJson<SmtpConfigResponse>("/api/admin/configuration-smtp")
      return summarizeMailingService(config)
    },
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 30_000),
    staleTime: 15_000,
  })
}

export function useTelephonyServiceStatus(enabled: boolean) {
  return useQuery<TelephonyServiceStatus>({
    queryKey: ["admin", "services", "telephony"],
    queryFn: async () => getJson<TelephonyServiceStatus>("/api/admin/telephony/status"),
    enabled,
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 30_000),
    staleTime: 15_000,
  })
}
