import { Suspense } from "react";
import { connection } from "next/server";
import { ServerAlarms, ServerAlarmStats } from "./server-alarms";
import { AlarmsPageClient } from "./alarms-page-client";
import { AlarmsLoadingSkeleton } from "./alarms-loading-skeleton";
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

export default async function AlarmsPage({
  searchParams,
}: {
  searchParams: { status?: "active" | "acknowledged" | "resolved" };
}) {
  await connection();
  const status = searchParams.status || "active";

  // Chargement parallèle des données côté serveur avec cache
  const [alarmsData, statsData] = await Promise.all([
    ServerAlarms(status),
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
