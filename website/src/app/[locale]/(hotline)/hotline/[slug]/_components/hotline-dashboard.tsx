"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getJson, postJson, isUnauthorizedError } from "@/lib/http"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Terminal } from "@/components/magicui/terminal"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

type HealthStatus = "ok" | "error" | "unknown"

type HotlineHealth = {
  server: HealthStatus
  dbMain: HealthStatus
  dbMesure: HealthStatus
}

type HotlineLogs = {
  source: "web" | "server"
  date: string
  filePath: string
  lines: string[]
}

type HotlineDashboardProps = {
  slug: string
}

function formatStatus(t: ReturnType<typeof useTranslations>, status: HealthStatus) {
  switch (status) {
    case "ok":
      return t("status.ok")
    case "error":
      return t("status.error")
    default:
      return t("status.unknown")
  }
}

function statusClass(status: HealthStatus) {
  switch (status) {
    case "ok":
      return "text-emerald-500"
    case "error":
      return "text-red-500"
    default:
      return "text-muted-foreground"
  }
}

function getLogLineClass(line: string) {
  const normalized = line.toLowerCase()
  if (normalized.includes("[error]") || normalized.includes(" error ")) {
    return "text-red-400"
  }
  if (normalized.includes("[warn]") || normalized.includes(" warn ")) {
    return "text-yellow-400"
  }
  if (normalized.includes("[audit]")) {
    return "text-fuchsia-400"
  }
  return "text-foreground"
}

export function HotlineDashboard({ slug }: HotlineDashboardProps) {
  const router = useRouter()
  const params = useParams()
  const locale = typeof params?.locale === "string" ? params.locale : "fr"
  const t = useTranslations("hotlineDashboard")
  const tAlert = useTranslations("agentSecretAlert")

  const [health, setHealth] = useState<HotlineHealth | null>(null)
  const [loadingHealth, setLoadingHealth] = useState(true)
  const [logs, setLogs] = useState<HotlineLogs | null>(null)
  const [logsError, setLogsError] = useState<string | null>(null)
  const [loadingLogs, setLoadingLogs] = useState(true)
  const [logSource, setLogSource] = useState<
    "web" | "server" | "web-service-error" | "web-service-wrapper" | "web-service-output"
  >("web")
  const [logDate, setLogDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [logLimit, setLogLimit] = useState("200")
  const [agentSecretStatus, setAgentSecretStatus] = useState<{
    status: string
    message: string
  } | null>(null)

  const safeLimit = useMemo(() => {
    const parsed = Number(logLimit)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 200
  }, [logLimit])

  const handleLogout = async () => {
    await postJson("/api/hotline/logout", {})
    router.replace(`/${locale}/hotline/${slug}/login`)
  }

  const loadHealth = async () => {
    setLoadingHealth(true)
    try {
      const data = await getJson<HotlineHealth>("/api/hotline/health")
      setHealth(data)
    } catch (error) {
      if (isUnauthorizedError(error)) {
        router.replace(`/${locale}/hotline/${slug}/login`)
        return
      }
    } finally {
      setLoadingHealth(false)
    }
  }

  const loadLogs = async () => {
    setLoadingLogs(true)
    setLogsError(null)
    try {
      const data = await getJson<HotlineLogs>(
        `/api/hotline/logs?source=${logSource}&date=${logDate}&limit=${safeLimit}`
      )
      setLogs(data)
    } catch (error) {
      if (isUnauthorizedError(error)) {
        router.replace(`/${locale}/hotline/${slug}/login`)
        return
      }
      setLogsError(t("logs.error"))
    } finally {
      setLoadingLogs(false)
    }
  }

  const loadAgentSecretStatus = async () => {
    try {
      const payload = await getJson<
        { status: string; message: string } | { ok: true; data: { status: string; message: string } }
      >("/api/hotline/agent-secret-status")
      const normalized = "ok" in payload ? payload.data : payload
      setAgentSecretStatus(normalized)
    } catch (error) {
      if (isUnauthorizedError(error)) {
        router.replace(`/${locale}/hotline/${slug}/login`)
        return
      }
      setAgentSecretStatus({ status: "error", message: tAlert("status_error") })
    }
  }

  useEffect(() => {
    loadHealth()
    loadLogs()
    loadAgentSecretStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      {isFeatureEnabled("enableAgentSecretAlert") && agentSecretStatus && agentSecretStatus.status !== "ok" && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{tAlert("title")}</AlertTitle>
          <AlertDescription>
            {agentSecretStatus.message || tAlert("status_error")}
          </AlertDescription>
        </Alert>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          {t("actions.logout")}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="logs">{t("tabs.logs")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("health.server")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "text-lg font-semibold",
                    statusClass(health?.server || "unknown")
                  )}
                >
                  {loadingHealth
                    ? t("actions.loading")
                    : formatStatus(t, health?.server || "unknown")}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("health.db_main")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "text-lg font-semibold",
                    statusClass(health?.dbMain || "unknown")
                  )}
                >
                  {loadingHealth
                    ? t("actions.loading")
                    : formatStatus(t, health?.dbMain || "unknown")}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("health.db_mesure")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "text-lg font-semibold",
                    statusClass(health?.dbMesure || "unknown")
                  )}
                >
                  {loadingHealth
                    ? t("actions.loading")
                    : formatStatus(t, health?.dbMesure || "unknown")}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-4">
            <Button variant="secondary" onClick={loadHealth} disabled={loadingHealth}>
              {loadingHealth ? t("actions.check_loading") : t("actions.check_now")}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("logs.filter_title")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="log-source">{t("logs.fields.source")}</Label>
                <select
                  id="log-source"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={logSource}
                  onChange={(event) =>
                    setLogSource(
                      event.target.value as
                        | "web"
                        | "server"
                        | "web-service-error"
                        | "web-service-wrapper"
                        | "web-service-output"
                    )
                  }
                >
                  <option value="web">{t("logs.source.web")}</option>
                  <option value="server">{t("logs.source.server")}</option>
                  <option value="web-service-error">{t("logs.source.web_service_error")}</option>
                  <option value="web-service-wrapper">{t("logs.source.web_service_wrapper")}</option>
                  <option value="web-service-output">{t("logs.source.web_service_output")}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="log-date">{t("logs.fields.date")}</Label>
                <Input
                  id="log-date"
                  type="date"
                  value={logDate}
                  onChange={(event) => setLogDate(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="log-limit">{t("logs.fields.lines")}</Label>
                <Input
                  id="log-limit"
                  value={logLimit}
                  onChange={(event) => setLogLimit(event.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={loadLogs} disabled={loadingLogs}>
                  {loadingLogs ? t("actions.loading") : t("actions.refresh")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("logs.output_title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {logs?.filePath ? (
                <p className="text-xs text-muted-foreground">
                  {t("logs.file", { path: logs.filePath })}
                </p>
              ) : null}
              {logsError ? (
                <p className="text-sm text-destructive">{logsError}</p>
              ) : null}
              <Terminal className="max-h-120 max-w-full" sequence={false}>
                {(logs?.lines || []).map((line, index) => (
                  <span key={`${line}-${index}`} className={getLogLineClass(line)}>
                    {line}
                  </span>
                ))}
                {!loadingLogs && (!logs || logs.lines.length === 0) ? (
                  <span className="text-muted-foreground">{t("logs.empty")}</span>
                ) : null}
              </Terminal>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
