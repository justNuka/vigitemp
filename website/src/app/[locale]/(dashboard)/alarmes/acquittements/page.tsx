import { connection } from "next/server"
import { getTranslations } from "next-intl/server"

import { AlarmAcknowledgmentHistoryClient } from "./page-client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "alarmAckHistoryPage" })

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  }
}

export default async function AlarmAcknowledgmentHistoryPage() {
  await connection()
  return <AlarmAcknowledgmentHistoryClient />
}
