import { Suspense } from "react";
import { connection } from "next/server";
import { AuditClient } from "./audit-client";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { getTranslations, setRequestLocale } from 'next-intl/server';

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

export default async function AuditPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // La base cliente peut être indisponible pendant next build, notamment avec
  // DATABASE_PROVIDER=sqlserver. Le point d'accès dynamique doit être placé dans
  // la page avant toute requête Prisma : les fonctions "use cache" peuvent sinon
  // être préremplies pendant le prérendu malgré le layout parent.
  await connection();

  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'auditPage' });
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title={t('title')}
        description={t('description')}
        activeAlarms={0}
      />

      <Suspense fallback={<AuditLoadingSkeleton />}>
        <AuditClient />
      </Suspense>
    </div>
  );
}
