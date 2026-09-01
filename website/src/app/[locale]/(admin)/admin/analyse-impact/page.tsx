import { setRequestLocale, getTranslations } from "next-intl/server"
import { PageHeader } from "@/components/page-header"
import { LicenseBlockedCard } from "@/components/license/license-blocked-card"
import { isStandardOrExpert } from "@/lib/license-access"
import { validateLicense } from "@/lib/license-server"
import { ImpactAnalysisClient } from "./impact-analysis-client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "impactAnalysis" })
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function AnalyseImpactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const license = await validateLicense()
  const hasAccess = license.ok && isStandardOrExpert(license)

  if (!hasAccess) {
    return (
      <div className="flex flex-col min-h-full">
        <PageHeader
          titleKey="impactAnalysis.title"
          description="Fonctionnalite reservee aux licences Standard et Expert."
        />
        <div className="space-y-6 p-6">
          <LicenseBlockedCard message="Cette fonctionnalite necessite une licence Standard ou Expert." />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        titleKey="impactAnalysis.title"
        descriptionKey="impactAnalysis.description"
      />
      <ImpactAnalysisClient />
    </div>
  )
}
