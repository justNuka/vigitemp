import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { DashboardStats } from "@/components/dashboard-stats"
import { CachedLocationsList } from "@/components/cached-locations-list"
import { CacheControls } from "@/components/cache-controls"
import { DevModeBadge } from "@/components/dev-mode-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FEATURE_FLAGS } from "@/lib/feature-flags"

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-lg" />
      ))}
    </div>
  )
}

function LocationsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-lg" />
      ))}
    </div>
  )
}

export default async function SurveillanceServerPage() {
  if (!FEATURE_FLAGS.enableTestPages) {
    notFound()
  }

  const t = await getTranslations("testPages.monitoring")

  return (
    <div className="flex flex-col min-h-full p-4 md:p-6 space-y-8">
      <DevModeBadge />

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t("stats_title")}</h2>
        <Suspense fallback={<StatsLoading />}>
          <DashboardStats />
        </Suspense>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t("locations_title")}</h2>
        <Suspense fallback={<LocationsLoading />}>
          <CachedLocationsList />
        </Suspense>
      </section>

      <section className="space-y-4">
        <CacheControls />
        <div className="p-4 rounded-lg border border-muted bg-muted/5">
          <h3 className="font-semibold mb-2">{t("how_to_test_title")}</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>{t("how_to_test.refresh")}</li>
            <li>{t("how_to_test.invalidate")}</li>
            <li>{t("how_to_test.compare")}</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
