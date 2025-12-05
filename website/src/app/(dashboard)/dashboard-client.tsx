"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SensorCard } from "@/components/sensor-card";
import { AlarmTable } from "@/components/alarm-table";
import { MiniChart } from "@/components/mini-chart";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Thermometer,
} from "lucide-react";
import type { SensorWithLocation, AlarmWithDetails } from "@/lib/api";

interface DashboardClientProps {
  criticalSensors: SensorWithLocation[];
  activeAlarms: AlarmWithDetails[];
  sensorOverview: SensorWithLocation[];
}

/**
 * Composant client pour les parties interactives du dashboard
 * Affiche alarmes actives, capteurs critiques, et aperçu des sondes
 */
export function DashboardClient({
  criticalSensors,
  activeAlarms,
  sensorOverview,
}: DashboardClientProps) {
  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section alarmes actives (2 colonnes) */}
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
              <Button variant="ghost" size="sm" className="gap-1">
                Toutes les alarmes
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <Card>
            <CardContent className="p-0">
              <AlarmTable
                alarms={activeAlarms}
                isLoading={false}
                emptyMessage="Aucune alarme active - Tout est sous contrôle"
              />
            </CardContent>
          </Card>
        </section>

        {/* Section tendance récente (1 colonne) */}
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
                measurements={[]}
                height={120}
                className="rounded-lg overflow-hidden"
              />
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">0 mesures</span>
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

      {/* Sondes critiques (si présentes) */}
      {criticalSensors.length > 0 && (
        <section aria-label="Sondes critiques" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-destructive" />
              Sondes en état critique
              <Badge variant="destructive">{criticalSensors.length}</Badge>
            </h2>
            <Link href="/surveillance">
              <Button variant="ghost" size="sm" className="gap-1">
                Toutes les sondes
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {criticalSensors.map((sensor) => (
              <SensorCard key={sensor.id} sensor={sensor} />
            ))}
          </div>
        </section>
      )}

      {/* Aperçu des sondes */}
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
          {sensorOverview.map((sensor) => (
            <SensorCard key={sensor.id} sensor={sensor} />
          ))}
        </div>
      </section>
    </main>
  );
}
