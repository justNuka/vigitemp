import { PageHeader } from "@/components/page-header";
import { ActuatorsClient } from "./actuators-client";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "actuatorsPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default function ActionneursPage() {
  return (
    <div>
      <PageHeader
        titleKey="actuatorsPage.title"
        descriptionKey="actuatorsPage.description"
      />
      <div className="space-y-6 p-6">
        <ActuatorsClient />
      </div>
    </div>
  );
}
