import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { PublicInfoPage, PublicInfoSection } from "@/components/legal/public-info-page"
import { WEB_APP_VERSION } from "@/lib/app-version"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "legalPages.legal" })
  return {
    title: `${t("title")} - VigiSensys`,
    description: t("intro"),
  }
}

export default async function LegalNoticePage() {
  const t = await getTranslations("legalPages")
  const legal = await getTranslations("legalPages.legal")

  return (
    <PublicInfoPage
      title={legal("title")}
      intro={legal("intro")}
      badge={t("product_badge")}
      backLabel={t("back")}
    >
      <PublicInfoSection title={legal("publisher_title")}>
        <p>{legal("publisher_body")}</p>
        <p className="font-medium text-foreground">VigiSensys v{WEB_APP_VERSION}</p>
      </PublicInfoSection>

      <PublicInfoSection title={legal("hosting_title")}>
        <p>{legal("hosting_body")}</p>
      </PublicInfoSection>

      <PublicInfoSection title={legal("license_title")}>
        <p>{legal("license_body")}</p>
      </PublicInfoSection>

      <PublicInfoSection title={legal("support_title")}>
        <p>{legal("support_body")}</p>
      </PublicInfoSection>

      <PublicInfoSection title={legal("scope_title")}>
        <p>{legal("scope_body")}</p>
      </PublicInfoSection>
    </PublicInfoPage>
  )
}
