'use client'

import { Activity, CheckCircle2, Zap } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from 'next-intl'

type TestConnectionStatsProps = {
  globalResponseRate: number
  sensorCount: number
  lastMeasurementCount: number
  selectedCount: number
}

export function TestConnectionStats({
  globalResponseRate,
  sensorCount,
  lastMeasurementCount,
  selectedCount,
}: TestConnectionStatsProps) {
  const t = useTranslations('toolsTestConnection.stats')
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('global_response_rate')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{globalResponseRate}%</p>
              <p className="mt-1 text-xs text-muted-foreground">{t('sensor_count', { count: sensorCount })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('measurement_count')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{lastMeasurementCount.toLocaleString()}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t('last_7days')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('selected_sensors')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{selectedCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t('selected_over_total', { total: sensorCount })}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

