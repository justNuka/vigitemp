"use client"

import { useCallback, useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"

import { ErrorPageLayout } from "@/components/error/error-page-layout"

export default function OfflinePage() {
  const t = useTranslations("errors")
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine))
  const retry = useCallback(() => window.location.assign("../surveillance"), [])

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true)
      window.location.reload()
    }
    const handleOffline = () => setOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <ErrorPageLayout
      code="NET"
      standalone
      variant="network"
      badge={t("network_badge")}
      title={t("network_title")}
      description={t("network_description")}
      helperText={online ? t("network_online_helper") : t("network_helper")}
      primaryAction={{
        label: t("retry"),
        icon: <RefreshCw className="h-4 w-4" />,
        onClick: retry,
      }}
    />
  )
}
