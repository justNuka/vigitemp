"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"
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

const GSP_ACTIONS: Array<{ value: GspAction; label: string }> = [
  { value: "read", label: "Lecture température" },
  { value: "force-read", label: "Forcer température" },
  { value: "sync-config", label: "Envoyer configuration" },
  { value: "read-config", label: "Lire configuration" },
  { value: "read-memory", label: "Lire mémoire" },
  { value: "raw", label: "Commande brute" },
]

export function HotlineSensorTestPanel() {
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
    frequencySeconds: "",
    alarmDelayMinutes: "",
    channel: "",
    memoryCount: "",
    memoryOffset: "",
    rawPrefix: "TEMP",
    rawSerial: "",
    rawPayload: "",
    rawExactMode: false,
    rawExactCommand: "",
  })

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
    const indexedMemoMatches =
      combined.match(/(?:^|\r?\n)\d+\|\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}=-?\d+(?:[.,]\d+)?(?=\r?\n|$)/g) ?? []
    const legacyMemoMatches =
      combined.match(/(?:^|\r?\n)\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}=-?\d+(?:[.,]\d+)?(?=\r?\n|$)/g) ?? []
    const memoMeasureCount = indexedMemoMatches.length || legacyMemoMatches.length

    const dateMatch = combined.match(/\b\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}\b/)
    if (dateMatch) {
      parsed.push({ label: "Date / heure", value: dateMatch[0] })
    }

    const tempMatch = combined.match(/RTEMP(N\d+)\s*:\s*(-?\d+(?:[.,]\d+)?)/i)
    if (tempMatch) {
      parsed.push({ label: `Temperature ${tempMatch[1]}`, value: tempMatch[2].replace(".", ",") + " °C" })
    }

    const forceTempMatch = combined.match(/ACK\s*:\s*R?FTEM(N\d+)\s*:\s*(-?\d+(?:[.,]\d+)?)/i)
    if (forceTempMatch) {
      parsed.push({ label: `Temperature forcée ${forceTempMatch[1]}`, value: forceTempMatch[2].replace(".", ",") + " C" })
    }

    const ackTempMatch = combined.match(/(?:^|\r?\n)Temperature=(-?\d+(?:[.,]\d+)?)(?:\r?\n|$)/i)
    if (ackTempMatch) {
      parsed.push({ label: "Temperature", value: ackTempMatch[1].replace(".", ",") + " C" })
    }

    const serialMatch = combined.match(/(?:^|\r?\n)Serial=([A-Z0-9\-]+)(?:\r?\n|$)/i)
    if (serialMatch) {
      parsed.push({ label: "Serial repondu", value: serialMatch[1] })
    }

    const memoOffsetMatch = combined.match(/(?:^|\r?\n)Offset=(\d+)(?:\r?\n|$)/i)
    if (memoOffsetMatch) {
      parsed.push({ label: "Offset MEMO", value: memoOffsetMatch[1] })
    }

    const memoReturnedCountMatch = combined.match(/(?:^|\r?\n)NombreMesure=(\d+)(?:\r?\n|$)/i)
    if (memoReturnedCountMatch) {
      parsed.push({ label: "NombreMesure", value: memoReturnedCountMatch[1] })
    }

    const batteryMatch = combined.match(/(?:^|\r?\n)Batterie=(-?\d+(?:[.,]\d+)?)(?:\r?\n|$)/i)
    if (batteryMatch) {
      parsed.push({ label: "Batterie", value: batteryMatch[1].replace(".", ",") })
    }

    const rssiMatch = combined.match(/(?:^|\r?\n)RSSI=(-?\d+(?:[.,]\d+)?)(?:\r?\n|$)/i)
    if (rssiMatch) {
      parsed.push({ label: "RSSI", value: rssiMatch[1].replace(".", ",") })
    }

    const alarmStateMatch = combined.match(/\b(no ALARME|ALARME BAS|ALARME HAUT)\b/i)
    if (alarmStateMatch) {
      parsed.push({ label: "Etat alarme", value: alarmStateMatch[1] })
    }

    for (const match of combined.matchAll(/Coef([AB])=(-?\d+(?:[.,]\d+)?)/gi)) {
      parsed.push({ label: `Coef ${match[1].toUpperCase()}`, value: match[2].replace(".", ",") })
    }

    const etalMatch = combined.match(/Etal=(-?\d+(?:[.,]\d+)?)/i)
    if (etalMatch) {
      parsed.push({ label: "Etal", value: etalMatch[1].replace(".", ",") })
    }

    const highMatch = combined.match(/LimiteHaute=(-?\d+(?:[.,]\d+)?)/i)
    if (highMatch) {
      parsed.push({ label: "Limite haute", value: highMatch[1].replace(".", ",") })
    }

    const lowMatch = combined.match(/LimiteBasse=(-?\d+(?:[.,]\d+)?)/i)
    if (lowMatch) {
      parsed.push({ label: "Limite basse", value: lowMatch[1].replace(".", ",") })
    }

    const frequencyMatch = combined.match(/Frequence=(-?\d+(?:[.,]\d+)?)/i)
    if (frequencyMatch) {
      parsed.push({ label: "Frequence", value: frequencyMatch[1].replace(".", ",") })
    }

    if (memoMeasureCount > 0) {
      parsed.push({ label: "Nb mesures MEMO", value: String(memoMeasureCount) })
    }

    return {
      tx,
      rx,
      parsed,
      memoMeasureCount,
      memoOffset: memoOffsetMatch?.[1],
      memoReturnedCount: memoReturnedCountMatch?.[1],
      rssiRaw: rssiMatch?.[1],
    }
  }, [result])

  const rawPreview = useMemo(() => {
    const raw = result?.rawValue?.trim()
    if (!raw) return "-"
    const normalized = raw.replace(/\s+/g, " ").trim()
    return normalized.length > 120 ? normalized.slice(0, 117) + "..." : normalized
  }, [result])

  const rawCommandValue = useMemo(() => {
    if (gsp.rawExactMode) {
      return gsp.rawExactCommand
    }

    const prefix = gsp.rawPrefix.trim()
    const rawSerial = gsp.rawSerial.trim()
    const payload = gsp.rawPayload.trim()
    if (!prefix && !rawSerial) return ""
    return payload ? `${prefix}${rawSerial} ${payload}` : `${prefix}${rawSerial}`
  }, [gsp.rawExactCommand, gsp.rawExactMode, gsp.rawPayload, gsp.rawPrefix, gsp.rawSerial])

  const commandPreview = useMemo(() => {
    if (!showGspFields) return "Commande generee selon le protocole de la sonde selectionnee."

    const target = serial.trim()
    if (!target) return "Renseignez un numéro de série pour voir la commande."

    switch (action) {
      case "read":
        return `TEMP${target}`
      case "force-read":
        return `FTEM${target}`
      case "read-config":
        return `DD-H${target}, DCAL${target}, DETA${target}, DCON${target}`
      case "read-memory":
        return `MEMO${target} ${(gsp.memoryCount || "1")}x${gsp.memoryOffset.trim() ? `${gsp.memoryOffset}o` : ""}`
      case "raw":
        return rawCommandValue || "Saisissez une commande GSP."
      case "sync-config":
        return `ED-H${target}..., ECAL${target}..., EETA${target}..., ECON${target}...`
      default:
        return ""
    }
  }, [action, gsp.memoryCount, rawCommandValue, serial, showGspFields])

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
          gsp: showGspFields
            ? {
                syncConfiguration: isGspSync,
                coeffA: parseOptionalNumber(gsp.coeffA),
                coeffB: parseOptionalNumber(gsp.coeffB),
                accuracyError: parseOptionalNumber(gsp.accuracyError),
                highLimit: parseOptionalNumber(gsp.highLimit),
                lowLimit: parseOptionalNumber(gsp.lowLimit),
                frequencySeconds: parseOptionalInteger(gsp.frequencySeconds),
                alarmDelayMinutes: parseOptionalInteger(gsp.alarmDelayMinutes),
                channel: gsp.channel.trim() || undefined,
                memoryCount: parseOptionalInteger(gsp.memoryCount),
                memoryOffset: parseOptionalInteger(gsp.memoryOffset),
                rawCommand: isGspRaw ? rawCommandValue : undefined,
                listenWindowMs: parseOptionalInteger(listenWindowMs),
              }
            : undefined,
        }),
      })

      const json = await response.json()
      if (!response.ok || !json?.ok) {
        setError(json?.message || "Le test a echoue")
        setConsecutiveErrors((prev) => prev + 1)
        setResult((json?.details as SensorTestResult | undefined) ?? null)
        return
      }

      setResult(json.data as SensorTestResult)
      setConsecutiveErrors(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Le test a echoue")
      setConsecutiveErrors((prev) => prev + 1)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-popover/95">
        <CardHeader>
          <CardTitle>Test manuel de sonde</CardTitle>
          <p className="text-sm text-muted-foreground">
            Interrogation directe via le serveur C# hotline. Si la sonde n'existe pas encore en base, utilisez un override manuel.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="IP / hote du serveur C#">
              <Input value={serverHost} onChange={(e) => setServerHost(e.target.value)} placeholder="127.0.0.1" />
            </Field>
            <Field label="Port API hotline">
              <Input value={serverPort} onChange={(e) => setServerPort(e.target.value)} placeholder="5310" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
              <Input
                value={serial}
                onChange={(e) => {
                  const nextSerial = e.target.value
                  setSerial(nextSerial)
                  setGsp((prev) => ({ ...prev, rawSerial: nextSerial }))
                }}
                placeholder="GSP0000001"
              />
            </Field>
          </div>

          <div className="rounded-md border border-border/60 bg-muted/20 p-4 dark:bg-muted/15">
            <div className="mb-3 text-sm font-medium">Override manuel de connexion</div>
            <div className="mb-3 text-xs text-muted-foreground">
              Laissez vide pour utiliser la base du serveur C#. Renseignez au minimum le port COM pour tester une sonde non encore creee en base.
            </div>
            <div className="grid gap-4 sm:grid-cols-1">
              <Field label="Port COM">
                <Input value={manualPort} onChange={(e) => setManualPort(e.target.value)} placeholder="COM101" />
              </Field>
            </div>
            <div className="mt-4">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAdvanced((prev) => !prev)}>
                {showAdvanced ? "Masquer les options avancées" : "Afficher les options avancées"}
              </Button>
            </div>
            {showAdvanced ? (
              <div className="mt-4 space-y-4 rounded-md border border-amber-200 bg-amber-50 p-4">
                <div className="text-xs text-amber-800">
                  Ne modifiez pas ces paramètres sans besoin réel. Le canal GSP et les paramètres série servent aux cas d'infrastructure ou de diagnostic avancés.
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Adresse">
                    <Input value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} placeholder="00000001" />
                  </Field>
                  <Field label="Module">
                    <Input value={manualModule} onChange={(e) => setManualModule(e.target.value)} placeholder="GSO-Exxxx" />
                  </Field>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <HelpLine title="Adresse">Identifiant additionnel du device si le protocole ne se limite pas au numero de série.</HelpLine>
                  <HelpLine title="Module">Information libre pour certains protocoles historiques. Inutile pour un test GSP simple.</HelpLine>
                  <HelpLine title="Baudrate">Vitesse de communication du port série. 9600 est la valeur par defaut testée.</HelpLine>
                  <HelpLine title="Parity">Controle d'erreur série. Laisser `None` sauf besoin constructeur explicite.</HelpLine>
                  <HelpLine title="Data bits">Taille des paquets série. En general `8`.</HelpLine>
                  <HelpLine title="Stop bits">Bits de fin de trame série. En general `One`.</HelpLine>
                  <HelpLine title="Read timeout">Temps d'attente maximal d'une réponse avant timeout.</HelpLine>
                  <HelpLine title="Write timeout">Temps maximal d'écriture avant echec d'envoi.</HelpLine>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Baudrate">
                    <Input value={baudRate} onChange={(e) => setBaudRate(e.target.value)} placeholder="9600" />
                  </Field>
                  <Field label="Parity">
                    <Select value={parity} onValueChange={setParity}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Odd">Odd</SelectItem>
                        <SelectItem value="Even">Even</SelectItem>
                        <SelectItem value="Mark">Mark</SelectItem>
                        <SelectItem value="Space">Space</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Data bits">
                    <Input value={dataBits} onChange={(e) => setDataBits(e.target.value)} placeholder="8" />
                  </Field>
                  <Field label="Stop bits">
                    <Select value={stopBits} onValueChange={setStopBits}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="One">One</SelectItem>
                        <SelectItem value="Two">Two</SelectItem>
                        <SelectItem value="OnePointFive">OnePointFive</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Read timeout (ms)">
                    <Input value={readTimeoutMs} onChange={(e) => setReadTimeoutMs(e.target.value)} placeholder="5000" />
                  </Field>
                  <Field label="Write timeout (ms)">
                    <Input value={writeTimeoutMs} onChange={(e) => setWriteTimeoutMs(e.target.value)} placeholder="5000" />
                  </Field>
                  {showGspFields ? (
                    <Field label="Temps d'ecoute (ms)">
                      <div className="space-y-2">
                        <Input value={listenWindowMs} onChange={(e) => setListenWindowMs(e.target.value)} placeholder="500" />
                        <div className="text-xs text-muted-foreground">
                          Temps de silence apres le dernier octet recu avant de considerer la reponse terminee.
                        </div>
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
                <div className="mb-1 font-medium">Commande envoyée</div>
                <code className="block whitespace-pre-wrap rounded bg-white px-2 py-1 font-mono text-[11px] text-foreground dark:bg-card">
                  {JSON.stringify(commandPreview)}
                </code>
              </div>

              <Field label="Action GSP">
                <Select
                  value={action}
                  onValueChange={(value) => {
                    setAction(value as GspAction)
                    setError(null)
                    setResult(null)
                  }}
                >
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

              {isGspSync ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Coeff a">
                    <Input value={gsp.coeffA} onChange={(e) => setGsp((prev) => ({ ...prev, coeffA: e.target.value }))} />
                  </Field>
                  <Field label="Coeff b">
                    <Input value={gsp.coeffB} onChange={(e) => setGsp((prev) => ({ ...prev, coeffB: e.target.value }))} />
                  </Field>
                  <Field label="Erreur de justesse">
                    <Input value={gsp.accuracyError} onChange={(e) => setGsp((prev) => ({ ...prev, accuracyError: e.target.value }))} />
                  </Field>
                  <Field label="Limite haute">
                    <Input value={gsp.highLimit} onChange={(e) => setGsp((prev) => ({ ...prev, highLimit: e.target.value }))} />
                  </Field>
                  <Field label="Limite basse">
                    <Input value={gsp.lowLimit} onChange={(e) => setGsp((prev) => ({ ...prev, lowLimit: e.target.value }))} />
                  </Field>
                  <Field label="Frequence (s)">
                    <Input value={gsp.frequencySeconds} onChange={(e) => setGsp((prev) => ({ ...prev, frequencySeconds: e.target.value }))} />
                  </Field>
                  <Field label="Retard alarme (min)">
                    <Input value={gsp.alarmDelayMinutes} onChange={(e) => setGsp((prev) => ({ ...prev, alarmDelayMinutes: e.target.value }))} />
                  </Field>
                </div>
              ) : null}

              {showAdvanced && isGspSync ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                  <div className="mb-3 text-xs text-amber-800">
                    Ne modifiez le canal que pour des cas d'infrastructure multi-clients ou sur instruction explicite. Une mauvaise valeur peut faire chevaucher des installations et empêcher leur bon fonctionnement.
                  </div>
                  <Field label="Canal GSP">
                    <Input value={gsp.channel} onChange={(e) => setGsp((prev) => ({ ...prev, channel: e.target.value }))} />
                  </Field>
                </div>
              ) : null}

              {isGspMemory ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nombre de lignes memoire">
                    <Input value={gsp.memoryCount} onChange={(e) => setGsp((prev) => ({ ...prev, memoryCount: e.target.value }))} />
                  </Field>
                  <Field label="Offset memoire">
                    <Input value={gsp.memoryOffset} onChange={(e) => setGsp((prev) => ({ ...prev, memoryOffset: e.target.value }))} placeholder="0" />
                  </Field>
                </div>
              ) : null}

              {isGspRaw ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={gsp.rawExactMode ? "outline" : "default"}
                      size="sm"
                      onClick={() => setGsp((prev) => ({ ...prev, rawExactMode: false }))}
                    >
                      Prefixe + serie + payload
                    </Button>
                    <Button
                      type="button"
                      variant={gsp.rawExactMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGsp((prev) => ({ ...prev, rawExactMode: true }))}
                    >
                      Commande exacte
                    </Button>
                  </div>
                  {!gsp.rawExactMode ? (
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="Prefixe">
                        <Input
                          value={gsp.rawPrefix}
                          onChange={(e) => setGsp((prev) => ({ ...prev, rawPrefix: e.target.value.toUpperCase() }))}
                          placeholder="TEMP"
                          className="font-mono"
                        />
                      </Field>
                      <Field label="Numero de serie">
                        <Input
                          value={gsp.rawSerial}
                          onChange={(e) => {
                            const nextRawSerial = e.target.value
                            setGsp((prev) => ({ ...prev, rawSerial: nextRawSerial }))
                            setSerial(nextRawSerial)
                          }}
                          placeholder={serial || "N0000001"}
                          className="font-mono"
                        />
                      </Field>
                      <Field label="Payload">
                        <Input
                          value={gsp.rawPayload}
                          onChange={(e) => setGsp((prev) => ({ ...prev, rawPayload: e.target.value }))}
                          placeholder="25x"
                          className="font-mono"
                        />
                      </Field>
                    </div>
                  ) : (
                    <Field label="Commande exacte">
                      <Input
                        value={gsp.rawExactCommand}
                        onChange={(e) => setGsp((prev) => ({ ...prev, rawExactCommand: e.target.value }))}
                        placeholder="TEMPN0000002 "
                        className="font-mono"
                      />
                    </Field>
                  )}
                  <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground dark:bg-muted/15">
                    <div className="mb-1 font-medium">Préfixes disponibles</div>
                    <div className="font-mono">TEMP, FTEM, DD-H, DCAL, DETA, DCON, MEMO, ED-H, ECAL, EETA, ECON, CHAN</div>
                    <div className="mt-1 text-muted-foreground">Pour les commandes avec séparateur, utiliser `-` et non `/`.</div>
                    <div className="mt-1 text-muted-foreground">Les payloads sont séparés de la commande par un espace.</div>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          <Button onClick={submit} disabled={submitting || !serial.trim() || !serverHost.trim()} className="mt-6">
            {submitting ? "Test en cours..." : "Lancer le test"}
          </Button>

          {consecutiveErrors >= 2 ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <div className="font-medium">Vérification recommandée</div>
              <div className="mt-1">
                Plusieurs erreurs consecutives ont été détectées. Vérifiez le numéro de série, le port COM, le type de sonde et les
                paramètres utilisés.
              </div>
              {isGspRaw ? (
                <div className="mt-2">
                  En commande brute, ajoutez un espace apres le numero de série si nécessaire pour reproduire le comportement valide.
                </div>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
        <Card className="bg-white dark:bg-popover/95">
          <CardHeader>
            <CardTitle>Résultats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

            {result ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultItem label="Type" value={result.sensorType} />
                <ResultItem label="Serie" value={result.serial} />
                <ResultItem label="Action" value={result.action} />
                <ResultItem label="Port" value={result.port || "-"} />
                <ResultItem label="Adresse" value={result.address || "-"} />
                <ResultItem label="Module" value={result.module || "-"} />
                <ResultItem label="Commande" value={result.requestedCommand || "-"} />
                <ResultItem label="Sondes detectees" value={result.detectedSerials?.join(", ") || "-"} />
                <ResultItem label="Valeur" value={result.value != null ? String(result.value) : "-"} />
                <ResultItem label="Unite" value={result.unit || "-"} />
                {parsedResponse?.memoMeasureCount ? (
                  <ResultItem
                    label="Mesures MEMO"
                    value={parsedResponse.memoReturnedCount || String(parsedResponse.memoMeasureCount)}
                  />
                ) : null}
                {parsedResponse?.rssiRaw ? <ResultRssiItem value={parsedResponse.rssiRaw} /> : null}
                <ResultItem label="Brut" value={rawPreview} />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Aucun résultat pour le moment.</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-popover/95">
          <CardHeader>
            <CardTitle>Trames TX/RX</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <SectionTitleWithInfo
                  title="TX"
                  description="Trames envoyées au module ou à la sonde. Cela permet de vérifier la commande exacte transmise."
                />
                <Textarea value={parsedResponse?.tx.join("\n") || ""} readOnly rows={6} className="font-mono text-xs" />
              </div>
              <div>
                <SectionTitleWithInfo
                  title="RX"
                  description="Trames reçues depuis le module ou la sonde. Cela permet de vérifier la réponse brute avant interprétation."
                />
                <Textarea value={parsedResponse?.rx.join("\n\n") || ""} readOnly rows={8} className="font-mono text-xs" />
              </div>
              <div>
                <SectionTitleWithInfo
                  title="Analyse"
                  description="Extraction lisible des informations détectées dans la reponse brute, sans supprimer les trames TX/RX."
                />
                {parsedResponse?.parsed.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {parsedResponse.parsed.map((item, index) => (
                      <ResultItem key={`${item.label}-${index}`} label={item.label} value={item.value} />
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Aucune information parsée pour le moment.</div>
                )}  
              </div>
              <div className="pt-2">
                <SectionTitleWithInfo
                  title="Journal complet"
                  description="Vue brute complète des échanges, utile pour le diagnostic fin ou la comparaison avec l’outil de test constructeur."
                />
                <Textarea value={exchangeText} readOnly rows={12} className="font-mono text-xs" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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

function HelpLine({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex gap-2 rounded-md border border-amber-200/70 bg-white/70 p-2 text-xs text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div>
        <div className="font-medium">{title}</div>
        <div>{children}</div>
      </div>
    </div>
  )
}

function SectionTitleWithInfo({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <div className="text-sm font-medium">{title}</div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="inline-flex text-muted-foreground">
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm text-xs">{description}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

function ResultItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 dark:bg-muted/15">
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

function ResultRssiItem({ value }: { value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 dark:bg-muted/15">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">Signal</div>
      <div className="mt-1 flex min-h-6 items-center">
        <TooltipProvider>
          <RssiBars value={value} label={`RSSI : ${value}`} />
        </TooltipProvider>
      </div>
    </div>
  )
}
