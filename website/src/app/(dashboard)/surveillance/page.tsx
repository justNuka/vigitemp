import { Suspense } from "react";
import { Metadata } from "next";
import { ServerSensors } from "./server-sensors";
import { ServerDashboardStats } from "./server-stats";
import { SurveillancePageClient } from "./surveillance-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Surveillance - Vigitemp",
  description: "Suivi en temps réel des sondes et capteurs",
};

// Skeleton pour les stats
function StatsLoadingSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-8 w-24" />
      ))}
    </div>
  );
}

// Skeleton pour la grille de capteurs
function SensorsLoadingSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(12)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-32 w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export default async function SurveillancePage() {
  // Les données sont chargées en parallèle côté serveur
  const [sensorsData, statsData] = await Promise.all([
    ServerSensors(),
    ServerDashboardStats(),
  ]);

  // Extraire les locations uniques des sensors
  const locations = Array.from(
    new Map(
      sensorsData.map((s) => [s.location.id, s.location])
    ).values()
  );

  return (
    <div className="flex flex-col min-h-full">
      {/* 
        Tout le contenu statique (header, tabs) et les données serveur 
        sont passés au composant client qui gère uniquement les interactions
      */}
      <Suspense fallback={<SensorsLoadingSkeleton />}>
        <SurveillancePageClient
          sensors={sensorsData}
          locations={locations}
          stats={statsData}
        />
      </Suspense>
    </div>
  );
}
