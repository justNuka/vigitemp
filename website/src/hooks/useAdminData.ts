import { useQuery } from "@tanstack/react-query";
import type { ConnectedUser } from "@/components/data-table/connected-users-columns";
import type { ActiveAlarm } from "@/components/data-table/active-alarms-columns";
import type { AcknowledgmentRecord } from "@/components/data-table/acknowledgment-columns";
import type { SystemLog } from "@/components/data-table/system-logs-columns";
import type { BackupRecord } from "@/components/data-table/backup-columns";

export function useConnectedUsers() {
  return useQuery({
    queryKey: ["admin", "connected-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/connected-users");
      if (!res.ok) throw new Error("Failed to fetch connected users");
      return res.json() as Promise<ConnectedUser[]>;
    },
    refetchInterval: 10_000, // 10 seconds
    staleTime: 5_000, // 5 seconds
  });
}

export function useActiveAlarms() {
  return useQuery({
    queryKey: ["admin", "active-alarms"],
    queryFn: async () => {
      const res = await fetch("/api/admin/active-alarms");
      if (!res.ok) throw new Error("Failed to fetch active alarms");
      return res.json() as Promise<ActiveAlarm[]>;
    },
    refetchInterval: 15 * 60_000, // 15 minutes
    staleTime: 10 * 60_000, // 10 minutes
  });
}

export function useAcknowledgments() {
  return useQuery({
    queryKey: ["admin", "acknowledgments"],
    queryFn: async () => {
      const res = await fetch("/api/admin/acknowledgments");
      if (!res.ok) throw new Error("Failed to fetch acknowledgments");
      return res.json() as Promise<AcknowledgmentRecord[]>;
    },
    refetchInterval: 15 * 60_000, // 15 minutes
    staleTime: 10 * 60_000, // 10 minutes
  });
}

export function useSystemLogs(page: number = 1) {
  return useQuery({
    queryKey: ["admin", "system-logs", page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/system-logs?page=${page}&limit=5`);
      if (!res.ok) throw new Error("Failed to fetch system logs");
      return res.json() as Promise<{
        data: SystemLog[];
        pagination: { page: number; limit: number; total: number; pages: number };
      }>;
    },
    refetchInterval: 5_000, // 5 seconds
    staleTime: 2_000, // 2 seconds
  });
}

export function useBackups() {
  return useQuery({
    queryKey: ["admin", "backups"],
    queryFn: async () => {
      const res = await fetch("/api/admin/backups");
      if (!res.ok) throw new Error("Failed to fetch backups");
      return res.json() as Promise<BackupRecord[]>;
    },
    refetchInterval: 30_000, // 30 seconds
    staleTime: 15_000, // 15 seconds
  });
}
