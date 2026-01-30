import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ServerSettings } from "./server-settings";
import { SettingsClient } from "./_components/settings-client";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { alarmsApi } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminSettingsPage" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

function SettingsLoadingSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="p-6 bg-white/50 dark:bg-card">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

async function ActiveAlarmsCount({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  let activeAlarmsCount = 0;

  try {
    const alarms = await alarmsApi.getActive();
    activeAlarmsCount = alarms.filter((a) => a.status === "active").length;
  } catch {
    // ignore (fallback to 0)
  }

  return (
    <PageHeader
      title={title}
      description={description}
      activeAlarms={activeAlarmsCount}
    />
  );
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, settingsData] = await Promise.all([params, ServerSettings()]);
  const t = await getTranslations({ locale, namespace: "adminSettingsPage" });
  const title = t("title");
  const description = t("description");

  return (
    <div className="flex flex-col min-h-full">
      <Suspense
        fallback={
          <PageHeader
            title={title}
            description={description}
            activeAlarms={0}
          />
        }
      >
        <ActiveAlarmsCount title={title} description={description} />
      </Suspense>

      <Suspense fallback={<SettingsLoadingSkeleton />}>
        <SettingsClient settings={settingsData} />
      </Suspense>
    </div>
  );
}
