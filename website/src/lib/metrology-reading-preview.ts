import { getHotlineServerConfig } from "@/lib/hotline-config"
import { prisma, prismaMesure } from "@/lib/prisma"

const DEFAULT_SERVER_PORT = 5310

export type MetrologyPreviewReading = {
  sensorId: number
  serialNumber: string
  value: number | null
  rawValue: string | null
  unit: string | null
  measuredAt: string
  source: "GSP" | "GSO"
  error: string | null
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
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

function normalizeSerialPortName(value: string | null | undefined) {
  const trimmed = value?.trim()
  if (!trimmed) return undefined
  if (/^\d+$/.test(trimmed)) return `COM${trimmed}`
  const match = /^COM\s*(\d+)$/i.exec(trimmed)
  return match ? `COM${match[1]}` : trimmed
}

async function readGsp(
  sensor: {
    id: number
    serialNumber: string
    address: string | null
    unit: string | null
    moduleName: string | null
    modulePort: string | null
  },
  operationContext: "AJUSTAGE" | "ETALONNAGE",
): Promise<MetrologyPreviewReading> {
  const measuredAt = new Date().toISOString()
  const config = await getHotlineServerConfig()
  const serverHost = config.serverHost?.trim() || process.env.HOTLINE_SERVER_HOST?.trim() || "127.0.0.1"
  const serverPort = config.serverPort || Number(process.env.HOTLINE_SERVER_PORT || DEFAULT_SERVER_PORT)

  try {
    const response = await fetch(`${buildServerBaseUrl(serverHost, serverPort)}/api/hotline/sensor-test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        sensorType: "GSP",
        serial: sensor.serialNumber,
        action: "read",
        operationContext,
        manualPort: normalizeSerialPortName(sensor.modulePort),
        manualAddress: sensor.address?.trim() || undefined,
        manualModule: sensor.moduleName?.trim() || undefined,
        readTimeoutMs: 6000,
        writeTimeoutMs: 4000,
        gsp: { listenWindowMs: 500 },
      }),
    })
    const payload = await response.json().catch(() => null)
    const raw = payload?.data ?? payload ?? {}
    const success = response.ok && Boolean(raw?.Success ?? raw?.success ?? payload?.ok ?? false)

    return {
      sensorId: sensor.id,
      serialNumber: sensor.serialNumber,
      value: success ? asFiniteNumber(raw?.Value) : null,
      rawValue: raw?.RawValue == null ? null : String(raw.RawValue),
      unit: raw?.Unit == null ? sensor.unit : String(raw.Unit),
      measuredAt,
      source: "GSP",
      error: success ? null : String(raw?.Error ?? raw?.error ?? payload?.message ?? "Lecture impossible"),
    }
  } catch (error) {
    return {
      sensorId: sensor.id,
      serialNumber: sensor.serialNumber,
      value: null,
      rawValue: null,
      unit: sensor.unit,
      measuredAt,
      source: "GSP",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function readGso(sensor: {
  id: number
  serialNumber: string
  address: string | null
  unit: string | null
}): Promise<MetrologyPreviewReading> {
  const row = await prismaMesure.tm_mesures.findFirst({
    where: {
      OR: [
        { Sonde_Numero_Serie: sensor.serialNumber },
        ...(sensor.address ? [{ Adresse_Sonde: sensor.address }] : []),
      ],
    },
    orderBy: [{ Date_Heure_Mesure: "desc" }, { Id_Mesure: "desc" }],
    select: {
      Valeur: true,
      Valeur_Brute: true,
      Unite: true,
      Date_Heure_Mesure: true,
    },
  })

  return {
    sensorId: sensor.id,
    serialNumber: sensor.serialNumber,
    value: asFiniteNumber(row?.Valeur),
    rawValue: row?.Valeur_Brute == null ? null : String(row.Valeur_Brute),
    unit: row?.Unite?.trim() || sensor.unit,
    measuredAt: row?.Date_Heure_Mesure.toISOString() ?? new Date().toISOString(),
    source: "GSO",
    error: row ? null : "Aucune mesure disponible",
  }
}

export async function readMetrologySensorsPreview(
  selectedSensorIds: number[],
  operationContext: "AJUSTAGE" | "ETALONNAGE",
) {
  const ids = [...new Set(selectedSensorIds)]
  const rows = await prisma.t_sonde.findMany({
    where: { Id_Sonde: { in: ids } },
    select: {
      Id_Sonde: true,
      Adresse_Sonde: true,
      Sonde_Numero_Serie: true,
      Id_Module: true,
      Est_Sonde_GSO: true,
      t_sonde_type: { select: { Unite: true } },
    },
  })
  if (rows.length !== ids.length) throw new Error("Une ou plusieurs sondes sont introuvables.")

  const moduleIds = rows.map((row) => row.Id_Module).filter((id): id is number => typeof id === "number")
  const modules = moduleIds.length
    ? await prisma.t_module.findMany({
        where: { Id_Module: { in: moduleIds } },
        select: { Id_Module: true, Module_Numero_Serie: true, Emplacement: true, Port_Serie: true },
      })
    : []
  const modulesById = new Map(modules.map((module) => [module.Id_Module, module]))
  const readings: Record<number, MetrologyPreviewReading> = {}

  // Sequential reads let the C# server serialize access to shared COM ports.
  for (const row of rows) {
    const serialNumber = row.Sonde_Numero_Serie?.trim()
    if (!serialNumber) continue
    const moduleRow = row.Id_Module == null ? null : modulesById.get(row.Id_Module)
    const sensor = {
      id: row.Id_Sonde,
      serialNumber,
      address: row.Adresse_Sonde,
      unit: row.t_sonde_type?.Unite?.trim() || null,
      moduleName: moduleRow?.Module_Numero_Serie ?? moduleRow?.Emplacement ?? null,
      modulePort: moduleRow?.Port_Serie ?? null,
    }
    readings[row.Id_Sonde] = row.Est_Sonde_GSO
      ? await readGso(sensor)
      : await readGsp(sensor, operationContext)
  }

  return { readings, readAt: new Date().toISOString() }
}
