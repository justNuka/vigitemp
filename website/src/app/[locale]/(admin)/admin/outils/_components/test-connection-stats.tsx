'use client'

import { Activity, CheckCircle2, Radio, Timer } from "lucide-react"
import { useLocale, useTranslations } from 'next-intl'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatNumber } from "@/lib/number-display"

type TestConnectionStatsProps = {
  isRunning: boolean
  hasRun: boolean
  progressPercent: number
  remainingSeconds: number
  globalResponseRate: number | null
  receivedAttempts: number
  totalAttempts: number
  selectedCount: number
  respondingSensorCount: number
}

export function TestConnectionStats({
  isRunning,
  hasRun,
  progressPercent,
  remainingSeconds,
  globalResponseRate,
  receivedAttempts,
  totalAttempts,
  selectedCount,
  respondingSensorCount,
}: TestConnectionStatsProps) {
  const t = useTranslations('toolsTestConnection.stats')
  const locale = useLocale()
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const remainingLabel = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t('test_progress')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-sky-600" />
              <span className="text-lg font-semibold">
                {isRunning ? remainingLabel : hasRun ? t('completed') : t('ready')}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t('global_response_rate')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-emerald-600" />
            <p className="text-2xl font-bold tabular-nums">
              {globalResponseRate == null
                ? '—'
                : `${formatNumber(globalResponseRate, { locale, decimals: 1, grouping: false })}%`}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t('received_attempts')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Radio className="h-6 w-6 text-indigo-600" />
            <div>
              <p className="text-2xl font-bold tabular-nums">{receivedAttempts}/{totalAttempts}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t('real_measurements')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t('responding_sensors')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-violet-600" />
            <div>
              <p className="text-2xl font-bold tabular-nums">{respondingSensorCount}/{selectedCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t('selected_sensors')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
