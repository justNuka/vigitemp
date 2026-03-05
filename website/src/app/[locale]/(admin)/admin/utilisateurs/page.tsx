import { Suspense } from "react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ServerUsers } from "./server-users";
import { UsersClient } from "./users-client";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("usersPage")

  return {
    title: t("title"),
    description: t("description"),
  }
}

function UsersLoadingSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-48" />
      </div>
      <Card className="p-6">
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}

async function getActiveAlarmsCount() {
  "use cache";

  try {
    return await prisma.t_alarme.count({
      where: {
        Est_Acquittee: false,
        Date_Heure_Fin: null,
        Est_Alarme_Vrai: true,
      },
    });
  } catch {
    return 0;
  }
}

export default async function UsersPage() {
  const [usersData, activeAlarmsCount] = await Promise.all([
    ServerUsers(),
    getActiveAlarmsCount(),
  ]);

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        titleKey="usersPage.title"
        descriptionKey="usersPage.description"
        activeAlarms={activeAlarmsCount}
      />

      <div className="space-y-6 p-6">
        <Suspense fallback={<UsersLoadingSkeleton />}>
          <UsersClient users={usersData} />
        </Suspense>
      </div>
    </div>
  );
}
