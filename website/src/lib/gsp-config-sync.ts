import { log } from "@/lib/logger"
import { getHotlineServerConfig } from "@/lib/hotline-config"
import { getSensorFamilyFromSerial } from "@/lib/sensor-naming"
import { getCompatEnv } from "@/lib/vigisensys-compat"

type GspConfigSyncInput = {
  serial?: string | null
  highLimit?: number | null
  lowLimit?: number | null
  frequencySeconds?: number | null
  highDelayMinutes?: number | null
  lowDelayMinutes?: number | null
  source: "create" | "update"
  idLieu?: number | null
}

function buildServerBaseUrl(serverHost: string, serverPort: number) {
  const raw = serverHost.trim()
  if (/^https?:\/\//i.test(raw)) {
    const url = new URL(raw)
    if (!url.port) url.port = String(serverPort)
    return url.toString().replace(/\/$/, "")
  }
  return `http://${raw}:${serverPort}`
}

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

export async function syncGspLocationConfiguration(input: GspConfigSyncInput) {
  const serial = input.serial?.trim()
  if (!serial || getSensorFamilyFromSerial(serial) !== "GSP") return { skipped: "not_gsp" as const }

  const frequencySeconds = input.frequencySeconds == null ? null : Math.max(60, Math.round(input.frequencySeconds))
  const hasPayload =
    isFiniteNumber(input.highLimit) ||
    isFiniteNumber(input.lowLimit) ||
    isFiniteNumber(frequencySeconds) ||
    isFiniteNumber(input.lowDelayMinutes) ||
    isFiniteNumber(input.highDelayMinutes)

  if (!hasPayload) return { skipped: "no_payload" as const }

  const config = await getHotlineServerConfig()
  const serverHost = config.serverHost?.trim() || process.env.HOTLINE_SERVER_HOST?.trim() || "127.0.0.1"
  const serverPort = config.serverPort || Number(process.env.HOTLINE_SERVER_PORT || 5310)
  if (!serverHost || !Number.isFinite(serverPort)) return { skipped: "no_hotline_server" as const }

  const headers: Record<string, string> = { "Content-Type": "application/json" }
  const apiKey = getCompatEnv("VIGISENSYS_HOTLINE_API_KEY", "VIGITEMP_HOTLINE_API_KEY")
  if (apiKey) {
    headers["x-vigisensys-hotline-key"] = apiKey
    headers["x-vigitemp-hotline-key"] = apiKey
  }

  const body = {
    sensorType: "GSP",
    serial,
    action: "sync-config",
    readTimeoutMs: 3000,
    writeTimeoutMs: 3000,
    gsp: {
      syncConfiguration: true,
      highLimit: isFiniteNumber(input.highLimit) ? input.highLimit : null,
      lowLimit: isFiniteNumber(input.lowLimit) ? input.lowLimit : null,
      frequencySeconds,
      alarmDelayLowMinutes: isFiniteNumber(input.lowDelayMinutes) ? Math.max(0, Math.round(input.lowDelayMinutes)) : null,
      alarmDelayHighMinutes: isFiniteNumber(input.highDelayMinutes) ? Math.max(0, Math.round(input.highDelayMinutes)) : null,
      listenWindowMs: 500,
    },
  }

  const response = await fetch(`${buildServerBaseUrl(serverHost, serverPort)}/api/hotline/sensor-test`, {
    method: "POST",
    headers,
    cache: "no-store",
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => null)
  const raw = data?.data ?? data
  const success = response.ok && (raw?.Success ?? raw?.success ?? data?.ok ?? false)
  const requestedCommand = raw?.RequestedCommand ?? raw?.requestedCommand ?? null

  if (!success) {
    log.warn("GSP_CONFIG_SYNC", "GSP ECON sync failed", {
      idLieu: input.idLieu,
      serial,
      source: input.source,
      requestedCommand,
      status: response.status,
      error: raw?.Error ?? raw?.error ?? data?.message ?? "unknown_error",
    })
    return { success: false, requestedCommand }
  }

  log.info("GSP_CONFIG_SYNC", "GSP ECON sync sent", {
    idLieu: input.idLieu,
    serial,
    source: input.source,
    requestedCommand,
  })
  return { success: true, requestedCommand }
}
