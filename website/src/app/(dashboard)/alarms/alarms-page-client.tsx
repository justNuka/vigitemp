"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlarmsClient } from "./alarms-client";
import type { AlarmWithDetails } from "@/lib/api";

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
  const [statusFilter, setStatusFilter] = useState<AlarmStatus>(initialStatus);

  // Filter alarms based on current status
  const filteredAlarms = alarms.filter((alarm) => alarm.status === statusFilter);

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Gestion des alarmes"
        description="Suivi et traitement des alarmes"
        activeAlarms={stats.active}
      >
        <Tabs
          value={statusFilter}
          onValueChange={(v: string) => setStatusFilter(v as AlarmStatus)}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="active" data-testid="tab-active">
              <span className="flex items-center gap-1">
                Actives
                {stats.active > 0 && (
                  <span className="text-destructive">({stats.active})</span>
                )}
              </span>
            </TabsTrigger>
            <TabsTrigger value="acknowledged" data-testid="tab-acknowledged">
              Acquittées ({stats.acknowledged})
            </TabsTrigger>
            <TabsTrigger value="resolved" data-testid="tab-resolved">
              Résolues ({stats.resolved})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </PageHeader>

      <AlarmsClient alarms={filteredAlarms} statusFilter={statusFilter} />
    </div>
  );
}
