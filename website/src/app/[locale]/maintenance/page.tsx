"use client"

import { RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"

import { ErrorPageLayout } from "@/components/error/error-page-layout"

export default function MaintenancePage() {
  const t = useTranslations("errors")

  return (
    <ErrorPageLayout
      code="MAINT"
      standalone
      variant="maintenance"
      badge={t("maintenance_badge")}
      title={t("maintenance_title")}
      description={t("maintenance_description")}
      helperText={t("maintenance_helper")}
      primaryAction={{
        label: t("retry"),
        icon: <RefreshCw className="h-4 w-4" />,
        onClick: () => window.location.reload(),
      }}
    />
  )
}
