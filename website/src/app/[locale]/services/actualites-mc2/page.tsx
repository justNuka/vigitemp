import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NewsFeedPageClient } from "@/components/services/NewsFeedPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "servicesNews.meta" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function ActualitesMc2Page() {
  return <NewsFeedPageClient />;
}
