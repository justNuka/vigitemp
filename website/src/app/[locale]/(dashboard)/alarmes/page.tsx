import { Suspense } from "react";
import { connection } from "next/server";
import { ServerAlarms, ServerAlarmStats } from "./server-alarms";
import { AlarmsPageClient } from "./alarms-page-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'alarmsPage' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

// Skeleton pour la table d'alarmes
function AlarmsLoadingSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Card className="p-4">
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}

export default async function AlarmsPage({
  searchParams,
}: {
  searchParams: { status?: "active" | "acknowledged" | "resolved" };
}) {
  await connection();
  const status = searchParams.status || "active";

  // Chargement parallèle des données côté serveur avec cache
  const [alarmsData, statsData] = await Promise.all([
    ServerAlarms(),
    ServerAlarmStats(),
  ]);

  return (
    <Suspense fallback={<AlarmsLoadingSkeleton />}>
      <AlarmsPageClient
        alarms={alarmsData}
        stats={statsData}
        initialStatus={status}
      />
    </Suspense>
  );
}
