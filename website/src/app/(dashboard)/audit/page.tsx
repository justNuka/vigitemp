import { Suspense } from "react";
import { Metadata } from "next";
import { ServerAuditLogs, ServerAuditStats } from "./server-audit-logs";
import { AuditClient } from "./audit-client";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Audit - Vigitemp",
  description: "Journal d'audit et historique des événements",
};

// Skeleton pour la table d'audit
function AuditLoadingSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-64" />
      </div>
      <Card className="p-4">
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}

export default async function AuditPage() {
  // Chargement des données côté serveur avec cache
  const [logsData, statsData] = await Promise.all([
    ServerAuditLogs(100),
    ServerAuditStats(),
  ]);

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Journal d'audit"
        description="Historique des actions et événements"
        activeAlarms={0}
      />

      <Suspense fallback={<AuditLoadingSkeleton />}>
        <AuditClient logs={logsData} />
      </Suspense>
    </div>
  );
}
