import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DashboardStats } from "@/components/dashboard-stats";
import { CachedLocationsList } from "@/components/cached-locations-list";
import { CacheControls } from "@/components/cache-controls";
import { DevModeBadge } from "@/components/dev-mode-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FEATURE_FLAGS } from "@/lib/feature-flags";

// Skeleton pour les stats
function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-lg" />
      ))}
    </div>
  );
}

// Skeleton pour les locations
function LocationsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-lg" />
      ))}
    </div>
  );
}

export default function SurveillanceServerPage() {
  // Page de test uniquement disponible en dev
  if (!FEATURE_FLAGS.enableTestPages) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-full p-4 md:p-6 space-y-8">
      <DevModeBadge />
      
      {/* Header statique */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Surveillance</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble des capteurs et emplacements surveillés
        </p>
      </div>

      {/* Stats avec cache et streaming */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Statistiques en temps réel</h2>
        <Suspense fallback={<StatsLoading />}>
          <DashboardStats />
        </Suspense>
      </section>

      {/* Locations avec cache et streaming */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Emplacements</h2>
        <Suspense fallback={<LocationsLoading />}>
          <CachedLocationsList />
        </Suspense>
      </section>

      {/* Contrôles du cache */}
      <section className="space-y-4">
        <CacheControls />
        <div className="p-4 rounded-lg border border-muted bg-muted/5">
          <h3 className="font-semibold mb-2">💡 Comment tester ?</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>1️⃣ <strong>Refresh</strong> : Recharge depuis le cache (instantané ~10ms)</li>
            <li>2️⃣ <strong>Invalider Cache</strong> : Force le rechargement depuis MySQL (~200ms)</li>
            <li>3️⃣ Comparez les temps dans Network tab (F12)</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
