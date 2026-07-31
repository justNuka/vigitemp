"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type SensorType = "IN" | "IE" | "IP" | "IC" | "IH" | "EN" | "HN" | "GSP"
type GspAction = "read" | "force-read" | "sync-config" | "read-config" | "read-memory" | "custom" | "raw"

type SensorTestResult = {
  success: boolean
  error?: string | null
  sensorType: string
  serial: string
  action: string
  port?: string | null
  address?: string | null
  module?: string | null
  value?: number | null
  unit?: string | null
  rawValue?: string | null
  exchanges?: Array<{
    direction: string
    format: string
    content: string
  }>
}

const SENSOR_TYPES: SensorType[] = ["IN", "IE", "IP", "IC", "IH", "EN", "HN", "GSP"]

const GSP_ACTIONS: Array<{ value: GspAction; label: string }> = [
  { value: "read", label: "Lecture température" },
  { value: "force-read", label: "Forcer température" },
  { value: "sync-config", label: "Envoyer configuration" },
  { value: "read-config", label: "Lire configuration" },
  { value: "read-memory", label: "Lire mémoire" },
  { value: "custom", label: "Commande personnalisée" },
  { value: "raw", label: "Commande brute" },
]

export function HotlineSensorTestTool() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SensorTestResult | null>(null)
  const [serverHost, setServerHost] = useState("127.0.0.1")
  const [serverPort, setServerPort] = useState("5310")
  const [sensorType, setSensorType] = useState<SensorType>("GSP")
  const [serial, setSerial] = useState("")
  const [action, setAction] = useState<GspAction>("read")
  const [gsp, setGsp] = useState({
    coeffA: "",
    coeffB: "",
    accuracyError: "",
    highLimit: "",
    lowLimit: "",
    frequencyMinutes: "",
    alarmDelayLowMinutes: "",
    alarmDelayHighMinutes: "",
    channel: "",
    memoryCount: "",
    customCommandPrefix: "",
    customPayload: "",
  })

  const showGspFields = sensorType === "GSP"
  const isGspMemory = action === "read-memory"
  const isGspCustom = action === "custom"
  const isGspSync = action === "sync-config"

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
      const frequencyMinutes = parseOptionalInteger(gsp.frequencyMinutes)
      const response = await fetch("/api/hotline/sensor-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverHost,
          serverPort: Number(serverPort),
          sensorType,
          serial,
          action: showGspFields ? action : "read",
          gsp: showGspFields
            ? {
                syncConfiguration: isGspSync,
                coeffA: parseOptionalNumber(gsp.coeffA),
                coeffB: parseOptionalNumber(gsp.coeffB),
                accuracyError: parseOptionalNumber(gsp.accuracyError),
                highLimit: parseOptionalNumber(gsp.highLimit),
                lowLimit: parseOptionalNumber(gsp.lowLimit),
                frequencySeconds: frequencyMinutes !== null && frequencyMinutes > 0 ? frequencyMinutes * 60 : null,
                alarmDelayLowMinutes: parseOptionalInteger(gsp.alarmDelayLowMinutes),
                alarmDelayHighMinutes: parseOptionalInteger(gsp.alarmDelayHighMinutes),
                channel: gsp.channel.trim() || undefined,
                memoryCount: parseOptionalInteger(gsp.memoryCount),
                customCommandPrefix: gsp.customCommandPrefix.trim() || undefined,
                customPayload: gsp.customPayload.trim() || undefined,
              }
            : undefined,
        }),
      })

      const json = await response.json()
      if (!response.ok || !json?.ok) {
        setError(json?.message || "Le test a echoue")
        setResult((json?.details as SensorTestResult | undefined) ?? null)
        return
      }

      setResult(json.data as SensorTestResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Le test a echoue")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Outil de test de sonde</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="IP / hote du serveur d'interrogation">
              <Input value={serverHost} onChange={(e) => setServerHost(e.target.value)} placeholder="127.0.0.1" />
            </Field>
            <Field label="Port API">
              <Input value={serverPort} onChange={(e) => setServerPort(e.target.value)} placeholder="5310" />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Type de sonde">
              <Select value={sensorType} onValueChange={(value) => setSensorType(value as SensorType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SENSOR_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Numero de serie">
              <Input value={serial} onChange={(e) => setSerial(e.target.value)} placeholder="SPPS-26000001" />
            </Field>
          </div>

          {showGspFields ? (
            <>
              <Field label="Action GSP">
                <Select value={action} onValueChange={(value) => setAction(value as GspAction)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GSP_ACTIONS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {(isGspSync || action === "read" || action === "force-read") ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Coeff a">
                    <Input value={gsp.coeffA} onChange={(e) => setGsp((prev) => ({ ...prev, coeffA: e.target.value }))} />
                  </Field>
                  <Field label="Coeff b">
                    <Input value={gsp.coeffB} onChange={(e) => setGsp((prev) => ({ ...prev, coeffB: e.target.value }))} />
                  </Field>
                  <Field label="Erreur de justesse">
                    <Input value={gsp.accuracyError} onChange={(e) => setGsp((prev) => ({ ...prev, accuracyError: e.target.value }))} />
                  </Field>
                  <Field label="Canal">
                    <Input value={gsp.channel} onChange={(e) => setGsp((prev) => ({ ...prev, channel: e.target.value }))} />
                  </Field>
                  <Field label="Limite haute">
                    <Input value={gsp.highLimit} onChange={(e) => setGsp((prev) => ({ ...prev, highLimit: e.target.value }))} />
                  </Field>
                  <Field label="Limite basse">
                    <Input value={gsp.lowLimit} onChange={(e) => setGsp((prev) => ({ ...prev, lowLimit: e.target.value }))} />
                  </Field>
                  <Field label="Frequence (min)">
                    <Input value={gsp.frequencyMinutes} onChange={(e) => setGsp((prev) => ({ ...prev, frequencyMinutes: e.target.value }))} />
                  </Field>
                  <Field label="Retard bas (min)">
                    <Input value={gsp.alarmDelayLowMinutes} onChange={(e) => setGsp((prev) => ({ ...prev, alarmDelayLowMinutes: e.target.value }))} />
                  </Field>
                  <Field label="Retard haut (min)">
                    <Input value={gsp.alarmDelayHighMinutes} onChange={(e) => setGsp((prev) => ({ ...prev, alarmDelayHighMinutes: e.target.value }))} />
                  </Field>
                </div>
              ) : null}

              {isGspMemory ? (
                <Field label="Nombre de lignes memoire">
                  <Input value={gsp.memoryCount} onChange={(e) => setGsp((prev) => ({ ...prev, memoryCount: e.target.value }))} />
                </Field>
              ) : null}

              {isGspCustom ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Prefixe commande">
                    <Input
                      value={gsp.customCommandPrefix}
                      onChange={(e) => setGsp((prev) => ({ ...prev, customCommandPrefix: e.target.value }))}
                      placeholder="TEMP"
                    />
                  </Field>
                  <Field label="Payload">
                    <Input
                      value={gsp.customPayload}
                      onChange={(e) => setGsp((prev) => ({ ...prev, customPayload: e.target.value }))}
                      placeholder="25x"
                    />
                  </Field>
                </div>
              ) : null}
            </>
          ) : null}

          <Button onClick={submit} disabled={submitting || !serial.trim() || !serverHost.trim()} className="mt-6">
            {submitting ? "Test en cours..." : "Lancer le test"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          {result ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <ResultItem label="Type" value={result.sensorType} />
              <ResultItem label="Serie" value={result.serial} />
              <ResultItem label="Action" value={result.action} />
              <ResultItem label="Port" value={result.port || "-"} />
              <ResultItem label="Adresse" value={result.address || "-"} />
              <ResultItem label="Module" value={result.module || "-"} />
              <ResultItem label="Valeur" value={result.value != null ? String(result.value) : "-"} />
              <ResultItem label="Unite" value={result.unit || "-"} />
              <ResultItem label="Brut" value={result.rawValue || "-"} />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Aucun resultat pour le moment.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trames TX/RX</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea value={exchangeText} readOnly rows={18} className="font-mono text-xs" />
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2 text-sm">
      <div className="font-medium text-foreground">{label}</div>
      {children}
    </label>
  )
}

function ResultItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/20 px-3 py-2">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim().replace(",", ".")
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function parseOptionalInteger(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number.parseInt(trimmed, 10)
  return Number.isFinite(parsed) ? parsed : null
}
