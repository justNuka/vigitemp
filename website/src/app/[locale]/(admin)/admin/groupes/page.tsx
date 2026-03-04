import { PageHeader } from "@/components/page-header";
import { GroupsClient } from "./groups-client";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "groupsPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default function GroupesPage() {
  return (
    <>
      <PageHeader
        titleKey="groupsPage.title"
        descriptionKey="groupsPage.description"
      />
      <div className="space-y-6 p-6">
        <GroupsClient />
      </div>
    </>
  );
}
