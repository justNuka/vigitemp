"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"

import { PageHeader } from "@/components/page-header"
import { LicenseBlockedCard } from "@/components/license/license-blocked-card"
import { useLicense } from "@/components/license/license-provider"
import { isOneOrPack } from "@/lib/license-access"

import { StandardsClient } from "../../etalons/standards-client"
import { IntercomparisonMediaClient } from "../../etalons/intercomparison-media-client"
import { MetrologySubpagesCards } from "../_components/metrology-subpages-cards"

export default function BainsEtalonsPage() {
  const t = useTranslations("metrologyAdmin.bathsPage")
  const { license, loading } = useLicense()
  const isBlocked = useMemo(() => isOneOrPack(license), [license])

  if (loading) return null

  if (isBlocked) {
    return (
      <>
        <PageHeader title={t("header.title")} description={t("blocked.headerDescription")} />
        <div className="space-y-6 p-6">
          <LicenseBlockedCard message={t("blocked.message")} backLabel={t("blocked.back")} />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title={t("header.title")} description={t("header.description")} />
      <div className="space-y-6 p-6">
        <StandardsClient />
        <IntercomparisonMediaClient />
        <MetrologySubpagesCards current="baths" />
      </div>
    </>
  )
}
