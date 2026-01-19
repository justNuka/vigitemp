"use client";

import { Suspense, useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { MapPin, AlertTriangle, Activity, PowerOff } from "lucide-react";

type Stats = {
  activeLocations: number;
  disabledLocations: number;
  activeAlarms: number;
  alertSensors: number;
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
  const [activeAlarms, setActiveAlarms] = useState(stats.activeAlarms);

  useEffect(() => {
    setActiveAlarms(stats.activeAlarms);
  }, [stats.activeAlarms]);

  useEffect(() => {
    const handleActiveAlarms = (event: Event) => {
      const detail = (event as CustomEvent<{ count: number }>).detail;
      if (detail && typeof detail.count === "number") {
        setActiveAlarms(detail.count);
      }
    };

    window.addEventListener("vigitemp:active-alarms", handleActiveAlarms);
    return () => window.removeEventListener("vigitemp:active-alarms", handleActiveAlarms);
  }, []);

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        activeAlarms={activeAlarms}
      />

      <section aria-label="Statistiques" className="p-4 md:p-6 pb-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Suspense fallback={<StatCardSkeleton />}>
            <StatCard
              title={t("stats.locations_monitored")}
              value={stats.activeLocations}
              icon={MapPin}
              variant="info"
            />
          </Suspense>
          <Suspense fallback={<StatCardSkeleton />}>
            <StatCard
              title={t("stats.active_alarms")}
              value={activeAlarms}
              icon={AlertTriangle}
              variant={activeAlarms > 0 ? "danger" : "success"}
            />
          </Suspense>
          <Suspense fallback={<StatCardSkeleton />}>
            <StatCard
              title={t("stats.sensors_ok")}
              value={stats.disabledLocations}
              icon={PowerOff}
              variant="muted"
            />
          </Suspense>
          <Suspense fallback={<StatCardSkeleton />}>
            <StatCard
              title={t("stats.sensors_alert")}
              value={stats.alertSensors}
              icon={Activity}
              variant={
                stats.alertSensors > 0
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

