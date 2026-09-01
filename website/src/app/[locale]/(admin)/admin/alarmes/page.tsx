import { Suspense } from "react";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";

import { AlarmsLoadingSkeleton } from "@/app/[locale]/(dashboard)/alarmes/alarms-loading-skeleton";
import { AlarmsPageClient } from "@/app/[locale]/(dashboard)/alarmes/alarms-page-client";
import {
  ServerAlarms,
  ServerAlarmStats,
  type ServerAlarmStatus,
} from "@/app/[locale]/(dashboard)/alarmes/server-alarms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminAlarmsPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function AlarmsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: "active" | "resolved"; locationId?: string }>;
}) {
  await connection();
  const resolvedSearchParams = await searchParams;
  const status: ServerAlarmStatus =
    resolvedSearchParams.status === "resolved" ? "resolved" : "active";
  const [alarms, stats] = await Promise.all([
    ServerAlarms(status),
    ServerAlarmStats(),
  ]);

  return (
    <Suspense fallback={<AlarmsLoadingSkeleton />}>
      <AlarmsPageClient
        alarms={alarms}
        stats={stats}
        initialStatus={status}
        initialLocationId={resolvedSearchParams.locationId ?? null}
      />
    </Suspense>
  );
}
