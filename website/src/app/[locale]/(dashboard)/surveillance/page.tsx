import { Suspense } from "react";
import { ServerDashboardStats } from "./server-stats";
import { ServerFilterOptions } from "./server-filters";
import { SurveillancePageClient } from "./monitoring-page-client";
import { Skeleton } from "@/components/ui/skeleton";
import { MonitoringCardSkeleton } from "@/components/monitoring-card-skeleton";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'surveillance' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

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
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
        {Array.from({ length: 12 }).map((_, i) => (
          <MonitoringCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default async function SurveillancePage() {
  // Charger UNIQUEMENT la premiere page (50 sondes) cote serveur
  // Le client chargera les pages suivantes avec infinite scroll
  const [statsData, filterOptions] = await Promise.all([
    ServerDashboardStats(),
    ServerFilterOptions(),
  ]);

  // Le composant client va charger les sensors pagines via l'API
  // Cela reduit drastiquement le temps de chargement initial
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

