"use client"

import { useEffect } from "react"

import { useRouter } from "@/i18n/navigation"
import { PageHeader } from "@/components/page-header"
import { useAppAccess } from "@/components/access/app-access-provider"

export default function MetrologieWorkspacePage() {
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
      <PageHeader title="Metrologie" description="Espace de travail metrologie. Les operations d'ajustage et d'etalonnage seront branchees ici." />
      <div className="space-y-6 p-6">
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          Cette page est prete. Les operations metrologiques visibles ici seront reservees aux profils disposant de l'autorisation ACCES_AJUSTAGE_ETALONNAGE.
        </div>
      </div>
    </>
  )
}
