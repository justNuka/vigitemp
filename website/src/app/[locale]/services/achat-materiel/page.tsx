import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HardwareCatalogPageClient } from "@/components/services/HardwareCatalogPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "servicesHardware.meta" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function AchatMaterielPage() {
  return <HardwareCatalogPageClient />;
}
