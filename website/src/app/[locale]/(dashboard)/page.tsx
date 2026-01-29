import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardClient } from "./dashboard-client";
import { DashboardHeader } from "./dashboard-header";
import {
  ServerDashboardStats,
  ServerCriticalSensors,
  ServerActiveAlarms,
  ServerSensorOverview,
} from "./server-dashboard";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dashboard' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}


/**
 * Dashboard principal - Server Component avec Cache Components
 * Architecture optimisée: données cached côté serveur + interactivité côté client
 */
export default async function DashboardPage() {
  // Chargement parallèle des données avec cache
  const [stats, criticalSensors, activeAlarms, sensorOverview] =
    await Promise.all([
      ServerDashboardStats(),
      ServerCriticalSensors(),
      ServerActiveAlarms(),
      ServerSensorOverview(),
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
