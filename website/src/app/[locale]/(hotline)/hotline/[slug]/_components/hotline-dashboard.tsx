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

function formatStatus(status: HealthStatus) {
  switch (status) {
    case "ok":
      return "OK"
    case "error":
      return "Erreur"
    default:
      return "Inconnu"
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
      setLogsError("Impossible de charger les logs")
    } finally {
      setLoadingLogs(false)
    }
  }

  useEffect(() => {
    loadHealth()
    loadLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Portail hotline</h1>
          <p className="text-sm text-muted-foreground">
            Acces reserve aux operations de support.
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Deconnexion
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Vue globale</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Serveur C#</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "text-lg font-semibold",
                    statusClass(health?.server || "unknown")
                  )}
                >
                  {loadingHealth ? "Chargement..." : formatStatus(health?.server || "unknown")}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Base principale</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "text-lg font-semibold",
                    statusClass(health?.dbMain || "unknown")
                  )}
                >
                  {loadingHealth ? "Chargement..." : formatStatus(health?.dbMain || "unknown")}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Base mesures</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "text-lg font-semibold",
                    statusClass(health?.dbMesure || "unknown")
                  )}
                >
                  {loadingHealth ? "Chargement..." : formatStatus(health?.dbMesure || "unknown")}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-4">
            <Button variant="secondary" onClick={loadHealth} disabled={loadingHealth}>
              {loadingHealth ? "Verification..." : "Verifier maintenant"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filtrer les logs</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="log-source">Source</Label>
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
                  <option value="web">Web</option>
                  <option value="server">Serveur</option>
                  <option value="web-service-error">Service web (err)</option>
                  <option value="web-service-wrapper">Service web (wrapper)</option>
                  <option value="web-service-output">Service web (out)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="log-date">Date</Label>
                <Input
                  id="log-date"
                  type="date"
                  value={logDate}
                  onChange={(event) => setLogDate(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="log-limit">Lignes</Label>
                <Input
                  id="log-limit"
                  value={logLimit}
                  onChange={(event) => setLogLimit(event.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={loadLogs} disabled={loadingLogs}>
                  {loadingLogs ? "Chargement..." : "Actualiser"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sortie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {logs?.filePath ? (
                <p className="text-xs text-muted-foreground">Fichier: {logs.filePath}</p>
              ) : null}
              {logsError ? (
                <p className="text-sm text-destructive">{logsError}</p>
              ) : null}
              <Terminal className="max-h-[480px] max-w-full" sequence={false}>
                {(logs?.lines || []).map((line, index) => (
                  <span key={`${line}-${index}`} className={getLogLineClass(line)}>
                    {line}
                  </span>
                ))}
                {!loadingLogs && (!logs || logs.lines.length === 0) ? (
                  <span className="text-muted-foreground">Aucune ligne disponible</span>
                ) : null}
              </Terminal>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
