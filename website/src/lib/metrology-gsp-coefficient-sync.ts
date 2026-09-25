import { hasMainDbColumn } from "@/lib/db-schema"
import { getHotlineServerConfig } from "@/lib/hotline-config"
import { log } from "@/lib/logger"
import {
  mapGspPhysicalCoefficientsToStorage,
  parseGspCoefficientResponse,
  type GspPhysicalCoefficients,
  type GspStoredCoefficients,
} from "@/lib/metrology-gsp-coefficients"
import { getTableReference, isMssqlProvider, quoteIdentifier } from "@/lib/metrology-db"
import { prisma } from "@/lib/prisma"
import { getSensorFamilyFromSerial } from "@/lib/sensor-naming"

const DEFAULT_SERVER_PORT = 5310
const DIRTY_COLUMN = "Coeffs_Modifies_Depuis_Derniere_Mesure"

export type GspCoefficientTarget = {
  sensorId: number | null
  serialNumber: string
  address: string | null
  modulePort: string
  moduleName: string | null
  unit: string | null
}

export type RetrievedGspCoefficients = {
  sensorId: number | null
  serialNumber: string
  physical: GspPhysicalCoefficients
  stored: GspStoredCoefficients
  adjustmentId: number | null
}

type HotlinePayload = {
  ok?: boolean
  message?: string | null
  data?: {
    Success?: boolean
    success?: boolean
    Error?: string | null
    error?: string | null
    RawValue?: string | null
    rawValue?: string | null
  }
}

export class GspCoefficientReadError extends Error {
  readonly serial: string

  constructor(serial: string, message?: string) {
    super(message || `La sonde ${serial} n'a pas répondu à la lecture de ses coefficients.`)
    this.name = "GspCoefficientReadError"
    this.serial = serial
  }
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
  if (!trimmed) return null
  if (/^\d+$/.test(trimmed)) return `COM${trimmed}`
  const match = /^COM\s*(\d+)$/i.exec(trimmed)
  return match ? `COM${match[1]}` : trimmed
}

async function resolveServer() {
  const hotline = await getHotlineServerConfig()
  const serverHost = hotline.serverHost?.trim() || process.env.HOTLINE_SERVER_HOST?.trim() || "127.0.0.1"
  const serverPort = hotline.serverPort || Number(process.env.HOTLINE_SERVER_PORT || DEFAULT_SERVER_PORT)
  if (!serverHost || !Number.isFinite(serverPort)) {
    throw new Error("Serveur d'interrogation GSP non configuré.")
  }
  return { serverHost, serverPort }
}

export async function readGspCoefficientsFromTarget(
  target: GspCoefficientTarget,
  operationContext: "AJUSTAGE" | "ETALONNAGE",
): Promise<RetrievedGspCoefficients> {
  const { serverHost, serverPort } = await resolveServer()
  const response = await fetch(`${buildServerBaseUrl(serverHost, serverPort)}/api/hotline/sensor-test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      sensorType: "GSP",
      serial: target.serialNumber,
      action: "read-config",
      operationContext,
      manualPort: normalizeSerialPortName(target.modulePort),
      manualAddress: target.address?.trim() || undefined,
      manualModule: target.moduleName?.trim() || undefined,
      readTimeoutMs: 10_000,
      writeTimeoutMs: 4_000,
      gsp: { listenWindowMs: 1_500 },
    }),
  })

  const body = (await response.json().catch(() => null)) as HotlinePayload | null
  const data = body?.data
  const rawValue = String(data?.RawValue ?? data?.rawValue ?? "")
  const reportedError = String(data?.Error ?? data?.error ?? body?.message ?? "").trim()
  const success = response.ok && Boolean(data?.Success ?? data?.success ?? body?.ok ?? false)

  if (!success || !rawValue.trim()) {
    throw new GspCoefficientReadError(
      target.serialNumber,
      reportedError || `La sonde ${target.serialNumber} n'a pas répondu à la lecture de ses coefficients.`,
    )
  }

  const physical = parseGspCoefficientResponse(rawValue)
  if (!physical) {
    throw new GspCoefficientReadError(
      target.serialNumber,
      `La réponse DCON de la sonde ${target.serialNumber} ne contient pas de coefficients A/B exploitables.`,
    )
  }

  const stored = mapGspPhysicalCoefficientsToStorage(physical)
  return {
    sensorId: target.sensorId,
    serialNumber: target.serialNumber,
    physical,
    stored,
    adjustmentId: null,
  }
}

async function clearAdjustmentDirtyFlag(adjustmentId: number) {
  if (!(await hasMainDbColumn("t_ajustage", DIRTY_COLUMN))) return
  const sql = isMssqlProvider()
    ? `UPDATE ${getTableReference("t_ajustage")} SET ${quoteIdentifier(DIRTY_COLUMN)} = @P1 WHERE ${quoteIdentifier("Id_Ajustage")} = @P2`
    : `UPDATE ${getTableReference("t_ajustage")} SET ${quoteIdentifier(DIRTY_COLUMN)} = ? WHERE ${quoteIdentifier("Id_Ajustage")} = ?`
  await prisma.$executeRawUnsafe(sql, 0, adjustmentId)
}

