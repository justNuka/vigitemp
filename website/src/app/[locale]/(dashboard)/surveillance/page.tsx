import { Suspense } from "react";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";

import { MonitoringCardSkeleton } from "@/components/monitoring-card-skeleton";
import { getGlobalNonResponseDefault } from "@/lib/non-response-preference";

import { SurveillancePageClient } from "./monitoring-page-client";
import { ServerFilterOptions } from "./server-filters";
import { ServerDashboardStats, ServerSurveillanceRefreshIntervalSeconds } from "./server-stats";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "surveillance" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

function SensorsLoadingSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between">
        <div className="h-10 w-64 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <MonitoringCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default async function SurveillancePage() {
  await connection();

  const [statsData, filterOptions, refreshIntervalSeconds, showNullNonResponse] = await Promise.all([
    ServerDashboardStats(),
    ServerFilterOptions(),
    ServerSurveillanceRefreshIntervalSeconds(),
    getGlobalNonResponseDefault(),
  ]);

  return (
    <div className="flex min-h-full flex-col">
      <Suspense fallback={<SensorsLoadingSkeleton />}>
        <SurveillancePageClient
          initialStats={statsData}
          sites={filterOptions.sites}
          groups={filterOptions.groups}
          refreshIntervalSeconds={refreshIntervalSeconds}
          showNullNonResponse={showNullNonResponse}
        />
      </Suspense>
    </div>
  );
}
