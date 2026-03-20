import { NextRequest } from "next/server"
import { z } from "zod"

import { apiError, apiOk } from "@/lib/api-response"

const gspSchema = z.object({
  syncConfiguration: z.boolean().optional(),
  coeffA: z.number().nullable().optional(),
  coeffB: z.number().nullable().optional(),
  accuracyError: z.number().nullable().optional(),
  highLimit: z.number().nullable().optional(),
  lowLimit: z.number().nullable().optional(),
  frequencySeconds: z.number().int().nullable().optional(),
  alarmDelayMinutes: z.number().int().nullable().optional(),
  channel: z.string().optional(),
  memoryCount: z.number().int().nullable().optional(),
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

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return apiError(400, "validation_error", "Paramètres invalides", {
        issues: parsed.error.issues,
      })
    }

    const payload = parsed.data
    const baseUrl = buildServerBaseUrl(payload.serverHost, payload.serverPort)
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    const apiKey = process.env.VIGITEMP_HOTLINE_API_KEY?.trim()
    if (apiKey) {
      headers["x-vigitemp-hotline-key"] = apiKey
    }

    const response = await fetch(`${baseUrl}/api/hotline/sensor-test`, {
      method: "POST",
      headers,
      cache: "no-store",
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

    const data = await response.json().catch(() => null)
    if (!response.ok || !data) {
      return apiError(502, "sensor_test_failed", "Le serveur C# de test a renvoyé une erreur", {
        details: data,
      })
    }

    if (data.ok === false) {
      return apiError(400, "sensor_test_failed", data.data?.error || data.message || "Test sonde echoué", {
        details: data.data ?? data,
      })
    }

    const raw = data.data ?? data
    return apiOk({
      success: raw.Success ?? raw.success ?? false,
      error: raw.Error ?? raw.error ?? null,
      sensorType: raw.SensorType ?? raw.sensorType ?? null,
      serial: raw.Serial ?? raw.serial ?? null,
      action: raw.Action ?? raw.action ?? null,
      requestedCommand: raw.RequestedCommand ?? raw.requestedCommand ?? null,
      port: raw.Port ?? raw.port ?? null,
      address: raw.Address ?? raw.address ?? null,
      module: raw.Module ?? raw.module ?? null,
      detectedSerials: Array.isArray(raw.DetectedSerials ?? raw.detectedSerials)
        ? (raw.DetectedSerials ?? raw.detectedSerials).map((value: unknown) => String(value))
        : [],
      value: raw.Value ?? raw.value ?? null,
      unit: raw.Unit ?? raw.unit ?? null,
      rawValue: raw.RawValue ?? raw.rawValue ?? null,
      exchanges: Array.isArray(raw.Exchanges ?? raw.exchanges)
        ? (raw.Exchanges ?? raw.exchanges).map((exchange: Record<string, unknown>) => ({
            direction: String(exchange.Direction ?? exchange.direction ?? ""),
            format: String(exchange.Format ?? exchange.format ?? ""),
            content: String(exchange.Content ?? exchange.content ?? ""),
          }))
        : [],
    })
  } catch (error) {
    return apiError(500, "sensor_test_failed", "Impossible d'exécuter le test sonde", {
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
