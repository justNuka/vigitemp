import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { PublicInfoPage, PublicInfoSection } from "@/components/legal/public-info-page"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "legalPages.privacy" })
  return {
    title: `${t("title")} - VigiSensys`,
    description: t("intro"),
  }
}

export default async function DataProtectionPage() {
  const t = await getTranslations("legalPages")
  const privacy = await getTranslations("legalPages.privacy")

  return (
    <PublicInfoPage
      title={privacy("title")}
      intro={privacy("intro")}
      badge={t("product_badge")}
      backLabel={t("back")}
    >
      <PublicInfoSection title={privacy("local_title")}>
        <p>{privacy("local_body")}</p>
      </PublicInfoSection>

      <PublicInfoSection title={privacy("personal_title")}>
        <p>{privacy("personal_body")}</p>
      </PublicInfoSection>

      <PublicInfoSection title={privacy("controller_title")}>
        <p>{privacy("controller_body")}</p>
      </PublicInfoSection>

      <PublicInfoSection title={privacy("support_title")}>
        <p>{privacy("support_body")}</p>
      </PublicInfoSection>

      <PublicInfoSection id="cookies" title={privacy("cookies_title")}>
        <p>{privacy("cookies_body")}</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>{privacy("cookies_session")}</li>
          <li>{privacy("cookies_security")}</li>
          <li>{privacy("cookies_preferences")}</li>
          <li>{privacy("cookies_forms")}</li>
        </ul>
        <p>{privacy("cookies_no_banner")}</p>
      </PublicInfoSection>

      <PublicInfoSection title={privacy("external_title")}>
        <p>{privacy("external_body")}</p>
      </PublicInfoSection>
    </PublicInfoPage>
  )
}
