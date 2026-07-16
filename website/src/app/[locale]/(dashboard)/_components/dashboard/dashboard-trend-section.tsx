import { ArrowRight, BarChart3, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MiniChart } from "@/components/mini-chart"
import { Link } from "@/i18n/navigation"
import type { Measurement } from "@/lib/api"
import type { DashboardAlarmTypeCounts } from "../../server-dashboard"

type Translate = (key: string, values?: Record<string, string | number>) => string

export function DashboardTrendSection({
  t,
  trendMeasurements,
  trendCountLast7d,
  alarmTypeCounts,
  alarmTypeLabels,
}: {
  t: Translate
  trendMeasurements: Measurement[]
  trendCountLast7d: number
  alarmTypeCounts: DashboardAlarmTypeCounts
  alarmTypeLabels: Record<keyof DashboardAlarmTypeCounts, string>
}) {
  const alarmTypes = [
    { key: "high" as const, color: "#ef4444" },
    { key: "low" as const, color: "#3b82f6" },
    { key: "noResponse" as const, color: "#111827" },
    { key: "sector" as const, color: "#f59e0b" },
    { key: "module" as const, color: "#8b5cf6" },
  ].map((item) => ({ ...item, count: alarmTypeCounts[item.key] }))
  const totalByType = alarmTypes.reduce((total, item) => total + item.count, 0)
  let currentAngle = 0
  const gradientStops = alarmTypes
    .filter((item) => item.count > 0)
    .map((item) => {
      const start = currentAngle
      currentAngle += totalByType > 0 ? (item.count / totalByType) * 360 : 0
      return `${item.color} ${start}deg ${currentAngle}deg`
    })
    .join(", ")

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          {t("trend.title")}
        </h2>
      </div>

      <Card className="card-interactive bg-card border-border shadow-lg overflow-hidden">
        <CardHeader className="pb-2 bg-linear-to-r from-primary/5 to-transparent border-b border-border/50">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("trend.subtitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <MiniChart measurements={trendMeasurements} height={120} showScale className="rounded-lg overflow-hidden pr-10" />
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground tabular-nums">
                {trendCountLast7d}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("trend.count", { count: "" }).trim()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-interactive bg-card border-border shadow-lg overflow-hidden">
        <CardHeader className="pb-2 bg-linear-to-r from-primary/5 to-transparent border-b border-border/50">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("trend.type_distribution")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center gap-5">
            <div
              className="relative size-28 shrink-0 rounded-full"
              style={{ background: totalByType > 0 ? `conic-gradient(${gradientStops})` : "hsl(var(--muted))" }}
              role="img"
              aria-label={t("trend.type_distribution_aria", { count: totalByType })}
            >
              <div className="absolute inset-5 grid place-items-center rounded-full bg-card text-lg font-bold tabular-nums">
                {totalByType}
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              {alarmTypes.map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{alarmTypeLabels[item.key]}</span>
                  </span>
                  <span className="font-semibold tabular-nums">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-interactive bg-card border-border shadow-lg overflow-hidden">
        <CardHeader className="pb-2 bg-linear-to-r from-primary/5 to-transparent border-b border-border/50">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            {t("trend.statistics_title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">{t("trend.statistics_description")}</p>
          <div className="mt-4 flex justify-end">
            <Link href="/alarmes/par-lieu">
              <Button variant="outline" size="sm" className="gap-1 text-primary border-primary/30 hover:bg-primary/10 hover:text-primary">
                {t("trend.open_statistics")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
