import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardClient } from "./dashboard-client";
import {
  ServerDashboardStats,
  ServerCriticalSensors,
  ServerActiveAlarms,
  ServerSensorOverview,
} from "./server-dashboard";
import { MapPin, AlertTriangle, CheckCircle2, Activity } from "lucide-react";

export const metadata = {
  title: "Tableau de bord - Vigitemp",
  description: "Vue d'ensemble de la surveillance",
};

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
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de la surveillance"
        activeAlarms={stats.activeAlarms}
      />

      {/* Stats Cards avec Suspense */}
      <section aria-label="Statistiques" className="p-4 md:p-6 pb-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Suspense fallback={<StatCardSkeleton />}>
            <StatCard
              title="Lieux surveillés"
              value={stats.totalLocations}
              icon={MapPin}
              variant="default"
            />
          </Suspense>
          <Suspense fallback={<StatCardSkeleton />}>
            <StatCard
              title="Alarmes actives"
              value={stats.activeAlarms}
              icon={AlertTriangle}
              variant={stats.activeAlarms > 0 ? "danger" : "success"}
            />
          </Suspense>
          <Suspense fallback={<StatCardSkeleton />}>
            <StatCard
              title="Sondes OK"
              value={stats.okSensors}
              icon={CheckCircle2}
              variant="success"
            />
          </Suspense>
          <Suspense fallback={<StatCardSkeleton />}>
            <StatCard
              title="Sondes en alerte"
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

      {/* Contenu principal - Client Component */}
      <Suspense fallback={<DashboardContentSkeleton />}>
        <DashboardClient
          criticalSensors={criticalSensors}
          activeAlarms={activeAlarms}
          sensorOverview={sensorOverview}
        />
      </Suspense>
    </div>
  );
}

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
