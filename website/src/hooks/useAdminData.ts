import { useQuery } from "@tanstack/react-query";
import type { AcknowledgmentRecord } from "@/components/data-table/acknowledgment-columns";
import type { ActiveAlarm } from "@/components/data-table/active-alarms-columns";
import type { BackupRecord } from "@/components/data-table/backup-columns";
import type { ConnectedUser } from "@/components/data-table/connected-users-columns";
import type { SystemLog } from "@/components/data-table/system-logs-columns";
import { getJson, isUnauthorizedError } from "@/lib/http";

type Paginated<T> = {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

export function useConnectedUsers(page: number = 1) {
  return useQuery({
    queryKey: ["admin", "utilisateurs-connectes", page],
    queryFn: async () => {
      return getJson<Paginated<ConnectedUser>>(
        `/api/admin/utilisateurs-connectes?page=${page}&limit=10`,
      );
    },
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 10_000), // 10 seconds
    staleTime: 5_000, // 5 seconds
  });
}

export function useActiveAlarms(page: number = 1) {
  return useQuery({
    queryKey: ["admin", "alarmes-actives", page],
    queryFn: async () => {
      return getJson<Paginated<ActiveAlarm>>(`/api/admin/alarmes-actives?page=${page}&limit=10`);
    },
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 15 * 60_000), // 15 minutes
    staleTime: 10 * 60_000, // 10 minutes
  });
}

export function useAcknowledgments(page: number = 1) {
  return useQuery({
    queryKey: ["admin", "acquittements", page],
    queryFn: async () => {
      return getJson<Paginated<AcknowledgmentRecord>>(`/api/admin/acquittements?page=${page}&limit=10`);
    },
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 15 * 60_000), // 15 minutes
    staleTime: 10 * 60_000, // 10 minutes
  });
}

export function useSystemLogs() {
  return useQuery({
    // UI = journal d'audit (audit trail), pas du logging technique.
    queryKey: ["admin", "journaux-systeme", "latest-50"],
    queryFn: async () => {
      return getJson<Paginated<SystemLog>>(`/api/admin/journaux-systeme?page=1&limit=50`);
    },
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 60_000), // 1 minute (pas besoin de plus rapide)
    staleTime: 30_000, // 30 seconds
  });
}

export function useBackups() {
  return useQuery({
    queryKey: ["admin", "sauvegardes"],
    queryFn: async () => {
      return getJson<BackupRecord[]>("/api/admin/sauvegardes");
    },
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 30_000), // 30 seconds
    staleTime: 15_000, // 15 seconds
  });
}
