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

      <Card className="bg-white/90 border-slate-200 shadow-md dark:bg-card dark:border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("trend.subtitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MiniChart measurements={trendMeasurements} height={120} className="rounded-lg overflow-hidden" />
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("trend.count", { count: trendCountLast7d })}</span>
            <Link href="/surveillance">
              <Button variant="ghost" size="sm" className="gap-1 -mr-2">
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
