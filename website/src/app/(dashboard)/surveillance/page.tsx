import { Suspense } from "react";
import { Metadata } from "next";
import { ServerSensors } from "./server-sensors";
import { ServerDashboardStats } from "./server-stats";
import { ServerFilterOptions } from "./server-filters";
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
  // Charger UNIQUEMENT la première page (50 sondes) côté serveur
  // Le client chargera les pages suivantes avec infinite scroll
  const [statsData, filterOptions] = await Promise.all([
    ServerDashboardStats(),
    ServerFilterOptions(),
  ]);

  // Le composant client va charger les sensors paginés via l'API
  // Cela réduit drastiquement le temps de chargement initial
  return (
    <div className="flex flex-col min-h-full">
      <Suspense fallback={<SensorsLoadingSkeleton />}>
        <SurveillancePageClient
          initialStats={statsData}
          sites={filterOptions.sites}
          groups={filterOptions.groups}
        />
      </Suspense>
    </div>
  );
}
