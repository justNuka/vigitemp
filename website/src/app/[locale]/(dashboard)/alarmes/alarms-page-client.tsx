"use client";

import { useEffect, useState } from "react";
import { BarChart3, History } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AlarmsClient } from "./alarms-client";
import type { AlarmWithDetails } from "@/lib/api";
import { useTranslations } from "next-intl";
import { useAppAccess } from "@/components/access/app-access-provider";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type AlarmStatus = "active" | "resolved";

interface Stats {
  active: number;
  acknowledged: number;
  resolved: number;
  total: number;
}

interface Props {
  alarms: AlarmWithDetails[];
  stats: Stats;
  initialStatus: AlarmStatus;
  initialLocationId?: string | null;
}

export function AlarmsPageClient({ alarms, stats, initialStatus, initialLocationId = null }: Props) {
  const t = useTranslations("alarmsPage");
  const tAckHistory = useTranslations("alarmAckHistoryPage");
  const tDashboard = useTranslations("dashboardClient");
  const { hasPermission } = useAppAccess();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<AlarmStatus>(initialStatus);
  const [localStats, setLocalStats] = useState(stats);
  const canViewAckHistory = hasPermission("ALARM_ACK_ACCESS");

  useEffect(() => {
    setLocalStats(stats);
  }, [stats]);

  useEffect(() => {
    setStatusFilter(initialStatus);
  }, [initialStatus]);

  const handleStatusChange = (nextStatus: AlarmStatus) => {
    setStatusFilter(nextStatus);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("status", nextStatus);
    router.replace(`${pathname}?${nextParams.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title={t("title")}
        description={t("description")}
        activeAlarms={localStats.active}
      >
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href="/alarmes/par-lieu">
            <BarChart3 className="h-4 w-4" />
            {tDashboard("trend_by_location.title")}
          </Link>
        </Button>
        {canViewAckHistory ? (
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/alarmes/acquittements">
              <History className="h-4 w-4" />
              {tAckHistory("shortTitle")}
            </Link>
          </Button>
        ) : null}
      </PageHeader>

      <AlarmsClient
        key={`${initialStatus}:${initialLocationId ?? "all"}`}
        alarms={alarms}
        statusFilter={statusFilter}
        stats={localStats}
        initialLocationId={initialLocationId}
        onStatusChange={handleStatusChange}
        onStatsChange={setLocalStats}
      />
    </div>
  );
}
