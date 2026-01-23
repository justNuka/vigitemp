"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { AlarmsClient } from "./alarms-client";
import type { AlarmWithDetails } from "@/lib/api";
import { useTranslations } from "next-intl";

type AlarmStatus = "active" | "acknowledged" | "resolved";

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
}

export function AlarmsPageClient({ alarms, stats, initialStatus }: Props) {
  const t = useTranslations("alarmsPage");
  const [statusFilter, setStatusFilter] = useState<AlarmStatus>(initialStatus);

  // Filter alarms based on current status
  const filteredAlarms = alarms.filter((alarm) => alarm.status === statusFilter);

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title={t("title")}
        description={t("description")}
        activeAlarms={stats.active}
      />

      <AlarmsClient
        alarms={filteredAlarms}
        statusFilter={statusFilter}
        stats={stats}
        onStatusChange={setStatusFilter}
      />
    </div>
  );
}
