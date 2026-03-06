import { setRequestLocale, getTranslations } from "next-intl/server"
import { PageHeader } from "@/components/page-header"
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
