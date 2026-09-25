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
      <div className="mx-auto w-full max-w-[1680px] space-y-4 p-4 md:p-6">
        <GroupsClient />
      </div>
    </>
  );
}
