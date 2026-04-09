import { ArrowRight, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MiniChart } from "@/components/mini-chart"
import { Link } from "@/i18n/navigation"
import type { Measurement } from "@/lib/api"

type Translate = (key: string, values?: Record<string, string | number>) => string

export function DashboardTrendSection({
  t,
  trendMeasurements,
  trendCountLast7d,
}: {
  t: Translate
  trendMeasurements: Measurement[]
  trendCountLast7d: number
}) {
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
            <Link href="/alarmes/par-lieu">
              <Button variant="ghost" size="sm" className="gap-1 -mr-2 text-primary hover:text-primary/80">
                {t("trend.details")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
