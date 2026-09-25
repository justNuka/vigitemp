import { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { SensorsClient } from "./sensors-client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("sensorsPage")

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function SondesPage() {
  const tCommon = await getTranslations("common")

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        titleKey="sensorsPage.title"
        descriptionKey="sensorsPage.description"
      />

      <div className="mx-auto w-full max-w-[1680px] space-y-4 p-4 md:p-6">
        <Suspense fallback={<div className="text-sm text-muted-foreground">{tCommon("loading")}</div>}>
          <SensorsClient />
        </Suspense>
      </div>
    </div>
  );
}
