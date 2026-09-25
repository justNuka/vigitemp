import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { ModulesClient } from "./module-client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("modulesPage")

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default function ModulesPage() {
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        titleKey="modulesPage.title"
        descriptionKey="modulesPage.description"
      />

      <div className="mx-auto w-full max-w-[1680px] space-y-4 p-4 md:p-6">
        <ModulesClient />
      </div>
    </div>
  );
}
