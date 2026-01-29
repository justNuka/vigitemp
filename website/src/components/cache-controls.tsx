"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { getJson } from "@/lib/http"
import { useTranslations } from "next-intl"

export function CacheControls() {
  const t = useTranslations("cacheControls")
  const [isRevalidating, setIsRevalidating] = useState(false)
  const [lastRevalidated, setLastRevalidated] = useState<string | null>(null)
  const router = useRouter()

  const handleRevalidate = async () => {
    setIsRevalidating(true)
    try {
      const data = await getJson<{ success: boolean }>("/api/revalidate")
      if (data.success) {
        setLastRevalidated(new Date().toLocaleTimeString())
        router.refresh()
      }
    } catch (error) {
      console.error("Error revalidating cache:", error)
    } finally {
      setIsRevalidating(false)
    }
  }

  const handleHardRefresh = () => {
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
      <Zap className="h-5 w-5 text-warning" />
      <div className="flex-1">
        <p className="text-sm font-medium">{t("title")}</p>
        <p className="text-xs text-muted-foreground">
          {lastRevalidated
            ? t("last_revalidated", { time: lastRevalidated })
            : t("status_active")}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleHardRefresh}
          title={t("actions.refresh_title")}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {t("actions.refresh")}
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleRevalidate}
          disabled={isRevalidating}
          title={t("actions.invalidate_title")}
        >
          {isRevalidating ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          {t("actions.invalidate")}
        </Button>
      </div>
    </div>
  )
}
