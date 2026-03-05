"use client"

import { useTranslations } from "next-intl"
import { FEATURE_FLAGS } from "@/lib/feature-flags"
import { DevModeBadge } from "@/components/dev-mode-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function AlarmStatsDisplay() {
  const t = useTranslations("testPages.alarms")
  const stats = { active: 0, acknowledged: 0, resolved: 0, total: 0 }
  const duration = 0

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">{t("stats.active")}</p>
          <p className="text-2xl font-bold text-destructive">{stats.active}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t("stats.acknowledged")}</p>
          <p className="text-2xl font-bold">{stats.acknowledged}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t("stats.resolved")}</p>
          <p className="text-2xl font-bold text-success">{stats.resolved}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t("stats.total")}</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground pt-4 border-t">{t("loaded_in", { duration })}</p>
    </div>
  )
}

function AlarmsListDisplay() {
  const t = useTranslations("testPages.alarms")
  const alarms: any[] = []
  const duration = 0

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{t("list.count", { count: alarms.length })}</p>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {alarms.slice(0, 5).map((alarm) => (
          <div key={alarm.id} className="text-xs p-2 bg-muted rounded flex items-center justify-between">
            <span className="font-medium">{alarm.sensor.name}</span>
            <Badge variant={alarm.status === "active" ? "destructive" : "secondary"} className="text-xs">
              {alarm.status}
            </Badge>
          </div>
        ))}
        {alarms.length > 5 && <p className="text-xs text-muted-foreground text-center pt-2">{t("list.more", { count: alarms.length - 5 })}</p>}
      </div>
      <p className="text-xs text-muted-foreground pt-4 border-t">{t("loaded_in", { duration })}</p>
    </div>
  )
}

export default function AlarmsPerfTestPage() {
  const t = useTranslations("testPages.alarms")

  if (!FEATURE_FLAGS.enableTestPages) {
    return <div className="min-h-screen p-6 text-sm text-muted-foreground">{t("disabled")}</div>
  }

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

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("cards.stats_title")}</CardTitle>
              <CardDescription>{t("cards.stats_cache")}</CardDescription>
            </CardHeader>
            <CardContent>
              <AlarmStatsDisplay />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("cards.list_title")}</CardTitle>
              <CardDescription>{t("cards.list_cache")}</CardDescription>
            </CardHeader>
            <CardContent>
              <AlarmsListDisplay />
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t("cache_tags.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge>alarms-data</Badge>
              <span className="text-sm text-muted-foreground">{t("cache_tags.alarms_data")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge>alarms-stats</Badge>
              <span className="text-sm text-muted-foreground">{t("cache_tags.alarms_stats")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
