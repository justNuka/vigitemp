"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"

import { useRouter } from "@/i18n/navigation"
import { PageHeader } from "@/components/page-header"
import { useAppAccess } from "@/components/access/app-access-provider"

export default function MetrologieWorkspacePage() {
  const t = useTranslations("metrologyWorkspace")
  const router = useRouter()
  const { hasPermission, loading } = useAppAccess()

  useEffect(() => {
    if (!loading && !hasPermission("METROLOGY_ACCESS")) {
      router.replace("/403")
    }
  }, [hasPermission, loading, router])

  if (loading || !hasPermission("METROLOGY_ACCESS")) {
    return null
  }

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="space-y-6 p-6">
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          {t("notice")}
        </div>
      </div>
    </>
  )
}
