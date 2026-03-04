import { PageHeader } from "@/components/page-header";
import { LocationsClient } from "./locations-client";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "locationsPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default function LieuxPage() {
  return (
    <>
      <PageHeader
        titleKey="locationsPage.title"
        descriptionKey="locationsPage.description"
      />
      <div className="p-6">
        <LocationsClient />
      </div>
    </>
  );
}
