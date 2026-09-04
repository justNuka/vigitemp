"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Info } from "lucide-react"

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RssiBars } from "@/components/monitoring-card/rssi-bars"
import { formatDbDateTime } from "@/lib/date-display"
import { formatNumber } from "@/lib/number-display"

type SensorType = "IN" | "IE" | "IP" | "IC" | "IH" | "EN" | "HN" | "GSP"
type GspAction = "read" | "force-read" | "sync-config" | "read-config" | "read-memory" | "raw"

type SensorTestResult = {
  success: boolean
  error?: string | null
  sensorType: string
  serial: string
  action: string
  port?: string | null
  address?: string | null
  module?: string | null
  requestedCommand?: string | null
  detectedSerials?: string[]
  value?: number | null
  unit?: string | null
  rawValue?: string | null
  exchanges?: Array<{
    direction: string
    format: string
    content: string
  }>
}

type SensorLookupItem = {
  Id_Sonde: number
  Sonde_Numero_Serie: string | null
}

type SensorMeasuresResponse = {
  mesures: Array<{
    Date_Heure_Mesure: string
    Valeur: number | null
    Unite: string | null
    Est_Etat_Alarme: string | null
  }>
}

type RecentMeasure = {
  dateHeure: string
  valeur: number | null
  unite: string | null
  etatAlarme: string | null
}

type ParsedSensorResponse = {
  tx: string[]
  rx: string[]
  parsed: Array<{ label: string; value: string }>
  memoMeasureCount: number
  memoOffset?: string
  memoReturnedCount?: string
  rssiRaw?: string
}

const SENSOR_TYPES: SensorType[] = ["IN", "IE", "IP", "IC", "IH", "EN", "HN", "GSP"]

const GSP_ACTIONS: Array<{ value: GspAction; labelKey: string }> = [
  { value: "read", labelKey: "actions.read" },
  { value: "force-read", labelKey: "actions.force_read" },
  { value: "sync-config", labelKey: "actions.sync_config" },
  { value: "read-config", labelKey: "actions.read_config" },
  { value: "read-memory", labelKey: "actions.read_memory" },
  { value: "raw", labelKey: "actions.raw" },
]

const RAW_COMMAND_PREFIXES = ["DD-H", "ED-H", "TEMP", "FTEM", "DCON", "MEMO", "ECON", "CHAN"]

