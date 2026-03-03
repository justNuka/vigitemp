"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, Database, MessageSquareText, Server } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Terminal } from "@/components/magicui/terminal"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { getJson, isUnauthorizedError, postJson } from "@/lib/http"

import { HotlineHealthCard } from "./dashboard/hotline-health-card"
import { HotlineLogsFilters, HotlineLogsPanel } from "./dashboard/hotline-logs-panel"

type HealthStatus = "ok" | "error" | "unknown"

type HotlineHealth = {
  server: HealthStatus
  dbMain: HealthStatus
  dbMesure: HealthStatus
  dbChat: HealthStatus
}

type HotlineLogs = {
  source: "web" | "server"
  date: string
  filePath: string
  lines: string[]
}

type HotlineRequestError = {
  id: string
  timestamp: string
  method: string
  path: string
  statusCode: number
  message: string
  user?: string
  userId?: number
  ip?: string
}

type HotlineDashboardProps = { slug: string }

function formatStatus(t: ReturnType<typeof useTranslations>, status: HealthStatus) {
  return status === 'ok' ? t('status.ok') : status === 'error' ? t('status.error') : t('status.unknown')
}

function statusBadgeClass(status: HealthStatus) {
  return status === 'ok'
    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
    : status === 'error'
      ? 'bg-red-500/15 text-red-600 dark:text-red-300 border-red-500/30'
      : 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/30'
}

function getLogLineClass(line: string) {
  const normalized = line.toLowerCase()
  if (normalized.includes('[error]') || normalized.includes(' error ')) return 'text-red-400'
  if (normalized.includes('[warn]') || normalized.includes(' warn ')) return 'text-yellow-400'
  if (normalized.includes('[audit]')) return 'text-fuchsia-400'
  return 'text-foreground'
}

function formatRequestErrorLine(item: HotlineRequestError) {
  return `[${item.timestamp}] [${item.id}] ${item.method} ${item.path} -> ${item.statusCode} | ${item.message}`
}

