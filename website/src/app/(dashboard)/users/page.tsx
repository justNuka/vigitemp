import { Suspense } from "react";
import { Metadata } from "next";
import { ServerUsers } from "./server-users";
import { UsersClient } from "./users-client";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { alarmsApi } from "@/lib/api";

export const metadata: Metadata = {
  title: "Utilisateurs - Vigitemp",
  description: "Gestion des utilisateurs",
};

// Skeleton pour la liste des utilisateurs
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

async function getActiveAlarms() {
  try {
    const alarms = await alarmsApi.getActive();
    return alarms.filter((a) => a.status === "active");
  } catch {
    return [];
  }
}

export default async function UsersPage() {
  // Chargement parallèle des données côté serveur avec cache
  const [usersData, activeAlarms] = await Promise.all([
    ServerUsers(),
    getActiveAlarms(),
  ]);

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Gestion des utilisateurs"
        description="Administration des comptes utilisateurs"
        activeAlarms={activeAlarms.length}
      />

      <Suspense fallback={<UsersLoadingSkeleton />}>
        <UsersClient users={usersData} />
      </Suspense>
    </div>
  );
}
