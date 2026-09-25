"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatNumber } from "@/lib/number-display"

type SefSensorTestResult = {
  success: boolean
  error?: string | null
  sensorType: string
  serial: string
  action: string
  requestedCommand?: string | null
  networkHost?: string | null
  networkPort?: number | null
  protocolAddress?: string | null
  value?: number | null
  unit?: string | null
  rawValue?: string | null
  exchanges?: Array<{
    direction: string
    format: string
    content: string
  }>
}

export function HotlineSefTestPanel() {
  const t = useTranslations("hotlineSefTest")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SefSensorTestResult | null>(null)
  const [serverHost, setServerHost] = useState("127.0.0.1")
  const [serverPort, setServerPort] = useState("5310")
  const [sensorReference, setSensorReference] = useState("")
  const [networkHost, setNetworkHost] = useState("")
  const [networkPort, setNetworkPort] = useState("1470")
  const [protocolAddress, setProtocolAddress] = useState("01")
  const [readTimeoutMs, setReadTimeoutMs] = useState("5000")
  const [writeTimeoutMs, setWriteTimeoutMs] = useState("5000")

  const commandPreview = useMemo(() => {
    const parsed = Number.parseInt(protocolAddress.trim() || "1", 10)
    const normalized = Number.isFinite(parsed) && parsed >= 0 && parsed <= 99
      ? String(parsed).padStart(2, "0")
      : protocolAddress.trim()
    return `Q#${normalized || "01"}\\r00000000`
  }, [protocolAddress])

  const exchangeText = useMemo(() => {
    if (!result?.exchanges?.length) return ""
    return result.exchanges
      .map((exchange) => `[${exchange.direction.toUpperCase()}][${exchange.format}] ${exchange.content}`)
      .join("\n")
  }, [result])

  async function submit() {
    setSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/hotline/sensor-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverHost,
          serverPort: parsePositiveInteger(serverPort, 5310),
          sensorType: "SEF",
          serial: sensorReference.trim() || "SEF",
          action: "read",
          networkHost: networkHost.trim(),
          networkPort: parsePositiveInteger(networkPort, 1470),
          protocolAddress: protocolAddress.trim() || "01",
          readTimeoutMs: parsePositiveInteger(readTimeoutMs, 5000),
          writeTimeoutMs: parsePositiveInteger(writeTimeoutMs, 5000),
        }),
      })

      const json = await response.json()
      if (!response.ok || !json?.ok) {
        setError(json?.message || t("errors.test_failed"))
        setResult((json?.details as SefSensorTestResult | undefined) ?? null)
        return
      }

      setResult(json.data as SefSensorTestResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.test_failed"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="border-primary/20 bg-white dark:bg-popover/95">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-md border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          {t("protocol_note")}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("fields.server_host")}>
            <Input value={serverHost} onChange={(event) => setServerHost(event.target.value)} placeholder="127.0.0.1" />
          </Field>
          <Field label={t("fields.api_port")}>
            <Input value={serverPort} onChange={(event) => setServerPort(event.target.value)} placeholder="5310" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("fields.network_host")}>
            <Input value={networkHost} onChange={(event) => setNetworkHost(event.target.value)} placeholder="192.168.63.69" />
          </Field>
          <Field label={t("fields.network_port")}>
            <Input value={networkPort} onChange={(event) => setNetworkPort(event.target.value)} placeholder="1470" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("fields.protocol_address")}>
            <Input value={protocolAddress} onChange={(event) => setProtocolAddress(event.target.value)} placeholder="01" />
          </Field>
          <Field label={t("fields.sensor_reference")}>
            <Input value={sensorReference} onChange={(event) => setSensorReference(event.target.value)} placeholder="343" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("fields.read_timeout")}>
            <Input value={readTimeoutMs} onChange={(event) => setReadTimeoutMs(event.target.value)} placeholder="5000" />
          </Field>
          <Field label={t("fields.write_timeout")}>
            <Input value={writeTimeoutMs} onChange={(event) => setWriteTimeoutMs(event.target.value)} placeholder="5000" />
          </Field>
        </div>

        <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground dark:bg-muted/15">
          <div className="mb-1 font-medium">{t("command_title")}</div>
          <code className="font-mono text-foreground">{commandPreview}</code>
        </div>

        <Button onClick={submit} disabled={submitting || !serverHost.trim() || !networkHost.trim()}>
          {submitting ? t("actions.testing") : t("actions.test")}
        </Button>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        ) : null}

        {result ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ResultItem label={t("results.endpoint")} value={formatEndpoint(result.networkHost, result.networkPort)} />
              <ResultItem label={t("results.protocol_address")} value={result.protocolAddress || "-"} />
              <ResultItem label={t("results.value")} value={formatValue(result.value, result.unit)} />
              <ResultItem label={t("results.command")} value={result.requestedCommand || "-"} />
            </div>
            <div>
              <div className="mb-2 text-sm font-medium">{t("results.raw")}</div>
              <Textarea value={result.rawValue || ""} readOnly rows={3} className="font-mono text-xs" />
            </div>
            <div>
              <div className="mb-2 text-sm font-medium">{t("results.exchanges")}</div>
              <Textarea value={exchangeText} readOnly rows={5} className="font-mono text-xs" />
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="space-y-2 text-sm"><div className="font-medium text-foreground">{label}</div>{children}</label>
}

function ResultItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 dark:bg-muted/15">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="break-words text-sm font-medium">{value}</div>
    </div>
  )
}

function parsePositiveInteger(value: string, fallback: number) {
  const parsed = Number.parseInt(value.trim(), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function formatEndpoint(host?: string | null, port?: number | null) {
  if (!host) return "-"
  return `${host}:${port || 1470}`
}

function formatValue(value?: number | null, unit?: string | null) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "-"
  const formatted = formatNumber(value, { decimals: 2, grouping: false })
  return unit ? `${formatted} ${unit}` : formatted
}
