"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { MapPin, AlertTriangle, CheckCircle2, Activity } from "lucide-react";

type Stats = {
  totalLocations: number;
  activeAlarms: number;
  okSensors: number;
  warningSensors: number;
  criticalSensors: number;
};

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardHeader({ stats }: { stats: Stats }) {
  const t = useTranslations("dashboard");

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        activeAlarms={stats.activeAlarms}
      />

      <section aria-label="Statistiques" className="p-4 md:p-6 pb-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Suspense fallback={<StatCardSkeleton />}>
            <StatCard
              title={t("stats.locations_monitored")}
              value={stats.totalLocations}
              icon={MapPin}
              variant="default"
            />
          </Suspense>
          <Suspense fallback={<StatCardSkeleton />}>
            <StatCard
              title={t("stats.active_alarms")}
              value={stats.activeAlarms}
              icon={AlertTriangle}
              variant={stats.activeAlarms > 0 ? "danger" : "success"}
            />
          </Suspense>
          <Suspense fallback={<StatCardSkeleton />}>
            <StatCard
              title={t("stats.sensors_ok")}
              value={stats.okSensors}
              icon={CheckCircle2}
              variant="success"
            />
          </Suspense>
          <Suspense fallback={<StatCardSkeleton />}>
            <StatCard
              title={t("stats.sensors_alert")}
              value={stats.warningSensors + stats.criticalSensors}
              icon={Activity}
              variant={
                stats.warningSensors + stats.criticalSensors > 0
                  ? "warning"
                  : "default"
              }
            />
          </Suspense>
        </div>
      </section>
    </>
  );
}

