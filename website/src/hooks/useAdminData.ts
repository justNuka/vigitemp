import { useQuery } from "@tanstack/react-query";
import type { AcknowledgmentRecord } from "@/components/data-table/acknowledgment-columns";
import type { ActiveAlarm } from "@/components/data-table/active-alarms-columns";
import type { ConnectedUser } from "@/components/data-table/connected-users-columns";
import type { SystemLog } from "@/components/data-table/system-logs-columns";
import { getJson, isUnauthorizedError } from "@/lib/http";
import type { BackupsResponse } from "@/types/backup-types";
import type { AuditLog } from "@/lib/api";
import { formatDbDateTime } from "@/lib/date-display";

type Paginated<T> = {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

type AlarmApiItem = {
  id: number;
};

type AlarmApiResponse = {
  data: AlarmApiItem[];
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
      const response = await getJson<any>(`/api/alarmes/acquittements?page=${page}&limit=10`);
      return {
        data: (response?.data ?? []).map((item: any) => ({
          id: String(item.id),
          dateHeure: item.acknowledgedAt ?? null,
          utilisateur: item.acknowledgedBy ?? "-",
          action: item.alarmType ?? "-",
          sonde: item.sensorSerial ?? "-",
          alarme: item.locationName ?? "-",
        })) as AcknowledgmentRecord[],
        pagination: response?.pagination ?? { page, limit: 10, total: 0, pages: 1 },
      } satisfies Paginated<AcknowledgmentRecord>;
    },
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 15 * 60_000), // 15 minutes
    staleTime: 10 * 60_000, // 10 minutes
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ["admin", "audit", "latest-50"],
    queryFn: async () => {
      const response = await getJson<AuditLog[]>(`/api/audit?limit=50`);
      const rows: SystemLog[] = (response ?? []).map((item) => ({
        id: item.id,
        dateHeure: formatDbDateTime(item.timestamp ?? null),
        utilisateur: item.userDisplayName || item.userId || "-",
        action: item.action,
        details: item.details || item.locationName || "",
      }));
      return {
        data: rows,
        pagination: { page: 1, limit: 50, total: rows.length, pages: 1 },
      } satisfies Paginated<SystemLog>;
    },
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 60_000), // 1 minute (pas besoin de plus rapide)
    staleTime: 30_000, // 30 seconds
  });
}

export function useBackups() {
  return useQuery({
    queryKey: ["admin", "sauvegardes"],
    queryFn: async () => {
      return getJson<BackupsResponse>("/api/admin/sauvegardes");
    },
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 30_000), // 30 seconds
    staleTime: 15_000, // 15 seconds
  });
}


export function useAlarmCount(status: "active" | "resolved") {
  return useQuery({
    queryKey: ["admin", "alarms-count", status],
    queryFn: async () => {
      return getJson<AlarmApiResponse>(`/api/alarmes?status=${status}&page=1&limit=1`);
    },
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 15 * 60_000),
    staleTime: 10 * 60_000,
  });
}
