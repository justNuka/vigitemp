import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { FEATURE_FLAGS } from "@/lib/feature-flags"
import { DevModeBadge } from "@/components/dev-mode-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default async function AuditPerfTestPage() {
  if (!FEATURE_FLAGS.enableTestPages) {
    notFound()
  }

  const t = await getTranslations("testPages.audit")

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
              <Suspense fallback={<Skeleton className="h-20 w-full" />}>
                <AuditStatsDisplay />
              </Suspense>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("cards.logs_title")}</CardTitle>
              <CardDescription>{t("cards.logs_cache")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-20 w-full" />}>
                <AuditLogsDisplay />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t("cache_tags.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge>audit-logs</Badge>
              <span className="text-sm text-muted-foreground">{t("cache_tags.audit_logs")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge>audit-stats</Badge>
              <span className="text-sm text-muted-foreground">{t("cache_tags.audit_stats")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

async function AuditStatsDisplay() {
  const t = await getTranslations("testPages.audit")
  const stats = { total: 0, last24h: 0 }
  const duration = 0

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">{t("stats.total_events")}</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t("stats.last_24h")}</p>
          <p className="text-2xl font-bold text-primary">{stats.last24h}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground pt-4 border-t">{t("loaded_in", { duration })}</p>
    </div>
  )
}

async function AuditLogsDisplay() {
  const t = await getTranslations("testPages.audit")
  const logs: any[] = []
  const duration = 0

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{t("logs.count", { count: logs.length })}</p>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {logs.map((log) => (
          <div key={log.id} className="text-xs p-2 bg-muted rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">{log.action}</span>
              <span className="text-muted-foreground">{log.userId || t("logs.system")}</span>
            </div>
            {log.details ? <p className="text-muted-foreground truncate">{log.details}</p> : null}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground pt-4 border-t">{t("loaded_in", { duration })}</p>
    </div>
  )
}
