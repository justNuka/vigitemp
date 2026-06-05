import { redirect } from "next/navigation"

import { buildLocalizedPath } from "@/i18n/pathnames"

export default async function EtalonsRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(buildLocalizedPath("/admin/metrologie/bains-etalons", locale as "fr" | "en"))
}