export function HotlineDashboard({ slug }: HotlineDashboardProps) {
  const router = useRouter()
  const params = useParams()
  const locale = typeof params?.locale === 'string' ? params.locale : 'fr'
  const t = useTranslations('hotlineDashboard')
  const tAlert = useTranslations('agentSecretAlert')

  const [health, setHealth] = useState<HotlineHealth | null>(null)
  const [loadingHealth, setLoadingHealth] = useState(true)
  const [logs, setLogs] = useState<HotlineLogs | null>(null)
  const [logsError, setLogsError] = useState<string | null>(null)
  const [loadingLogs, setLoadingLogs] = useState(true)
  const [logSource, setLogSource] = useState<'web' | 'server' | 'web-service-error' | 'web-service-wrapper' | 'web-service-output'>('web')
  const [logDate, setLogDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [logLimit, setLogLimit] = useState('200')
  const [agentSecretStatus, setAgentSecretStatus] = useState<{ status: string; message: string } | null>(null)
  const [requestErrors, setRequestErrors] = useState<HotlineRequestError[]>([])
  const [loadingRequestErrors, setLoadingRequestErrors] = useState(false)

  const safeLimit = useMemo(() => {
    const parsed = Number(logLimit)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 200
  }, [logLimit])

  const handleLogout = async () => {
    await postJson('/api/hotline/logout', {})
    router.replace(`/${locale}/login`)
  }

  const guardUnauthorized = (error: unknown) => {
    if (isUnauthorizedError(error)) {
      router.replace(`/${locale}/hotline/${slug}/login`)
      return true
    }
    return false
  }

  const loadHealth = async () => {
    setLoadingHealth(true)
    try {
      setHealth(await getJson<HotlineHealth>('/api/hotline/health'))
    } catch (error) {
      guardUnauthorized(error)
    } finally {
      setLoadingHealth(false)
    }
  }

  const loadLogs = async () => {
    setLoadingLogs(true)
    setLogsError(null)
    try {
      setLogs(await getJson<HotlineLogs>(`/api/hotline/logs?source=${logSource}&date=${logDate}&limit=${safeLimit}`))
    } catch (error) {
      if (!guardUnauthorized(error)) setLogsError(t('logs.error'))
    } finally {
      setLoadingLogs(false)
    }
  }

  const loadRequestErrors = async () => {
    setLoadingRequestErrors(true)
    try {
      const data = await getJson<{ items: HotlineRequestError[] }>(`/api/hotline/request-errors?limit=${safeLimit}`)
      setRequestErrors(data.items || [])
    } catch (error) {
      if (!guardUnauthorized(error)) setRequestErrors([])
    } finally {
      setLoadingRequestErrors(false)
    }
  }

  const loadAgentSecretStatus = async () => {
    try {
      const payload = await getJson<{ status: string; message: string } | { ok: true; data: { status: string; message: string } }>('/api/hotline/agent-secret-status')
      setAgentSecretStatus('ok' in payload ? payload.data : payload)
    } catch (error) {
      if (!guardUnauthorized(error)) setAgentSecretStatus({ status: 'error', message: tAlert('status_error') })
    }
  }

  useEffect(() => {
    loadHealth()
    loadLogs()
    loadRequestErrors()
    loadAgentSecretStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex w-full flex-1 flex-col gap-6 rounded-xl border border-border/60 bg-gradient-to-b from-[#26A5DA]/5 via-transparent to-transparent p-4 md:p-6">
      {isFeatureEnabled('enableAgentSecretAlert') && agentSecretStatus && agentSecretStatus.status !== 'ok' ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{tAlert('title')}</AlertTitle>
          <AlertDescription>{agentSecretStatus.message || tAlert('status_error')}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
          <div className="mt-2 inline-flex items-center rounded-md border border-[#26A5DA]/30 bg-[#26A5DA]/10 px-2 py-1 text-xs text-[#0E7490] dark:text-[#67E8F9]">{t('health.banner')}</div>
        </div>
        <Button variant="outline" onClick={handleLogout}>{t('actions.logout')}</Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-[#26A5DA]/15 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#26A5DA] data-[state=active]:text-white hover:bg-[#26A5DA]/20">{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-[#26A5DA] data-[state=active]:text-white hover:bg-[#26A5DA]/20">{t('tabs.logs')}</TabsTrigger>
          <TabsTrigger value="request_errors" className="data-[state=active]:bg-[#26A5DA] data-[state=active]:text-white hover:bg-[#26A5DA]/20">{t('tabs.request_errors')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <HotlineHealthCard title={t('health.server')} status={formatStatus(t, health?.server || 'unknown')} loading={loadingHealth} icon={Server} statusLabel={t('actions.loading')} badgeClassName={statusBadgeClass(health?.server || 'unknown')} />
            <HotlineHealthCard title={t('health.db_main')} status={formatStatus(t, health?.dbMain || 'unknown')} loading={loadingHealth} icon={Database} statusLabel={t('actions.loading')} badgeClassName={statusBadgeClass(health?.dbMain || 'unknown')} />
            <HotlineHealthCard title={t('health.db_mesure')} status={formatStatus(t, health?.dbMesure || 'unknown')} loading={loadingHealth} icon={Database} statusLabel={t('actions.loading')} badgeClassName={statusBadgeClass(health?.dbMesure || 'unknown')} />
            <HotlineHealthCard title={t('health.db_chat')} status={formatStatus(t, health?.dbChat || 'unknown')} loading={loadingHealth} icon={MessageSquareText} statusLabel={t('actions.loading')} badgeClassName={statusBadgeClass(health?.dbChat || 'unknown')} />
          </div>
          <div className="mt-4"><Button variant="secondary" onClick={loadHealth} disabled={loadingHealth}>{loadingHealth ? t('actions.check_loading') : t('actions.check_now')}</Button></div>
        </TabsContent>

        <TabsContent value="logs" className="mt-4 space-y-4">
          <HotlineLogsFilters
            logSource={logSource}
            setLogSource={setLogSource}
            logDate={logDate}
            setLogDate={setLogDate}
            logLimit={logLimit}
            setLogLimit={setLogLimit}
            onRefresh={loadLogs}
            loading={loadingLogs}
            labels={{
              filterTitle: t('logs.filter_title'),
              source: t('logs.fields.source'),
              date: t('logs.fields.date'),
              lines: t('logs.fields.lines'),
              refresh: t('actions.refresh'),
              loading: t('actions.loading'),
              web: t('logs.source.web'),
              server: t('logs.source.server'),
              webServiceError: t('logs.source.web_service_error'),
              webServiceWrapper: t('logs.source.web_service_wrapper'),
              webServiceOutput: t('logs.source.web_service_output'),
            }}
          />
          <HotlineLogsPanel title={t('logs.output_title')} filePath={logs?.filePath ? t('logs.file', { path: logs.filePath }) : null} error={logsError} lines={logs?.lines || []} loading={loadingLogs} emptyLabel={t('logs.empty')} lineClassName={getLogLineClass} />
        </TabsContent>

        <TabsContent value="request_errors" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{t('request_errors.title')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-end"><Button onClick={loadRequestErrors} disabled={loadingRequestErrors}>{loadingRequestErrors ? t('actions.loading') : t('actions.refresh')}</Button></div>
              <Terminal className="max-h-120 max-w-full overflow-x-hidden" sequence={false}>
                {requestErrors.map((item) => <span key={item.id} className="text-red-300">{formatRequestErrorLine(item)}</span>)}
                {!loadingRequestErrors && requestErrors.length === 0 ? <span className="text-muted-foreground">{t('request_errors.empty')}</span> : null}
              </Terminal>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


