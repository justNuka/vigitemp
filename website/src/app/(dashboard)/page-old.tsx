"use client";

export const dynamic = 'force-dynamic';

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { SensorCard } from "@/components/sensor-card";
import { AlarmTable } from "@/components/alarm-table";
import { MiniChart } from "@/components/mini-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Thermometer,
  Activity,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { dashboardApi, sensorsApi, alarmsApi } from "@/lib/api";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardApi.getStats(),
  });

  const { data: sensors, isLoading: sensorsLoading } = useQuery({
    queryKey: ["sensors"],
    queryFn: () => sensorsApi.getAll(),
  });

  const { data: alarms, isLoading: alarmsLoading } = useQuery({
    queryKey: ["alarms", "active"],
    queryFn: () => alarmsApi.getActive(),
  });

  const { data: recentMeasurements } = useQuery({
    queryKey: ["dashboard", "measurements"],
    queryFn: () => dashboardApi.getRecentMeasurements(100),
  });

  const criticalSensors = sensors?.filter((s) => s.status === "critical") || [];
  const activeAlarms = alarms?.filter((a) => a.status === "active") || [];

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de la surveillance"
        activeAlarms={activeAlarms.length}
      />

      <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
        {/* Stats Cards */}
        <section aria-label="Statistiques" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                title="Lieux surveillés"
                value={stats?.totalLocations ?? 0}
                icon={MapPin}
                variant="default"
              />
              <StatCard
                title="Alarmes actives"
                value={stats?.activeAlarms ?? 0}
                icon={AlertTriangle}
                variant={stats?.activeAlarms ? "danger" : "success"}
              />
              <StatCard
                title="Sondes OK"
                value={stats?.okSensors ?? 0}
                icon={CheckCircle2}
                variant="success"
              />
              <StatCard
                title="Sondes en alerte"
                value={(stats?.warningSensors ?? 0) + (stats?.criticalSensors ?? 0)}
                icon={Activity}
                variant={(stats?.warningSensors ?? 0) + (stats?.criticalSensors ?? 0) > 0 ? "warning" : "default"}
              />
            </>
          )}
        </section>

        {/* Active Alarms & Recent Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Alarms */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Alarmes actives
                {activeAlarms.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {activeAlarms.length}
                  </Badge>
                )}
              </h2>
              <Link href="/alarms">
                <Button variant="ghost" size="sm" className="gap-1" data-testid="link-all-alarms">
                  Toutes les alarmes
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <AlarmTable
                  alarms={activeAlarms.slice(0, 5)}
                  isLoading={alarmsLoading}
                  emptyMessage="Aucune alarme active - Tout est sous contrôle"
                />
              </CardContent>
            </Card>
          </section>

          {/* Recent Trend Chart */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Tendance récente
              </h2>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Dernières 24h
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MiniChart
                  measurements={recentMeasurements || []}
                  height={120}
                  className="rounded-lg overflow-hidden"
                />
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {recentMeasurements?.length || 0} mesures
                  </span>
                  <Link href="/surveillance">
                    <Button variant="ghost" size="sm" className="gap-1 -mr-2">
                      Détails
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Critical Sensors */}
        {criticalSensors.length > 0 && (
          <section aria-label="Sondes critiques" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-destructive" />
                Sondes en état critique
                <Badge variant="destructive">{criticalSensors.length}</Badge>
              </h2>
              <Link href="/surveillance">
                <Button variant="ghost" size="sm" className="gap-1" data-testid="link-all-sensors">
                  Toutes les sondes
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {criticalSensors.slice(0, 4).map((sensor) => (
                <SensorCard key={sensor.id} sensor={sensor} />
              ))}
            </div>
          </section>
        )}

        {/* All Sensors Overview */}
        <section aria-label="Aperçu des sondes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Aperçu des sondes</h2>
            <Link href="/surveillance">
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sensorsLoading ? (
              <>
                <SensorCardSkeleton />
                <SensorCardSkeleton />
                <SensorCardSkeleton />
                <SensorCardSkeleton />
              </>
            ) : (
              sensors?.slice(0, 8).map((sensor) => (
                <SensorCard key={sensor.id} sensor={sensor} />
              ))
            )}
          </div>
        </section>
      </main>
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

function SensorCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  );
}
