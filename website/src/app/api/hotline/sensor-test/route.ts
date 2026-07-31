import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { apiError, apiOk } from "@/lib/api-response"
import { getCompatEnv } from "@/lib/vigisensys-compat"

const gspSchema = z.object({
  syncConfiguration: z.boolean().optional(),
  coeffA: z.number().nullable().optional(),
  coeffB: z.number().nullable().optional(),
  accuracyError: z.number().nullable().optional(),
  highLimit: z.number().nullable().optional(),
  lowLimit: z.number().nullable().optional(),
  frequencySeconds: z.number().int().nullable().optional(),
  alarmDelayMinutes: z.number().int().nullable().optional(),
  alarmDelayLowMinutes: z.number().int().nullable().optional(),
  alarmDelayHighMinutes: z.number().int().nullable().optional(),
  channel: z.string().optional(),
  memoryCount: z.number().int().nullable().optional(),
  memoryOffset: z.number().int().nullable().optional(),
  customCommandPrefix: z.string().optional(),
  customPayload: z.string().optional(),
  rawCommand: z.string().optional(),
  listenWindowMs: z.number().int().positive().nullable().optional(),
}).optional()

const bodySchema = z.object({
  serverHost: z.string().trim().min(1),
  serverPort: z.number().int().min(1).max(65535).default(5310),
  sensorType: z.string().trim().min(1),
  serial: z.string().trim().min(1),
  action: z.string().trim().min(1).default("read"),
  manualPort: z.string().trim().optional(),
  manualAddress: z.string().trim().optional(),
  manualModule: z.string().trim().optional(),
  baudRate: z.number().int().positive().optional(),
  parity: z.string().trim().optional(),
  dataBits: z.number().int().positive().optional(),
  stopBits: z.string().trim().optional(),
  readTimeoutMs: z.number().int().positive().optional(),
  writeTimeoutMs: z.number().int().positive().optional(),
  gsp: gspSchema,
})

function buildServerBaseUrl(serverHost: string, serverPort: number) {
  const raw = serverHost.trim()
  if (/^https?:\/\//i.test(raw)) {
    const url = new URL(raw)
    if (!url.port) {
      url.port = String(serverPort)
    }
    return url.toString().replace(/\/$/, "")
  }

  return `http://${raw}:${serverPort}`
}

function normalizeResult(raw: Record<string, unknown>) {
  const detectedSerials = raw.DetectedSerials ?? raw.detectedSerials
  const exchanges = raw.Exchanges ?? raw.exchanges

  return {
    success: Boolean(raw.Success ?? raw.success ?? false),
    error: raw.Error ?? raw.error ?? null,
    sensorType: raw.SensorType ?? raw.sensorType ?? null,
    serial: raw.Serial ?? raw.serial ?? null,
    action: raw.Action ?? raw.action ?? null,
    requestedCommand: raw.RequestedCommand ?? raw.requestedCommand ?? null,
    port: raw.Port ?? raw.port ?? null,
    address: raw.Address ?? raw.address ?? null,
    module: raw.Module ?? raw.module ?? null,
    detectedSerials: Array.isArray(detectedSerials)
      ? detectedSerials.map((value: unknown) => String(value))
      : [],
    value: raw.Value ?? raw.value ?? null,
    unit: raw.Unit ?? raw.unit ?? null,
    rawValue: raw.RawValue ?? raw.rawValue ?? null,
    exchanges: Array.isArray(exchanges)
      ? exchanges.map((exchange: Record<string, unknown>) => ({
          direction: String(exchange.Direction ?? exchange.direction ?? ""),
          format: String(exchange.Format ?? exchange.format ?? ""),
          content: String(exchange.Content ?? exchange.content ?? ""),
        }))
      : [],
  }
}

function sensorTestFailure(message: string, details?: unknown) {
  return NextResponse.json({
    ok: false,
    error: "sensor_test_failed",
    message,
    details,
  })
}

function getSensorTestTimeoutMs(payload: z.infer<typeof bodySchema>) {
  const readTimeout = payload.readTimeoutMs ?? 10_000
  const writeTimeout = payload.writeTimeoutMs ?? 10_000
  const listenWindow = payload.gsp?.listenWindowMs ?? 0
  const sensorType = payload.sensorType.trim().toUpperCase()
  const action = payload.action.trim().toLowerCase()

  let commandBudget = 1
  if (sensorType === "GSP") {
    if (action === "read-config") commandBudget = 2
    else if (action === "sync-config") commandBudget = payload.gsp?.channel?.trim() ? 3 : 2
    else if (action === "read-memory") commandBudget = 2
  }

  const perCommandBudget = readTimeout + writeTimeout + listenWindow
  const overhead = 20_000 + commandBudget * 5_000
  return Math.min(Math.max(perCommandBudget * commandBudget + overhead, 20_000), 180_000)
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return apiError(400, "validation_error", "Parametres invalides", {
        issues: parsed.error.issues,
      })
    }

    const payload = parsed.data
    const baseUrl = buildServerBaseUrl(payload.serverHost, payload.serverPort)
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    const apiKey = getCompatEnv("VIGISENSYS_HOTLINE_API_KEY", "VIGITEMP_HOTLINE_API_KEY")
    if (apiKey) {
      headers["x-vigisensys-hotline-key"] = apiKey
      headers["x-vigitemp-hotline-key"] = apiKey
    }

    const timeoutMs = getSensorTestTimeoutMs(payload)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    let response: Response

    try {
      response = await fetch(`${baseUrl}/api/hotline/sensor-test`, {
        method: "POST",
        headers,
        cache: "no-store",
        signal: controller.signal,
        body: JSON.stringify({
          serial: payload.serial,
          sensorType: payload.sensorType,
          action: payload.action,
          manualPort: payload.manualPort?.trim() || undefined,
          manualAddress: payload.manualAddress?.trim() || undefined,
          manualModule: payload.manualModule?.trim() || undefined,
          baudRate: payload.baudRate,
          parity: payload.parity?.trim() || undefined,
          dataBits: payload.dataBits,
          stopBits: payload.stopBits?.trim() || undefined,
          readTimeoutMs: payload.readTimeoutMs,
          writeTimeoutMs: payload.writeTimeoutMs,
          gsp: payload.gsp ?? undefined,
        }),
      })
    } finally {
      clearTimeout(timeout)
    }

    const data = await response.json().catch(() => null)
    if (!data) {
      return sensorTestFailure("Le serveur d'interrogation a renvoyé une réponse invalide")
    }

    const raw = data.data ?? data
    const normalized = normalizeResult(raw)
    if (data.ok === false) {
      return sensorTestFailure(String(normalized.error || data.message || "Test sonde echoué"), normalized)
    }

    if (!response.ok || !normalized.success) {
      return sensorTestFailure(String(normalized.error || data.message || "Test sonde echoué"), normalized)
    }

    return apiOk(normalized)
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return sensorTestFailure("Le test sonde a depassé le délai d'attente côté web")
    }

    return apiError(500, "sensor_test_failed", "Impossible d'executer le test sonde", {
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
