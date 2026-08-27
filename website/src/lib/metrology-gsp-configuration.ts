import { getHotlineServerConfig } from "@/lib/hotline-config"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { getSensorFamilyFromSerial } from "@/lib/sensor-naming"

const DEFAULT_SERVER_PORT = 5310
const COEFFICIENT_EPSILON = 1e-12
const LEGACY_DISABLED_LIMIT = 999

export type GspMetrologyConfigurationMode =
  | "adjustment-neutral"
  | "calibration-without-accuracy"
  | "normal"

type GspRuntimeConfiguration = {
  sensorId: number
  serial: string
  address: string | null
  modulePort: string
  moduleName: string | null
  coeffX2: number
  coeffX: number
  coeffConstant: number
  offset: number
  accuracyError: number
  applyAccuracyError: boolean
  highLimit: number | null
  highLimitActive: boolean
  lowLimit: number | null
  lowLimitActive: boolean
  frequencySeconds: number
  alarmDelayLowMinutes: number
  alarmDelayHighMinutes: number
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

function asFiniteNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (value != null) {
    const parsed = Number(String(value).replace(",", "."))
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
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

function normalizeCommandTarget(value: string) {
  const trimmed = value.trim().toUpperCase()
  if (/^SP[A-Z0-9]{2}-\d+$/.test(trimmed)) return trimmed
  if (trimmed.startsWith("GSP") && trimmed.length > 3) return trimmed.slice(3)
  return trimmed
}

function findFirmwareOverflowField(response: string) {
  const match = /(?:^|\r?\n)\s*([A-Za-z][A-Za-z0-9_]*)\s*=\s*ovf\b/i.exec(response)
  return match?.[1]?.trim() || null
}

function formatCoefficient(value: number) {
  const normalized = Math.abs(value) < 0.00000000005 ? 0 : value
  return normalized.toFixed(10)
}

function formatCorrection(value: number) {
  const normalized = Math.abs(value) < 0.005 ? 0 : value
  return normalized.toFixed(2)
}

function formatLimit(value: number | null, active: boolean) {
  if (!active || value == null || !Number.isFinite(value) || Math.abs(value - LEGACY_DISABLED_LIMIT) < 1e-9) {
    return "NAN"
  }
  return String(Number(value.toFixed(6)))
}

function buildEconPayload(config: GspRuntimeConfiguration, mode: GspMetrologyConfigurationMode) {
  let coeffA: number
  let coeffB: number
  let coeffC: number
  let offset: number
  let accuracyError: number
  let multipoint: 0 | 1

  if (mode === "adjustment-neutral") {
    coeffA = 1
    coeffB = 0
    coeffC = 0
    offset = 0
    accuracyError = 0
    multipoint = 0
  } else {
    const isMultipoint = Math.abs(config.coeffX2) > COEFFICIENT_EPSILON
    multipoint = isMultipoint ? 1 : 0
    coeffA = isMultipoint ? config.coeffX2 : config.coeffX
    coeffB = isMultipoint ? config.coeffX : config.coeffConstant
    coeffC = isMultipoint ? config.coeffConstant : 0
    offset = config.offset
    accuracyError =
      mode === "calibration-without-accuracy"
        ? 0
        : config.applyAccuracyError
          ? config.accuracyError
          : 0
  }

  const frequencyMinutes = Math.max(1, Math.round(Math.max(1, config.frequencySeconds) / 60))

  return [
    `${formatCoefficient(coeffA)}a`,
    `${formatCoefficient(coeffB)}b`,
    `${formatCoefficient(coeffC)}c`,
    `${formatCorrection(offset)}d`,
    `${formatCorrection(accuracyError)}e`,
    `${multipoint}m`,
    `${formatLimit(config.highLimit, config.highLimitActive)}h`,
    `${formatLimit(config.lowLimit, config.lowLimitActive)}l`,
    `${frequencyMinutes}f`,
    `${Math.max(0, Math.round(config.alarmDelayLowMinutes))}r`,
    `${Math.max(0, Math.round(config.alarmDelayHighMinutes))}t`,
  ].join("")
}

async function loadConfigurations(sensorIds: number[], mode: GspMetrologyConfigurationMode) {
  const ids = [...new Set(sensorIds.filter((id) => Number.isInteger(id) && id > 0))]
  if (ids.length === 0) return []

  const sensors = await prisma.t_sonde.findMany({
    where: { Id_Sonde: { in: ids } },
    select: {
      Id_Sonde: true,
      Sonde_Numero_Serie: true,
      Adresse_Sonde: true,
      Sonde_Offset: true,
      Id_Module: true,
      Est_Sonde_GSO: true,
      Surveillance_Etat: true,
      Frequence_Mesure: true,
      t_lieu: {
        where: { Est_Archive: false },
        select: {
          Id_Lieu: true,
          Lieu_Etat: true,
          Tolerance_Surveillance_Sup: true,
          Est_Consigne_Sup_Active: true,
          Tolerance_Surveillance_Inf: true,
          Est_Consigne_Inf_Active: true,
          Frequence: true,
          Retard_Alarme_Bas: true,
          Retard_Alarme_Haut: true,
          Est_Correction_Ej: true,
        },
      },
    },
  })

  if (sensors.length !== ids.length) {
    throw new Error("Une ou plusieurs sondes GSP a configurer sont introuvables.")
  }

  const gspSensors = sensors.filter((sensor) => {
    const serial = sensor.Sonde_Numero_Serie?.trim() || ""
    return !sensor.Est_Sonde_GSO && getSensorFamilyFromSerial(serial) === "GSP"
  })
  if (gspSensors.length === 0) return []

  if (mode !== "normal") {
    const alreadyInMetrology = gspSensors.find((sensor) => ["A", "E"].includes(sensor.Surveillance_Etat))
    if (alreadyInMetrology) {
      const serial = alreadyInMetrology.Sonde_Numero_Serie?.trim() || `#${alreadyInMetrology.Id_Sonde}`
      throw new Error(`La GSP ${serial} est deja utilisee par une operation de metrologie.`)
    }
  }

  const moduleIds = [...new Set(gspSensors.map((sensor) => sensor.Id_Module).filter((id): id is number => id != null))]
  const modules = moduleIds.length
    ? await prisma.t_module.findMany({
        where: { Id_Module: { in: moduleIds } },
        select: { Id_Module: true, Module_Numero_Serie: true, Emplacement: true, Port_Serie: true },
      })
    : []
  const modulesById = new Map(modules.map((moduleRow) => [moduleRow.Id_Module, moduleRow]))

  const serials = gspSensors
    .map((sensor) => sensor.Sonde_Numero_Serie?.trim())
    .filter((serial): serial is string => Boolean(serial))

  const [adjustments, calibrations] = await Promise.all([
    prisma.t_ajustage.findMany({
      where: { Sonde_Numero_Serie: { in: serials } },
      orderBy: [{ Date_Heure_Ajustage: "desc" }, { Id_Ajustage: "desc" }],
      select: { Sonde_Numero_Serie: true, Coeff_X2: true, Coeff_X: true, Coeff_Constant: true },
    }),
    prisma.t_etalonnage.findMany({
      where: { Sonde_Numero_Serie: { in: serials } },
      orderBy: [{ Date_Heure_Etalonnage: "desc" }, { Id_Etalonnage: "desc" }],
      select: { Sonde_Numero_Serie: true, Err_Justesse: true },
    }),
  ])

  const latestAdjustmentBySerial = new Map<string, (typeof adjustments)[number]>()
  for (const adjustment of adjustments) {
    const serial = adjustment.Sonde_Numero_Serie?.trim()
    if (serial && !latestAdjustmentBySerial.has(serial)) latestAdjustmentBySerial.set(serial, adjustment)
  }
  const latestCalibrationBySerial = new Map<string, (typeof calibrations)[number]>()
  for (const calibration of calibrations) {
    const serial = calibration.Sonde_Numero_Serie?.trim()
    if (serial && !latestCalibrationBySerial.has(serial)) latestCalibrationBySerial.set(serial, calibration)
  }

  return gspSensors.map((sensor): GspRuntimeConfiguration => {
    const serial = sensor.Sonde_Numero_Serie?.trim()
    if (!serial) throw new Error("Une sonde GSP ne possede pas de numero de serie.")
    const moduleRow = sensor.Id_Module == null ? null : modulesById.get(sensor.Id_Module) ?? null
    const modulePort = normalizeSerialPortName(moduleRow?.Port_Serie)
    if (!modulePort) throw new Error(`Aucun port serie n'est configure pour la GSP ${serial}.`)

    const location = sensor.t_lieu.find((item) => item.Lieu_Etat === "S") ?? sensor.t_lieu[0] ?? null

    const adjustment = latestAdjustmentBySerial.get(serial)
    const calibration = latestCalibrationBySerial.get(serial)

    return {
      sensorId: sensor.Id_Sonde,
      serial,
      address: sensor.Adresse_Sonde?.trim() || null,
      modulePort,
      moduleName: moduleRow?.Module_Numero_Serie ?? moduleRow?.Emplacement ?? null,
      coeffX2: asFiniteNumber(adjustment?.Coeff_X2, 0),
      coeffX: asFiniteNumber(adjustment?.Coeff_X, 1),
      coeffConstant: asFiniteNumber(adjustment?.Coeff_Constant, 0),
      offset: asFiniteNumber(sensor.Sonde_Offset, 0),
      accuracyError: asFiniteNumber(calibration?.Err_Justesse, 0),
      applyAccuracyError: Number(location?.Est_Correction_Ej ?? 0) === 1,
      highLimit:
        location?.Tolerance_Surveillance_Sup == null ? null : Number(location.Tolerance_Surveillance_Sup),
      highLimitActive: Boolean(location?.Est_Consigne_Sup_Active),
      lowLimit:
        location?.Tolerance_Surveillance_Inf == null ? null : Number(location.Tolerance_Surveillance_Inf),
      lowLimitActive: Boolean(location?.Est_Consigne_Inf_Active),
      frequencySeconds: Math.max(1, location?.Frequence ?? sensor.Frequence_Mesure ?? 60),
      alarmDelayLowMinutes: Math.max(0, location?.Retard_Alarme_Bas ?? 0),
      alarmDelayHighMinutes: Math.max(0, location?.Retard_Alarme_Haut ?? 0),
    }
  })
}

async function sendConfiguration(
  config: GspRuntimeConfiguration,
  mode: GspMetrologyConfigurationMode,
  operationContext: "AJUSTAGE" | "ETALONNAGE",
) {
  const hotline = await getHotlineServerConfig()
  const serverHost = hotline.serverHost?.trim() || process.env.HOTLINE_SERVER_HOST?.trim() || "127.0.0.1"
  const serverPort = hotline.serverPort || Number(process.env.HOTLINE_SERVER_PORT || DEFAULT_SERVER_PORT)
  if (!serverHost || !Number.isFinite(serverPort)) {
    throw new Error("Serveur d'interrogation GSP non configure.")
  }

  const target = normalizeCommandTarget(config.address || config.serial)
  const payload = buildEconPayload(config, mode)
  const rawCommand = `ECON${target} ${payload}`

  const response = await fetch(`${buildServerBaseUrl(serverHost, serverPort)}/api/hotline/sensor-test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      sensorType: "GSP",
      serial: config.serial,
      action: "raw",
      operationContext,
      manualPort: config.modulePort,
      manualAddress: config.address || undefined,
      manualModule: config.moduleName || undefined,
      readTimeoutMs: 10_000,
      writeTimeoutMs: 4_000,
      gsp: {
        rawCommand,
        listenWindowMs: 1_500,
      },
    }),
  })

  const body = (await response.json().catch(() => null)) as HotlinePayload | null
  const data = body?.data
  const rawResponse = String(data?.RawValue ?? data?.rawValue ?? "")
  const acknowledged = /(?:^|\r?\n)\s*ACK\s*=\s*ECON\b/i.test(rawResponse)
  const overflowField = findFirmwareOverflowField(rawResponse)

  // ECON est une commande de configuration : un ACK explicite du firmware reste
  // la source de verite, mais un champ `*=ovf` signifie que le firmware n'a pas
  // pu stocker la valeur et doit donc être considéré comme un échec explicite.
  if (!response.ok || !acknowledged || overflowField) {
    const reason = overflowField
      ? `le firmware signale un dépassement sur le paramètre ${overflowField}`
      : String(data?.Error ?? data?.error ?? body?.message ?? "ACK ECON absent")
    throw new Error(`ECON refuse pour ${config.serial}: ${reason}`)
  }

  log.info("METROLOGY_GSP", "econ_applied", {
    sensorId: config.sensorId,
    serial: config.serial,
    mode,
    operationContext,
  })
}

export async function applyGspMetrologyConfiguration(
  sensorIds: number[],
  mode: GspMetrologyConfigurationMode,
  operationContext: "AJUSTAGE" | "ETALONNAGE",
) {
  const configurations = await loadConfigurations(sensorIds, mode)
  for (const config of configurations) {
    await sendConfiguration(config, mode, operationContext)
  }
  return configurations.map((config) => config.sensorId)
}