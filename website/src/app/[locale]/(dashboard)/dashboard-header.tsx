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
  const cardBaseClass =
    "relative overflow-hidden bg-slate-800 text-white border border-white/10 shadow-[0_12px_24px_-16px_rgba(15,23,42,0.7)] dark:bg-card dark:text-card-foreground dark:border-border";
  const cardTitleClass = "text-white/70 dark:text-muted-foreground";
  const cardValueClass = "text-white dark:text-foreground";
  const cardVariants = {
    info: {
      border: "border-l-4 border-l-sky-400",
      icon: "bg-sky-500/20 text-sky-200 ring-1 ring-sky-300/40 dark:bg-primary/10 dark:text-primary",
    },
    danger: {
      border: "border-l-4 border-l-rose-400",
      icon: "bg-rose-500/20 text-rose-200 ring-1 ring-rose-300/40 dark:bg-destructive/10 dark:text-destructive",
    },
    muted: {
      border: "border-l-4 border-l-slate-400",
      icon: "bg-slate-500/20 text-slate-200 ring-1 ring-slate-300/40 dark:bg-muted dark:text-muted-foreground",
    },
    warning: {
      border: "border-l-4 border-l-amber-400",
      icon: "bg-amber-500/20 text-amber-200 ring-1 ring-amber-300/40 dark:bg-warning/10 dark:text-warning",
    },
  };

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
        className="bg-white/80 border-slate-200 dark:bg-background/95 dark:border-border"
      />

      <section aria-label={t("stats_section_label")} className="p-4 md:p-6 pb-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Suspense fallback={<StatCardSkeleton />}>
            <StatCard
              title={t("stats.locations_monitored")}
              value={stats.activeLocations}
              icon={MapPin}
              variant="info"
              className={`${cardBaseClass} ${cardVariants.info.border}`}
              titleClassName={cardTitleClass}
              valueClassName={cardValueClass}
              iconClassName={cardVariants.info.icon}
            />
          </Suspense>
          <Suspense fallback={<StatCardSkeleton />}>
            <StatCard
              title={t("stats.active_alarms")}
              value={activeAlarms}
              icon={AlertTriangle}
              variant={activeAlarms > 0 ? "danger" : "success"}
              className={`${cardBaseClass} ${cardVariants.danger.border}`}
              titleClassName={cardTitleClass}
              valueClassName={cardValueClass}
              iconClassName={cardVariants.danger.icon}
            />
          </Suspense>
          <Suspense fallback={<StatCardSkeleton />}>
            <StatCard
              title={t("stats.locations_disabled")}
              value={stats.disabledLocations}
              icon={PowerOff}
              variant="muted"
              className={`${cardBaseClass} ${cardVariants.muted.border}`}
              titleClassName={cardTitleClass}
              valueClassName={cardValueClass}
              iconClassName={cardVariants.muted.icon}
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
              className={`${cardBaseClass} ${cardVariants.warning.border}`}
              titleClassName={cardTitleClass}
              valueClassName={cardValueClass}
              iconClassName={cardVariants.warning.icon}
            />
          </Suspense>
        </div>
      </section>
    </>
  );
}

