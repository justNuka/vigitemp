import { Suspense } from "react";
import { ServerAuditLogs, ServerAuditStats } from "./server-audit-logs";
import { AuditClient } from "./audit-client";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auditPage' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

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
  const t = await getTranslations('auditPage');
  // Chargement des données côté serveur avec cache
  const [logsData, statsData] = await Promise.all([
    ServerAuditLogs(100),
    ServerAuditStats(),
  ]);

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title={t('title')}
        description={t('description')}
        activeAlarms={0}
      />

      <Suspense fallback={<AuditLoadingSkeleton />}>
        <AuditClient logs={logsData} />
      </Suspense>
    </div>
  );
}
