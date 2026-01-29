import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { AlarmsClientTanStack } from "@/components/data-table/alarms-client-tanstack";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminAlarmsPage" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function AlarmsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminAlarmsPage" });

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title={t("title")}
        description={t("description")}
      />

      <div className="space-y-6 p-6">
        <AlarmsClientTanStack />
      </div>
    </div>
  );
}
