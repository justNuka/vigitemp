import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { HelpSupportPageClient } from "./help-support-page-client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "helpSupport.meta" })

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default function HelpPage() {
  return <HelpSupportPageClient />
}