export async function persistRetrievedGspCoefficients(
  retrieved: RetrievedGspCoefficients,
  unit: string | null,
) {
  const latest = await prisma.t_ajustage.findFirst({
    where: { Sonde_Numero_Serie: retrieved.serialNumber },
    orderBy: [{ Date_Heure_Ajustage: "desc" }, { Id_Ajustage: "desc" }],
    select: { Id_Ajustage: true },
  })

  const adjustment = latest
    ? await prisma.t_ajustage.update({
        where: { Id_Ajustage: latest.Id_Ajustage },
        data: {
          Coeff_X2: retrieved.stored.coeffX2,
          Coeff_X: retrieved.stored.coeffX,
          Coeff_Constant: retrieved.stored.coeffConstant,
          ...(unit ? { Unite: unit } : {}),
        },
        select: { Id_Ajustage: true },
      })
    : await prisma.t_ajustage.create({
        data: {
          Date_Heure_Ajustage: new Date(),
          Sonde_Numero_Serie: retrieved.serialNumber,
          Coeff_X2: retrieved.stored.coeffX2,
          Coeff_X: retrieved.stored.coeffX,
          Coeff_Constant: retrieved.stored.coeffConstant,
          Unite: unit,
        },
        select: { Id_Ajustage: true },
      })

  await clearAdjustmentDirtyFlag(adjustment.Id_Ajustage)
  retrieved.adjustmentId = adjustment.Id_Ajustage

  log.info("METROLOGY_GSP", "coefficients_retrieved", {
    sensorId: retrieved.sensorId,
    serial: retrieved.serialNumber,
    adjustmentId: adjustment.Id_Ajustage,
    coeffA: retrieved.physical.coeffA,
    coeffB: retrieved.physical.coeffB,
    coeffC: retrieved.physical.coeffC,
    multipoint: retrieved.physical.multipoint,
  })

  return retrieved
}

async function loadGspCoefficientTargets(sensorIds: number[]): Promise<GspCoefficientTarget[]> {
  const ids = [...new Set(sensorIds.filter((id) => Number.isInteger(id) && id > 0))]
  if (ids.length === 0) return []

  const sensors = await prisma.t_sonde.findMany({
    where: { Id_Sonde: { in: ids } },
    select: {
      Id_Sonde: true,
      Sonde_Numero_Serie: true,
      Adresse_Sonde: true,
      Id_Module: true,
      Est_Sonde_GSO: true,
      t_sonde_type: { select: { Unite: true } },
    },
  })

  if (sensors.length !== ids.length) {
    throw new Error("Une ou plusieurs sondes sélectionnées sont introuvables.")
  }

  const gspSensors = sensors.filter((sensor) => {
    const serial = sensor.Sonde_Numero_Serie?.trim() || ""
    return !sensor.Est_Sonde_GSO && getSensorFamilyFromSerial(serial) === "GSP"
  })
  if (gspSensors.length === 0) return []

  const moduleIds = [...new Set(gspSensors.map((sensor) => sensor.Id_Module).filter((id): id is number => id != null))]
  const modules = moduleIds.length
    ? await prisma.t_module.findMany({
        where: { Id_Module: { in: moduleIds } },
        select: { Id_Module: true, Module_Numero_Serie: true, Emplacement: true, Port_Serie: true },
      })
    : []
  const moduleById = new Map(modules.map((moduleRow) => [moduleRow.Id_Module, moduleRow]))

  return gspSensors.map((sensor) => {
    const serialNumber = sensor.Sonde_Numero_Serie?.trim()
    if (!serialNumber) throw new Error("Une GSP sélectionnée ne possède pas de numéro de série.")
    const moduleRow = sensor.Id_Module == null ? null : moduleById.get(sensor.Id_Module) ?? null
    const modulePort = normalizeSerialPortName(moduleRow?.Port_Serie)
    if (!modulePort) {
      throw new Error(`Aucun port série n'est configuré pour la GSP ${serialNumber}.`)
    }

    return {
      sensorId: sensor.Id_Sonde,
      serialNumber,
      address: sensor.Adresse_Sonde?.trim() || null,
      modulePort,
      moduleName: moduleRow?.Module_Numero_Serie ?? moduleRow?.Emplacement ?? null,
      unit: sensor.t_sonde_type?.Unite?.trim() || null,
    }
  })
}

export async function synchronizeGspCoefficientsFromSensors(
  sensorIds: number[],
  operationContext: "AJUSTAGE" | "ETALONNAGE",
) {
  const targets = await loadGspCoefficientTargets(sensorIds)
  const results: RetrievedGspCoefficients[] = []

  // Les lectures DCON restent séquentielles : plusieurs GSP peuvent partager le même port/module.
  for (const target of targets) {
    const retrieved = await readGspCoefficientsFromTarget(target, operationContext)
    results.push(await persistRetrievedGspCoefficients(retrieved, target.unit))
  }

  return results
}