export function HotlineSensorTestPanel() {
  const t = useTranslations("hotlineSensorTest")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [consecutiveErrors, setConsecutiveErrors] = useState(0)
  const [result, setResult] = useState<SensorTestResult | null>(null)
  const [serverHost, setServerHost] = useState("127.0.0.1")
  const [serverPort, setServerPort] = useState("5310")
  const [sensorType, setSensorType] = useState<SensorType>("GSP")
  const [serial, setSerial] = useState("")
  const [manualPort, setManualPort] = useState("")
  const [manualAddress, setManualAddress] = useState("")
  const [manualModule, setManualModule] = useState("")
  const [baudRate, setBaudRate] = useState("9600")
  const [parity, setParity] = useState("None")
  const [dataBits, setDataBits] = useState("8")
  const [stopBits, setStopBits] = useState("One")
  const [readTimeoutMs, setReadTimeoutMs] = useState("10000")
  const [writeTimeoutMs, setWriteTimeoutMs] = useState("10000")
  const [listenWindowMs, setListenWindowMs] = useState("500")
  const [showAdvanced, setShowAdvanced] = useState(false)
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
    memoryOffset: "",
    rawPrefix: "TEMP",
    rawSerial: "",
    rawPayload: "",
    rawExactMode: false,
    rawExactCommand: "",
  })
  const [recentMeasures, setRecentMeasures] = useState<RecentMeasure[]>([])
  const [recentMeasuresLoading, setRecentMeasuresLoading] = useState(false)
  const [recentMeasuresError, setRecentMeasuresError] = useState<string | null>(null)
  const [recentMeasuresSerial, setRecentMeasuresSerial] = useState<string>("")

  const showGspFields = sensorType === "GSP"
  const isGspMemory = action === "read-memory"
  const isGspRaw = action === "raw"
  const isGspSync = action === "sync-config"

  const exchangeText = useMemo(() => {
    if (!result?.exchanges?.length) return ""
    return result.exchanges
      .map((exchange) => `[${exchange.direction.toUpperCase()}][${exchange.format}] ${exchange.content}`)
      .join("\n")
  }, [result])

  const parsedResponse = useMemo<ParsedSensorResponse | null>(() => {
    if (!result?.exchanges?.length) return null

    const tx = result.exchanges
      .filter((exchange) => exchange.direction.toLowerCase() === "tx")
      .map((exchange) => exchange.content)

    const rx = result.exchanges
      .filter((exchange) => exchange.direction.toLowerCase() === "rx" && !["<empty>", "<timeout>"].includes(exchange.content))
      .map((exchange) => exchange.content)

    const combined = rx.join("\n").trim()
    const parsed: Array<{ label: string; value: string }> = []
    const indexedMemoMatches = combined.match(/(?:^|\r?\n)\d+\|\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}=-?\d+(?:[.,]\d+)?(?=\r?\n|$)/g) ?? []
    const legacyMemoMatches = combined.match(/(?:^|\r?\n)\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}=-?\d+(?:[.,]\d+)?(?=\r?\n|$)/g) ?? []
    const memoMeasureCount = indexedMemoMatches.length || legacyMemoMatches.length

    const dateMatch = combined.match(/\b\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}\b/)
    if (dateMatch) parsed.push({ label: t("parsed.date_time"), value: dateMatch[0] })

    const tempMatch = combined.match(/RTEMP(N\d+)\s*:\s*(-?\d+(?:[.,]\d+)?)/i)
    if (tempMatch) {
      parsed.push({ label: t("parsed.temperature", { serial: tempMatch[1] }), value: tempMatch[2].replace(".", ",") + " °C" })
    }

    const forceTempMatch = combined.match(/ACK\s*:\s*R?FTEM(N\d+)\s*:\s*(-?\d+(?:[.,]\d+)?)/i)
    if (forceTempMatch) {
      parsed.push({ label: t("parsed.forced_temperature", { serial: forceTempMatch[1] }), value: forceTempMatch[2].replace(".", ",") + " °C" })
    }

    const ackTempMatch = combined.match(/(?:^|\r?\n)Temperature=(-?\d+(?:[.,]\d+)?)(?:\r?\n|$)/i)
    if (ackTempMatch) {
      parsed.push({ label: t("parsed.temperature_plain"), value: ackTempMatch[1].replace(".", ",") + " °C" })
    }

    const serialMatch = combined.match(/(?:^|\r?\n)Serial=([A-Z0-9\-]+)(?:\r?\n|$)/i)
    if (serialMatch) parsed.push({ label: t("parsed.serial"), value: serialMatch[1] })

    const memoOffsetMatch = combined.match(/(?:^|\r?\n)Offset=(\d+)(?:\r?\n|$)/i)
    if (memoOffsetMatch) parsed.push({ label: t("parsed.memo_offset"), value: memoOffsetMatch[1] })

    const memoReturnedCountMatch = combined.match(/(?:^|\r?\n)NombreMesure=(\d+)(?:\r?\n|$)/i)
    if (memoReturnedCountMatch) parsed.push({ label: t("parsed.memo_count"), value: memoReturnedCountMatch[1] })

    const batteryMatch = combined.match(/(?:^|\r?\n)Batterie=(-?\d+(?:[.,]\d+)?)(?:\r?\n|$)/i)
    if (batteryMatch) parsed.push({ label: t("parsed.battery"), value: batteryMatch[1].replace(".", ",") })

    const rssiMatch = combined.match(/(?:^|\r?\n)RSSI=(-?\d+(?:[.,]\d+)?)(?:\r?\n|$)/i)
    if (rssiMatch) parsed.push({ label: "RSSI", value: rssiMatch[1].replace(".", ",") })

    const alarmStateMatch = combined.match(/\b(no ALARME|ALARME BAS|ALARME HAUT)\b/i)
    if (alarmStateMatch) parsed.push({ label: t("parsed.alarm_state"), value: alarmStateMatch[1] })

    for (const key of ["A", "B", "C"] as const) {
      const coefficientMatch = combined.match(
        new RegExp(`(?:^|\\r?\\n)(?:${key}|Coef${key}|${key === "C" ? "Etalonnage|Etal" : "__never__"})=(-?\\d+(?:[.,]\\d+)?)(?:\\r?\\n|$)`, "i"),
      )
      if (coefficientMatch) parsed.push({ label: t("parsed.coefficient", { key }), value: coefficientMatch[1].replace(".", ",") })
    }

    const highMatch = combined.match(/(?:^|\r?\n)(?:LimH|LimiteHaute)=(-?\d+(?:[.,]\d+)?)(?:\r?\n|$)/i)
    if (highMatch) parsed.push({ label: t("parsed.high_limit"), value: highMatch[1].replace(".", ",") })

    const lowMatch = combined.match(/(?:^|\r?\n)(?:LimB|LimiteBasse)=(-?\d+(?:[.,]\d+)?)(?:\r?\n|$)/i)
    if (lowMatch) parsed.push({ label: t("parsed.low_limit"), value: lowMatch[1].replace(".", ",") })

    const frequencyMatch = combined.match(/(?:^|\r?\n)(?:F|Frequence)=(-?\d+(?:[.,]\d+)?)(?:\r?\n|$)/i)
    if (frequencyMatch) parsed.push({ label: t("parsed.frequency"), value: frequencyMatch[1].replace(".", ",") })

    const delayLowMatch = combined.match(/(?:^|\r?\n)(?:RetB|RetardBas)=(-?\d+(?:[.,]\d+)?)(?:\r?\n|$)/i)
    if (delayLowMatch) parsed.push({ label: t("parsed.delay_low"), value: delayLowMatch[1].replace(".", ",") })

    const delayHighMatch = combined.match(/(?:^|\r?\n)(?:RetH|RetardHaut)=(-?\d+(?:[.,]\d+)?)(?:\r?\n|$)/i)
    if (delayHighMatch) parsed.push({ label: t("parsed.delay_high"), value: delayHighMatch[1].replace(".", ",") })

    if (memoMeasureCount > 0) parsed.push({ label: t("parsed.memo_measures"), value: String(memoMeasureCount) })

    return {
      tx,
      rx,
      parsed,
      memoMeasureCount,
      memoOffset: memoOffsetMatch?.[1],
      memoReturnedCount: memoReturnedCountMatch?.[1],
      rssiRaw: rssiMatch?.[1],
    }
  }, [result, t])

  const rawPreview = useMemo(() => {
    const raw = result?.rawValue?.trim()
    if (!raw) return "-"
    const normalized = raw.replace(/\s+/g, " ").trim()
    return normalized.length > 120 ? normalized.slice(0, 117) + "..." : normalized
  }, [result])

  const rawCommandValue = useMemo(() => {
    if (gsp.rawExactMode) return gsp.rawExactCommand
    const prefix = gsp.rawPrefix.trim()
    const rawSerial = gsp.rawSerial.trim()
    const payload = gsp.rawPayload.trim()
    if (!prefix && !rawSerial) return ""
    return payload ? `${prefix}${rawSerial} ${payload}` : `${prefix}${rawSerial}`
  }, [gsp.rawExactCommand, gsp.rawExactMode, gsp.rawPayload, gsp.rawPrefix, gsp.rawSerial])

  const normalizedRawCommandValue = useMemo(() => {
    if (gsp.rawExactMode) return rawCommandValue
    return normalizeRawCommand(rawCommandValue)
  }, [gsp.rawExactMode, rawCommandValue])

  const rawCommandForSubmit = normalizedRawCommandValue

  const commandPreview = useMemo(() => {
    if (!showGspFields) return t("command.generic")
    const target = serial.trim()
    if (!target) return t("command.serial_required")

    switch (action) {
      case "read": return `TEMP${target}`
      case "force-read": return `FTEM${target}`
      case "read-config": return `DD-H${target}, DCON${target}`
      case "read-memory": return `MEMO${target} ${(gsp.memoryCount || "1")}x${gsp.memoryOffset.trim() ? `${gsp.memoryOffset}o` : ""}`
      case "raw": return normalizedRawCommandValue || t("command.raw_required")
      case "sync-config": return `ED-H${target}..., ECON${target}...`
      default: return ""
    }
  }, [action, gsp.memoryCount, gsp.memoryOffset, normalizedRawCommandValue, serial, showGspFields, t])

  async function submit() {
    setSubmitting(true)
    setError(null)
    setResult(null)
    setRecentMeasures([])
    setRecentMeasuresError(null)
    setRecentMeasuresSerial("")

    try {
      const parsedFrequencyMinutes = parseOptionalInteger(gsp.frequencyMinutes)
      const frequencySeconds = parsedFrequencyMinutes !== null && parsedFrequencyMinutes > 0 ? parsedFrequencyMinutes * 60 : null

      const response = await fetch("/api/hotline/sensor-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverHost,
          serverPort: Number(serverPort),
          sensorType,
          serial,
          manualPort,
          manualAddress,
          manualModule,
          baudRate: parseOptionalInteger(baudRate),
          parity: parity.trim() || undefined,
          dataBits: parseOptionalInteger(dataBits),
          stopBits: stopBits.trim() || undefined,
          readTimeoutMs: parseOptionalInteger(readTimeoutMs),
          writeTimeoutMs: parseOptionalInteger(writeTimeoutMs),
          action: showGspFields ? action : "read",
          gsp: showGspFields ? {
            syncConfiguration: isGspSync,
            coeffA: parseOptionalNumber(gsp.coeffA),
            coeffB: parseOptionalNumber(gsp.coeffB),
            accuracyError: parseOptionalNumber(gsp.accuracyError),
            highLimit: parseOptionalNumber(gsp.highLimit),
            lowLimit: parseOptionalNumber(gsp.lowLimit),
            frequencySeconds,
            alarmDelayLowMinutes: parseOptionalInteger(gsp.alarmDelayLowMinutes),
            alarmDelayHighMinutes: parseOptionalInteger(gsp.alarmDelayHighMinutes),
            channel: gsp.channel.trim() || undefined,
            memoryCount: parseOptionalInteger(gsp.memoryCount),
            memoryOffset: parseOptionalInteger(gsp.memoryOffset),
            rawCommand: isGspRaw ? rawCommandForSubmit : undefined,
            listenWindowMs: parseOptionalInteger(listenWindowMs),
          } : undefined,
        }),
      })

      const json = await response.json()
      if (!response.ok || !json?.ok) {
        setError(json?.message || t("errors.test_failed"))
        setConsecutiveErrors((prev) => prev + 1)
        setResult((json?.details as SensorTestResult | undefined) ?? null)
        return
      }

      const nextResult = json.data as SensorTestResult
      setResult(nextResult)
      setConsecutiveErrors(0)
      void loadRecentMeasures(nextResult.serial || serial)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.test_failed"))
      setConsecutiveErrors((prev) => prev + 1)
    } finally {
      setSubmitting(false)
    }
  }

  async function loadRecentMeasures(targetSerial: string) {
    const normalizedSerial = targetSerial.trim().toUpperCase()
    if (!normalizedSerial) return

    setRecentMeasuresLoading(true)
    setRecentMeasuresError(null)
    setRecentMeasuresSerial(normalizedSerial)

    try {
      const sensorsResponse = await fetch("/api/sondes", { cache: "no-store" })
      const sensorsJson = await sensorsResponse.json()
      if (!sensorsResponse.ok || !sensorsJson?.ok || !Array.isArray(sensorsJson.data)) {
        setRecentMeasures([])
        setRecentMeasuresError(t("errors.sensors_load"))
        return
      }

      const matchedSensor = (sensorsJson.data as SensorLookupItem[]).find(
        (sensor) => (sensor.Sonde_Numero_Serie ?? "").trim().toUpperCase() === normalizedSerial,
      )

      if (!matchedSensor) {
        setRecentMeasures([])
        setRecentMeasuresError(t("errors.sensor_unregistered"))
        return
      }

      const measuresResponse = await fetch(`/api/sondes/${matchedSensor.Id_Sonde}/mesures`, { cache: "no-store" })
      const measuresJson = await measuresResponse.json()
      if (!measuresResponse.ok || !measuresJson?.ok || !measuresJson.data) {
        setRecentMeasures([])
        setRecentMeasuresError(t("errors.measures_load"))
        return
      }

      const mesures = (measuresJson.data as SensorMeasuresResponse).mesures ?? []
      const lastTen = mesures.slice(-10).reverse().map((measure) => ({
        dateHeure: measure.Date_Heure_Mesure,
        valeur: measure.Valeur,
        unite: measure.Unite,
        etatAlarme: measure.Est_Etat_Alarme,
      }))

      setRecentMeasures(lastTen)
      if (lastTen.length === 0) setRecentMeasuresError(t("errors.no_recent_measure"))
    } catch {
      setRecentMeasures([])
      setRecentMeasuresError(t("errors.recap_load"))
    } finally {
      setRecentMeasuresLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-popover/95">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("fields.server_host")}>
              <Input value={serverHost} onChange={(e) => setServerHost(e.target.value)} placeholder="127.0.0.1" />
            </Field>
            <Field label={t("fields.api_port")}>
              <Input value={serverPort} onChange={(e) => setServerPort(e.target.value)} placeholder="5310" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("fields.sensor_type")}>
              <Select value={sensorType} onValueChange={(value) => setSensorType(value as SensorType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SENSOR_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("fields.serial")}>
              <Input
                value={serial}
                onChange={(e) => {
                  const nextSerial = e.target.value
                  setSerial(nextSerial)
                  setGsp((prev) => ({ ...prev, rawSerial: nextSerial }))
                }}
                placeholder="SPPS-26000001"
              />
            </Field>
          </div>

          <div className="rounded-md border border-border/60 bg-muted/20 p-4 dark:bg-muted/15">
            <div className="mb-3 text-sm font-medium">{t("manual_override.title")}</div>
            <div className="mb-3 text-xs text-muted-foreground">{t("manual_override.description")}</div>
            <Field label={t("fields.manual_port")}>
              <Input value={manualPort} onChange={(e) => setManualPort(e.target.value)} placeholder="COMXXX" />
            </Field>
            <div className="mt-4">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAdvanced((prev) => !prev)}>
                {showAdvanced ? t("manual_override.hide_advanced") : t("manual_override.show_advanced")}
              </Button>
            </div>
            {showAdvanced ? (
              <div className="mt-4 space-y-4 rounded-md border border-amber-200 bg-amber-50 p-4">
                <div className="text-xs text-amber-800">{t("manual_override.warning")}</div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t("fields.address")}>
                    <Input value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} placeholder="00000001" />
                  </Field>
                  <Field label={t("fields.module")}>
                    <Input value={manualModule} onChange={(e) => setManualModule(e.target.value)} placeholder="GSO-Exxxx" />
                  </Field>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <HelpLine title={t("fields.address")}>{t("manual_override.help.address")}</HelpLine>
                  <HelpLine title={t("fields.module")}>{t("manual_override.help.module")}</HelpLine>
                  <HelpLine title={t("fields.baud_rate")}>{t("manual_override.help.baud_rate")}</HelpLine>
                  <HelpLine title={t("fields.parity")}>{t("manual_override.help.parity")}</HelpLine>
                  <HelpLine title={t("fields.data_bits")}>{t("manual_override.help.data_bits")}</HelpLine>
                  <HelpLine title={t("fields.stop_bits")}>{t("manual_override.help.stop_bits")}</HelpLine>
                  <HelpLine title={t("fields.read_timeout")}>{t("manual_override.help.read_timeout")}</HelpLine>
                  <HelpLine title={t("fields.write_timeout")}>{t("manual_override.help.write_timeout")}</HelpLine>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label={t("fields.baud_rate")}>
                    <Input value={baudRate} onChange={(e) => setBaudRate(e.target.value)} placeholder="9600" />
                  </Field>
                  <Field label={t("fields.parity")}>
                    <Select value={parity} onValueChange={setParity}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['None', 'Odd', 'Even', 'Mark', 'Space'].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label={t("fields.data_bits")}>
                    <Input value={dataBits} onChange={(e) => setDataBits(e.target.value)} placeholder="8" />
                  </Field>
                  <Field label={t("fields.stop_bits")}>
                    <Select value={stopBits} onValueChange={setStopBits}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['One', 'Two', 'OnePointFive'].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label={t("fields.read_timeout")}>
                    <Input value={readTimeoutMs} onChange={(e) => setReadTimeoutMs(e.target.value)} placeholder="5000" />
                  </Field>
                  <Field label={t("fields.write_timeout")}>
                    <Input value={writeTimeoutMs} onChange={(e) => setWriteTimeoutMs(e.target.value)} placeholder="5000" />
                  </Field>
                  {showGspFields ? (
                    <Field label={t("fields.listen_window")}>
                      <div className="space-y-2">
                        <Input value={listenWindowMs} onChange={(e) => setListenWindowMs(e.target.value)} placeholder="500" />
                        <div className="text-xs text-muted-foreground">{t("manual_override.listen_help")}</div>
                      </div>
                    </Field>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          {showGspFields ? (
            <>
              <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground dark:bg-muted/15">
                <div className="mb-1 font-medium">{t("command.title")}</div>
                <code className="block whitespace-pre-wrap rounded bg-white px-2 py-1 font-mono text-[11px] text-foreground dark:bg-card">
                  {JSON.stringify(commandPreview)}
                </code>
              </div>

              <Field label={t("fields.gsp_action")}>
                <Select
                  value={action}
                  onValueChange={(value) => {
                    setAction(value as GspAction)
                    setError(null)
                    setResult(null)
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GSP_ACTIONS.map((item) => <SelectItem key={item.value} value={item.value}>{t(item.labelKey)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              {isGspSync ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t("fields.coeff_a")}><Input value={gsp.coeffA} onChange={(e) => setGsp((prev) => ({ ...prev, coeffA: e.target.value }))} /></Field>
                  <Field label={t("fields.coeff_b")}><Input value={gsp.coeffB} onChange={(e) => setGsp((prev) => ({ ...prev, coeffB: e.target.value }))} /></Field>
                  <Field label={t("fields.accuracy_error")}><Input value={gsp.accuracyError} onChange={(e) => setGsp((prev) => ({ ...prev, accuracyError: e.target.value }))} /></Field>
                  <Field label={t("fields.high_limit")}><Input value={gsp.highLimit} onChange={(e) => setGsp((prev) => ({ ...prev, highLimit: e.target.value }))} /></Field>
                  <Field label={t("fields.low_limit")}><Input value={gsp.lowLimit} onChange={(e) => setGsp((prev) => ({ ...prev, lowLimit: e.target.value }))} /></Field>
                  <Field label={t("fields.frequency")}><Input value={gsp.frequencyMinutes} onChange={(e) => setGsp((prev) => ({ ...prev, frequencyMinutes: e.target.value }))} /></Field>
                  <Field label={t("fields.delay_low")}><Input value={gsp.alarmDelayLowMinutes} onChange={(e) => setGsp((prev) => ({ ...prev, alarmDelayLowMinutes: e.target.value }))} /></Field>
                  <Field label={t("fields.delay_high")}><Input value={gsp.alarmDelayHighMinutes} onChange={(e) => setGsp((prev) => ({ ...prev, alarmDelayHighMinutes: e.target.value }))} /></Field>
                </div>
              ) : null}

              {showAdvanced && isGspSync ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                  <div className="mb-3 text-xs text-amber-800">{t("sync_warning")}</div>
                  <Field label={t("fields.channel")}><Input value={gsp.channel} onChange={(e) => setGsp((prev) => ({ ...prev, channel: e.target.value }))} /></Field>
                </div>
              ) : null}

              {isGspMemory ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t("fields.memory_count")}><Input value={gsp.memoryCount} onChange={(e) => setGsp((prev) => ({ ...prev, memoryCount: e.target.value }))} /></Field>
                  <Field label={t("fields.memory_offset")}><Input value={gsp.memoryOffset} onChange={(e) => setGsp((prev) => ({ ...prev, memoryOffset: e.target.value }))} placeholder="0" /></Field>
                </div>
              ) : null}

              {isGspRaw ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button type="button" variant={gsp.rawExactMode ? "outline" : "default"} size="sm" onClick={() => setGsp((prev) => ({ ...prev, rawExactMode: false }))}>
                      {t("actions.structured_raw")}
                    </Button>
                    <Button type="button" variant={gsp.rawExactMode ? "default" : "outline"} size="sm" onClick={() => setGsp((prev) => ({ ...prev, rawExactMode: true }))}>
                      {t("actions.exact_raw")}
                    </Button>
                  </div>
                  {!gsp.rawExactMode ? (
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label={t("fields.prefix")}>
                        <Input value={gsp.rawPrefix} onChange={(e) => setGsp((prev) => ({ ...prev, rawPrefix: e.target.value.toUpperCase() }))} placeholder="TEMP" className="font-mono" />
                      </Field>
                      <Field label={t("fields.serial")}>
                        <Input
                          value={gsp.rawSerial}
                          onChange={(e) => {
                            const nextRawSerial = e.target.value
                            setGsp((prev) => ({ ...prev, rawSerial: nextRawSerial }))
                            setSerial(nextRawSerial)
                          }}
                          placeholder={serial || "SPNB-26000001"}
                          className="font-mono"
                        />
                      </Field>
                      <Field label={t("fields.payload")}><Input value={gsp.rawPayload} onChange={(e) => setGsp((prev) => ({ ...prev, rawPayload: e.target.value }))} placeholder="25x" className="font-mono" /></Field>
                    </div>
                  ) : (
                    <Field label={t("fields.exact_command")}><Input value={gsp.rawExactCommand} onChange={(e) => setGsp((prev) => ({ ...prev, rawExactCommand: e.target.value }))} placeholder="TEMPSPNB-26000001 " className="font-mono" /></Field>
                  )}
                  <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground dark:bg-muted/15">
                    <div className="mb-1 font-medium">{t("command.prefixes")}</div>
                    <div className="font-mono">TEMP, FTEM, DD-H, DCON, MEMO, ED-H, ECON, CHAN</div>
                    <div className="mt-1 text-muted-foreground">{t("command.separator_help")}</div>
                    <div className="mt-1 text-muted-foreground">{t("command.payload_help")}</div>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          <Button onClick={submit} disabled={submitting || !serial.trim() || !serverHost.trim()} className="mt-6">
            {submitting ? t("actions.testing") : t("actions.test")}
          </Button>

          {consecutiveErrors >= 2 ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <div className="font-medium">{t("warning.title")}</div>
              <div className="mt-1">{t("warning.description")}</div>
              {isGspRaw ? <div className="mt-2">{t("warning.raw")}</div> : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
        <Card className="bg-white dark:bg-popover/95">
          <CardHeader><CardTitle>{t("results.title")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            {result ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultItem label={t("results.type")} value={result.sensorType} />
                <ResultItem label={t("results.serial")} value={result.serial} />
                <ResultItem label={t("results.action")} value={result.action} />
                <ResultItem label={t("results.port")} value={result.port || "-"} />
                <ResultItem label={t("results.address")} value={result.address || "-"} />
                <ResultItem label={t("results.module")} value={result.module || "-"} />
                <ResultItem label={t("results.command")} value={result.requestedCommand || "-"} />
                <ResultItem label={t("results.detected_sensors")} value={result.detectedSerials?.join(", ") || "-"} />
                <ResultItem label={t("results.value")} value={result.value != null ? String(result.value) : "-"} />
                <ResultItem label={t("results.unit")} value={result.unit || "-"} />
                {parsedResponse?.memoMeasureCount ? <ResultItem label={t("results.memo_measures")} value={parsedResponse.memoReturnedCount || String(parsedResponse.memoMeasureCount)} /> : null}
                {parsedResponse?.rssiRaw ? <ResultRssiItem value={parsedResponse.rssiRaw} label={t("results.signal")} /> : null}
                <ResultItem label={t("results.raw")} value={rawPreview} />
              </div>
            ) : <div className="text-sm text-muted-foreground">{t("results.empty")}</div>}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-popover/95">
          <CardHeader><CardTitle>{t("frames.title")}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <SectionTitleWithInfo title="TX" description={t("frames.tx_help")} />
                <Textarea value={parsedResponse?.tx.join("\n") || ""} readOnly rows={6} className="font-mono text-xs" />
              </div>
              <div>
                <SectionTitleWithInfo title="RX" description={t("frames.rx_help")} />
                <Textarea value={parsedResponse?.rx.join("\n\n") || ""} readOnly rows={8} className="font-mono text-xs" />
              </div>
              <div>
                <SectionTitleWithInfo title={t("frames.analysis")} description={t("frames.analysis_help")} />
                {parsedResponse?.parsed.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {parsedResponse.parsed.map((item, index) => <ResultItem key={`${item.label}-${index}`} label={item.label} value={item.value} />)}
                  </div>
                ) : <div className="text-sm text-muted-foreground">{t("frames.analysis_empty")}</div>}
              </div>
              <div className="pt-2">
                <SectionTitleWithInfo title={t("frames.journal")} description={t("frames.journal_help")} />
                <Textarea value={exchangeText} readOnly rows={12} className="font-mono text-xs" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-popover/95">
        <CardHeader>
          <CardTitle>{t("recent.title")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("recent.description")}{recentMeasuresSerial ? ` ${t("recent.target", { serial: recentMeasuresSerial })}` : ""}
          </p>
        </CardHeader>
        <CardContent>
          {recentMeasuresLoading ? <div className="text-sm text-muted-foreground">{t("recent.loading")}</div> : null}
          {!recentMeasuresLoading && recentMeasuresError ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">{recentMeasuresError}</div>
          ) : null}
          {!recentMeasuresLoading && !recentMeasuresError && recentMeasures.length > 0 ? (
            <div className="space-y-2">
              {recentMeasures.map((measure, index) => (
                <div key={`${measure.dateHeure}-${index}`} className="grid gap-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm md:grid-cols-[1.5fr_1fr_1fr] dark:bg-muted/15">
                  <div className="font-medium">{formatMeasureDate(measure.dateHeure)}</div>
                  <div>{measure.valeur !== null && measure.valeur !== undefined ? `${formatMeasureValue(measure.valeur)}${measure.unite ? ` ${measure.unite}` : ""}` : "-"}</div>
                  <div className="text-muted-foreground">{measure.etatAlarme || "-"}</div>
                </div>
              ))}
            </div>
          ) : null}
          {!recentMeasuresLoading && !recentMeasuresError && recentMeasures.length === 0 ? <div className="text-sm text-muted-foreground">{t("recent.start_hint")}</div> : null}
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="space-y-2 text-sm"><div className="font-medium text-foreground">{label}</div>{children}</label>
}

function HelpLine({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex gap-2 rounded-md border border-amber-200/70 bg-white/70 p-2 text-xs text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div><div className="font-medium">{title}</div><div>{children}</div></div>
    </div>
  )
}

function SectionTitleWithInfo({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <div className="text-sm font-medium">{title}</div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild><button type="button" className="inline-flex text-muted-foreground"><Info className="h-4 w-4" /></button></TooltipTrigger>
          <TooltipContent className="max-w-sm text-xs">{description}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

function ResultItem({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 dark:bg-muted/15"><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className="text-sm font-medium">{value}</div></div>
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

function formatMeasureDate(value: string) {
  return formatDbDateTime(value, { format: "dateTimeSeconds", fallback: value })
}

function formatMeasureValue(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : formatNumber(value, { decimals: 2, locale: "en-US", grouping: false })
}

function normalizeRawCommand(command: string) {
  const compact = (command || "").trim().replace(/\s+/g, " ")
  if (!compact) return ""
  if (compact.includes(" ")) return compact

  const upper = compact.toUpperCase()
  const prefix = RAW_COMMAND_PREFIXES.find((candidate) => upper.startsWith(candidate))
  if (!prefix) return compact

  const rest = compact.slice(prefix.length)
  if (!rest) return compact

  const splitByNSerial = rest.match(/^(N\d+)([A-Za-z].+)$/i)
  if (splitByNSerial) return `${prefix}${splitByNSerial[1]} ${splitByNSerial[2].trim()}`

  const splitByLongSerial = rest.match(/^([A-Za-z]\d{4,})([A-Za-z].+)$/)
  if (splitByLongSerial) return `${prefix}${splitByLongSerial[1]} ${splitByLongSerial[2].trim()}`

  return compact
}

function ResultRssiItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 dark:bg-muted/15">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 flex min-h-6 items-center"><TooltipProvider><RssiBars value={value} label={`RSSI : ${value}`} /></TooltipProvider></div>
    </div>
  )
}
