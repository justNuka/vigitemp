import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { FEATURE_FLAGS } from "@/lib/feature-flags"
import { DevModeBadge } from "@/components/dev-mode-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default async function SettingsPerfTestPage() {
  if (!FEATURE_FLAGS.enableTestPages) {
    notFound()
  }

  const t = await getTranslations("testPages.settings")

  return (
    <div className="min-h-screen p-6 space-y-6">
      <DevModeBadge />

      <div className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("instructions.title")}</CardTitle>
            <CardDescription>{t("instructions.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{t("instructions.step1_title")}</h3>
              <p className="text-sm text-muted-foreground">{t("instructions.step1_description")}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t("instructions.step2_title")}</h3>
              <p className="text-sm text-muted-foreground">{t("instructions.step2_description")}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t("instructions.step3_title")}</h3>
              <p className="text-sm text-muted-foreground">{t("instructions.step3_description")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("cards.settings_title")}</CardTitle>
            <CardDescription>{t("cards.settings_cache")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-40 w-full" />}>
              <SettingsDisplay />
            </Suspense>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t("cache_tags.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge>parametres-data</Badge>
              <span className="text-sm text-muted-foreground">{t("cache_tags.settings")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

async function SettingsDisplay() {
  const t = await getTranslations("testPages.settings")
  const settings: any[] = []
  const duration = 0

  return (
    <div className="space-y-2">
      <div className="space-y-3">
        {settings.map((setting) => (
          <div key={setting.key} className="flex items-center justify-between p-3 bg-muted rounded">
            <div className="flex-1">
              <p className="font-medium text-sm">{setting.label}</p>
              <p className="text-xs text-muted-foreground">{setting.key}</p>
            </div>
            <Badge variant={setting.value === "true" ? "default" : "secondary"}>
              {setting.value === "true" ? t("values.enabled") : setting.value === "false" ? t("values.disabled") : setting.value}
            </Badge>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground pt-4 border-t">{t("loaded_count", { count: settings.length, duration })}</p>
    </div>
  )
}
