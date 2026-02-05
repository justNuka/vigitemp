import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { Skeleton } from "@/components/ui/skeleton";
import { validateLicense } from "@/lib/license-server";
import { DashboardClient } from "./dashboard-client";
import { DashboardHeader } from "./dashboard-header";
import { DashboardOne } from "./dashboard-one";
import {
  ServerActiveAlarms,
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
 * Architecture optimisee: donnees cached cote serveur + interactivite cote client
 */
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const license = await validateLicense();
  const edition = license?.edition?.toLowerCase() ?? "standard";

  if (edition === "one") {
    return (
      <div className="flex flex-col min-h-full dashboard-light">
        <DashboardOne locale={locale} />
      </div>
    );
  }

  // Chargement parallele des donnees avec cache
  const [stats, criticalSensors, activeAlarms, sensorOverview, trendStats] =
    await Promise.all([
      ServerDashboardStats(),
      ServerCriticalSensors(),
      ServerActiveAlarms(),
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
          sensorOverview={sensorOverview}
          totalActiveAlarms={stats.activeAlarms}
          trendCountLast24h={trendStats.countLast24h}
        />
      </Suspense>
    </div>
  );
}

function DashboardContentSkeleton() {
  return (
    <div className="flex-1 p-4 md:p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Skeleton className="h-64 w-full" />
        </div>
        <div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
