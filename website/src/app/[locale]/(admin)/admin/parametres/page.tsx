import { Suspense } from "react";
import { Metadata } from "next";
import { ServerSettings } from "./server-settings";
import { SettingsClient } from "./_components/settings-client";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { alarmsApi } from "@/lib/api";

export const metadata: Metadata = {
  title: "Paramétrage - Vigitemp",
  description: "Configuration de l'application",
};

function SettingsLoadingSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="p-6">
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

async function ActiveAlarmsCount() {
  let activeAlarmsCount = 0;

  try {
    const alarms = await alarmsApi.getActive();
    activeAlarmsCount = alarms.filter((a) => a.status === "active").length;
  } catch {
    // ignore (fallback to 0)
  }

  return (
    <PageHeader
      title="Paramétrage"
      description="Configuration de l'application"
      activeAlarms={activeAlarmsCount}
    />
  );
}

export default async function SettingsPage() {
  const settingsData = await ServerSettings();

  return (
    <div className="flex flex-col min-h-full">
      <Suspense
        fallback={
          <PageHeader
            title="Paramétrage"
            description="Configuration de l'application"
            activeAlarms={0}
          />
        }
      >
        <ActiveAlarmsCount />
      </Suspense>

      <Suspense fallback={<SettingsLoadingSkeleton />}>
        <SettingsClient settings={settingsData} />
      </Suspense>
    </div>
  );
}

