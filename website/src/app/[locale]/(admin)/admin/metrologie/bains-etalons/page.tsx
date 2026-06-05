"use client"

import { useMemo } from "react"

import { PageHeader } from "@/components/page-header"
import { LicenseBlockedCard } from "@/components/license/license-blocked-card"
import { useLicense } from "@/components/license/license-provider"
import { isOneOrPack } from "@/lib/license-access"

import { StandardsClient } from "../../etalons/standards-client"
import { IntercomparisonMediaClient } from "../../etalons/intercomparison-media-client"

export default function BainsEtalonsPage() {
  const { license, loading } = useLicense()
  const isBlocked = useMemo(() => isOneOrPack(license), [license])

  if (loading) return null

  if (isBlocked) {
    return (
      <>
        <PageHeader title="Bains & étalons" description="Gestion indisponible avec votre licence actuelle." />
        <div className="space-y-6 p-6">
          <LicenseBlockedCard message="Cette page n'est pas disponible avec votre licence actuelle." backLabel="Retour" />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Bains & étalons" description="Gestion des sondes étalons et des milieux d'inter-comparaison." />
      <div className="space-y-6 p-6">
        <StandardsClient />
        <IntercomparisonMediaClient />
      </div>
    </>
  )
}
