import { Activity, CheckCircle2, Zap } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type TestConnectionStatsProps = {
  globalResponseRate: number
  probeCount: number
  lastMeasurementCount: number
  selectedCount: number
}

export function TestConnectionStats({
  globalResponseRate,
  probeCount,
  lastMeasurementCount,
  selectedCount,
}: TestConnectionStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="border-black dark:border-black">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Taux de réponse global
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{globalResponseRate}%</p>
              <p className="mt-1 text-xs text-muted-foreground">{probeCount} sondes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-black dark:border-black">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Nombre de mesures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{lastMeasurementCount.toLocaleString()}</p>
              <p className="mt-1 text-xs text-muted-foreground">dernières 24h</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-black dark:border-black">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Sondes sélectionnées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{selectedCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">sur {probeCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

