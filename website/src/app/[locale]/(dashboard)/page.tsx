import { Suspense } from "react";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";

import { Skeleton } from "@/components/ui/skeleton";
import { DashboardClient } from "./dashboard-client";
import { DashboardHeader } from "./dashboard-header";
import {
  ServerActiveAlarms,
  ServerActiveAlarmTypeCounts,
  ServerAlarmTrendCount,
  ServerCriticalSensors,
  ServerDashboardStats,
  ServerSensorOverview,
} from "./server-dashboard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

/**
 * Dashboard principal - Server Component avec Cache Components
 * Architecture optimis?e: donn?es cached c?t? serveur + interactivit? c?t? client
 */
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await connection();
  const { locale } = await params;

  // Chargement parall?le des donn?es avec cache
  const [stats, criticalSensors, activeAlarms, alarmTypeCounts, sensorOverview, trendStats] =
    await Promise.all([
      ServerDashboardStats(),
      ServerCriticalSensors(),
      ServerActiveAlarms(),
      ServerActiveAlarmTypeCounts(),
      ServerSensorOverview(),
      ServerAlarmTrendCount(),
    ]);

  return (
    <div className="flex flex-col min-h-full dashboard-light">
      <DashboardHeader stats={stats} />

      {/* Contenu principal - Client Component */}
      <Suspense fallback={<DashboardContentSkeleton />}>
        <DashboardClient
          criticalSensors={criticalSensors}
          activeAlarms={activeAlarms}
          alarmTypeCounts={alarmTypeCounts}
          sensorOverview={sensorOverview}
          totalActiveAlarms={stats.activeAlarms}
          trendCountLast7d={trendStats.countLast7d}
          trendMeasurements={trendStats.measurements}
        />
      </Suspense>
    </div>
  );
}

function DashboardContentSkeleton() {
  return (
    <div className="flex-1 p-4 md:p-6 space-y-6">
      {/* Main grid: chart + side card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-md p-4 space-y-3">
          <Skeleton className="h-5 w-40 rounded" />
          <Skeleton className="h-3 w-56 rounded" />
          <Skeleton className="h-44 w-full rounded-lg mt-2" />
        </div>
        <div className="rounded-xl border border-border bg-card shadow-md p-4 space-y-3">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-3 w-48 rounded" />
          <div className="space-y-2 mt-2">
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
          </div>
        </div>
      </div>
      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card shadow-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-3 w-32 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}



