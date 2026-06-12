import { randomUUID } from "crypto"

import { log } from "@/lib/logger"
import { getHotlineServerConfig } from "@/lib/hotline-config"
import { getSensorFamilyFromSerial } from "@/lib/sensor-naming"
import { inferStandardTypeCode } from "@/lib/standard-types"
import { prisma, prismaMesure } from "@/lib/prisma"
import { buildAdjustmentExportFileName } from "@/lib/adjustment-export"
import { hasMainDbColumn } from "@/lib/db-schema"
import { getTableReference, isMssqlProvider, quoteIdentifier } from "@/lib/metrology-db"
import type { AdjustmentSensorRow } from "@/hooks/useAdjustmentSensors"
import type { JWTPayload } from "@/lib/jwt"

const DEFAULT_SERVER_PORT = 5310
const DEFAULT_SERVER_BDD_ID = 1
const DEFAULT_LOOP_INTERVAL_MS = 10_000
const EXTRA_LOOP_INTERVAL_MS = 2_000

type PointIndex = 1 | 2
type SessionStatus = "idle" | "running" | "completed" | "cancelled" | "failed"

type RuntimeReading = {
  value: number | null
  rawValue: string | null
  unit: string | null
  error: string | null
  measuredAt: string
}

type PlateauSample = {
  measuredAt: string
  value: number | null
  rawValue: string | null
}

type ValidatedPoint = {
  pointIndex: PointIndex
  targetValue: number
  startedAt: string
  completedAt: string
  standardAverage: number | null
  sensorAverages: Record<number, number | null>
}

type RunningPoint = {
  pointIndex: PointIndex
  targetValue: number
  startedAt: number
  standardSamples: PlateauSample[]
  sensorSamples: Record<number, PlateauSample[]>
  lastStandardValue: number | null
}

type ManagedSensor = AdjustmentSensorRow & {
  address: string | null
  previousSensorState: string
  previousLocationState: string | null
  previousLocationStateN1: string | null
  previousCoeffX: number
  previousCoeffConstant: number
}

type PersistedAdjustment = {
  sensorId: number
  serialNumber: string
  adjustmentId: number
  exportFileName: string
  exportUrl: string
}

type AdjustmentSession = {
  id: string
  userId: number
  username: string
  userProfile: string
  startedAt: string
  operator: string
  displayDecimals: number
  standardId: number
  standardSerial: string
  standardType: string | null
  standardModuleId: number | null
  standardModuleName: string | null
  standardPort: string
  standardOrganization: string | null
  standardCertificateDate: string | null
  standardCertificateNumber: string | null
  standardUnit: string | null
  standardResolution: string | null
  standardDecimals: number | null
  standardUncertainty: number | null
  standardIsExternal: boolean
  mediumId: number | null
  plateauDurationMinutes: number
  plateauMaxGap: number
  sensors: ManagedSensor[]
  status: SessionStatus
  stopRequested: boolean
  latestStandardReading: RuntimeReading | null
  latestSensorReadings: Record<number, RuntimeReading>
  currentPoint: RunningPoint | null
  validatedPoints: Partial<Record<PointIndex, ValidatedPoint>>
  message: string | null
  lastError: string | null
  lastUpdatedAt: string
  persistedAdjustments: PersistedAdjustment[]
  loopTimer: ReturnType<typeof setTimeout> | null
}

type StartAdjustmentInput = {
  selectedSensorIds: number[]
  operator: string
  displayDecimals: number
  standardId: number
  mediumId: number | null
  plateauDurationMinutes: number
  plateauMaxGap: number
}

type PublicSession = {
  id: string
  status: SessionStatus
  startedAt: string
  operator: string
  displayDecimals: number
  standardId: number
  standardSerial: string
  standardType: string | null
  standardModuleId: number | null
  standardModuleName: string | null
  standardOrganization: string | null
  standardCertificateDate: string | null
  standardCertificateNumber: string | null
  standardUnit: string | null
  standardResolution: string | null
  standardDecimals: number | null
  standardUncertainty: number | null
  standardIsExternal: boolean
  mediumId: number | null
  plateauDurationMinutes: number
  plateauMaxGap: number
  sensors: Array<{
    id: number
    serialNumber: string
    locationId: number | null
    locationName: string | null
    moduleId: number | null
    moduleName: string | null
    modulePort: string | null
  }>
  latestStandardReading: RuntimeReading | null
  latestSensorReadings: Record<number, RuntimeReading>
  currentPoint: {
    pointIndex: PointIndex
    targetValue: number
    startedAt: string
  } | null
  validatedPoints: Partial<Record<PointIndex, ValidatedPoint>>
  message: string | null
  lastError: string | null
  canStartPointTwo: boolean
  hasValidatedPoint: boolean
  persistedAdjustments: PersistedAdjustment[]
  lastUpdatedAt: string
}

type HotlineReadRequest = {
  serial: string
  manualPort?: string | null
  manualAddress?: string | null
  manualModule?: string | null
}

type HotlineReadResult = RuntimeReading

type GlobalAdjustmentState = {
  sessionsByUserId?: Map<number, AdjustmentSession>
  sensorLocks?: Map<number, string>
}

const globalState = globalThis as typeof globalThis & GlobalAdjustmentState
const sessionsByUserId = (globalState.sessionsByUserId ??= new Map<number, AdjustmentSession>())
const sensorLocks = (globalState.sensorLocks ??= new Map<number, string>())

function buildServerBaseUrl(serverHost: string, serverPort: number) {
  const raw = serverHost.trim()
  if (/^https?:\/\//i.test(raw)) {
    const url = new URL(raw)
    if (!url.port) url.port = String(serverPort)
    return url.toString().replace(/\/$/, "")
  }
  return `http://${raw}:${serverPort}`
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function nowIso() {
  return new Date().toISOString()
}

function formatDecimalValue(value: unknown, maxFractionDigits = 6): string | null {
  if (value === null || value === undefined || value === "") return null
  const parsed =
    typeof value === "number"
      ? value
      : Number(String(value).replace(",", "."))
  if (!Number.isFinite(parsed)) return null
  return parsed.toFixed(maxFractionDigits).replace(/\.?0+$/, "")
}

function roundValue(value: number | null, decimals: number) {
  if (value == null || !Number.isFinite(value)) return null
  const factor = 10 ** Math.max(0, Math.min(decimals, 6))
  return Math.round(value * factor) / factor
}

function averageValues(values: Array<number | null>, decimals: number) {
  const numbers = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value))
  if (numbers.length === 0) return null
  const average = numbers.reduce((sum, value) => sum + value, 0) / numbers.length
  return roundValue(average, decimals)
}

async function ensureAdjustmentStateExists() {
  const state = await prisma.t_etat_surveillance.findUnique({
    where: { Surveillance_Etat: "A" },
    select: { Surveillance_Etat: true },
  })

  if (!state) {
    throw new Error("L'etat de surveillance 'A' est absent de la base.")
  }
}

async function updateSensorMetrologyFlags(
  sensorIds: number[],
  values: {
    metrologyInProgress?: number
    metrologyCommandSent?: number
  },
) {
  if (sensorIds.length === 0) return

  const assignments: string[] = []
  const params: number[] = []

  if (values.metrologyInProgress !== undefined && (await hasMainDbColumn("t_sonde", "Metrologie_En_Cours"))) {
    assignments.push(
      `${quoteIdentifier("Metrologie_En_Cours")} = ${isMssqlProvider() ? `@P${params.length + 1}` : "?"}`,
    )
    params.push(values.metrologyInProgress)
  }

  if (values.metrologyCommandSent !== undefined && (await hasMainDbColumn("t_sonde", "Metrologie_cmd_envoyee"))) {
    assignments.push(
      `${quoteIdentifier("Metrologie_cmd_envoyee")} = ${isMssqlProvider() ? `@P${params.length + 1}` : "?"}`,
    )
    params.push(values.metrologyCommandSent)
  }

  if (assignments.length === 0) return

  const idList = sensorIds.join(",")
  const sql = `UPDATE ${getTableReference("t_sonde")} SET ${assignments.join(", ")} WHERE ${quoteIdentifier("Id_Sonde")} IN (${idList})`
  await prisma.$executeRawUnsafe(sql, ...params)
}

async function readHotlineGspMeasurement(request: HotlineReadRequest): Promise<HotlineReadResult> {
  const config = await getHotlineServerConfig()
  const serverHost = config.serverHost?.trim() || process.env.HOTLINE_SERVER_HOST?.trim() || "127.0.0.1"
  const serverPort = config.serverPort || Number(process.env.HOTLINE_SERVER_PORT || DEFAULT_SERVER_PORT)

  if (!serverHost || !Number.isFinite(serverPort)) {
    return {
      value: null,
      rawValue: null,
      unit: null,
      error: "Serveur hotline non configure",
      measuredAt: nowIso(),
    }
  }

  const response = await fetch(`${buildServerBaseUrl(serverHost, serverPort)}/api/hotline/sensor-test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      sensorType: "GSP",
      serial: request.serial,
      action: "read",
      manualPort: request.manualPort?.trim() || undefined,
      manualAddress: request.manualAddress?.trim() || undefined,
      manualModule: request.manualModule?.trim() || undefined,
      readTimeoutMs: 6000,
      writeTimeoutMs: 4000,
      gsp: { listenWindowMs: 500 },
    }),
  }).catch((error) => {
    throw new Error(error instanceof Error ? error.message : String(error))
  })

  const payload = await response.json().catch(() => null)
  const raw = payload?.data ?? payload ?? {}
  const success = response.ok && Boolean(raw?.Success ?? raw?.success ?? payload?.ok ?? false)
  const measuredAt = nowIso()

  if (!success) {
    return {
      value: null,
      rawValue: raw?.RawValue == null ? null : String(raw.RawValue),
      unit: raw?.Unit == null ? null : String(raw.Unit),
      error: String(raw?.Error ?? raw?.error ?? payload?.message ?? "Lecture impossible"),
      measuredAt,
    }
  }

  return {
    value: asFiniteNumber(raw?.Value),
    rawValue: raw?.RawValue == null ? null : String(raw.RawValue),
    unit: raw?.Unit == null ? null : String(raw.Unit),
    error: null,
    measuredAt,
  }
}

async function persistAdjustmentReading(serial: string, reading: RuntimeReading) {
  await prismaMesure.tm_mesure_calibrage.create({
    data: {
      Id_Serveur_BDD: DEFAULT_SERVER_BDD_ID,
      Sonde_Numero_Serie: serial,
      Valeur: reading.value ?? 0,
      Valeur_Brute: reading.value ?? 0,
      Est_Valeur_Null: reading.value == null ? 1 : 0,
      Date_Heure: new Date(reading.measuredAt),
    },
  })
}

async function persistStandardReading(serial: string, reading: RuntimeReading) {
  await prismaMesure.tm_mesure_calibrage_etalon.create({
    data: {
      Id_Serveur_BDD: DEFAULT_SERVER_BDD_ID,
      Etalon_Numero_Serie: serial,
      Valeur: reading.value ?? 0,
      Valeur_Brute: reading.value ?? 0,
      Est_Valeur_Null: reading.value == null ? 1 : 0,
      Date_Heure: new Date(reading.measuredAt),
    },
  })
}

function toPublicSession(session: AdjustmentSession): PublicSession {
  return {
    id: session.id,
    status: session.status,
    startedAt: session.startedAt,
    operator: session.operator,
    displayDecimals: session.displayDecimals,
    standardId: session.standardId,
    standardSerial: session.standardSerial,
    standardType: session.standardType,
    standardModuleId: session.standardModuleId,
    standardModuleName: session.standardModuleName,
    standardOrganization: session.standardOrganization,
    standardCertificateDate: session.standardCertificateDate,
    standardCertificateNumber: session.standardCertificateNumber,
    standardUnit: session.standardUnit,
    standardResolution: session.standardResolution,
    standardDecimals: session.standardDecimals,
    standardUncertainty: session.standardUncertainty,
    standardIsExternal: session.standardIsExternal,
    mediumId: session.mediumId,
    plateauDurationMinutes: session.plateauDurationMinutes,
    plateauMaxGap: session.plateauMaxGap,
    sensors: session.sensors.map((sensor) => ({
      id: sensor.id,
      serialNumber: sensor.serialNumber,
      locationId: sensor.locationId,
      locationName: sensor.locationName,
      moduleId: sensor.moduleId,
      moduleName: sensor.moduleName,
      modulePort: sensor.modulePort,
    })),
    latestStandardReading: session.latestStandardReading,
    latestSensorReadings: session.latestSensorReadings,
    currentPoint: session.currentPoint
      ? {
          pointIndex: session.currentPoint.pointIndex,
          targetValue: session.currentPoint.targetValue,
          startedAt: new Date(session.currentPoint.startedAt).toISOString(),
        }
      : null,
    validatedPoints: session.validatedPoints,
    message: session.message,
    lastError: session.lastError,
    canStartPointTwo: Boolean(session.validatedPoints[1]) && !session.validatedPoints[2] && !session.currentPoint,
    hasValidatedPoint: Boolean(session.validatedPoints[1] || session.validatedPoints[2]),
    persistedAdjustments: session.persistedAdjustments,
    lastUpdatedAt: session.lastUpdatedAt,
  }
}

function computeLinearAdjustment(pointOne: ValidatedPoint, pointTwo: ValidatedPoint, sensorId: number) {
  const rawValueOne = pointOne.sensorAverages[sensorId]
  const rawValueTwo = pointTwo.sensorAverages[sensorId]
  const standardValueOne = pointOne.standardAverage
  const standardValueTwo = pointTwo.standardAverage

  if (
    rawValueOne == null ||
    rawValueTwo == null ||
    standardValueOne == null ||
    standardValueTwo == null ||
    rawValueOne === rawValueTwo
  ) {
    return null
  }

  // Legacy Vigitemp formula kept verbatim for adjustment export/storage consistency:
  // Coeff_X = (MesureEtalon2 - MesureEtalon1) / (ResistanceSonde2 - ResistanceSonde1)
  const coeffX = (standardValueTwo - standardValueOne) / (rawValueTwo - rawValueOne)
  const coeffConstant = standardValueOne - coeffX * rawValueOne

  if (!Number.isFinite(coeffX) || !Number.isFinite(coeffConstant)) {
    return null
  }

  return {
    coeffX,
    coeffConstant,
    rawValueOne,
    rawValueTwo,
    standardValueOne,
    standardValueTwo,
    correctedValueOne: coeffX * rawValueOne + coeffConstant,
    correctedValueTwo: coeffX * rawValueTwo + coeffConstant,
  }
}

async function persistFinalAdjustments(session: AdjustmentSession) {
  const pointOne = session.validatedPoints[1]
  const pointTwo = session.validatedPoints[2]
  if (!pointOne || !pointTwo) return []

  const adjustedAt = new Date()
  const createdRows = await prisma.$transaction(async (tx) => {
    const rows: PersistedAdjustment[] = []
    for (const sensor of session.sensors) {
      const result = computeLinearAdjustment(pointOne, pointTwo, sensor.id)
      if (!result) {
        throw new Error(`Impossible de calculer les coefficients d'ajustage pour ${sensor.serialNumber}.`)
      }

      const row = await tx.t_ajustage.create({
        data: {
          Date_Heure_Ajustage: adjustedAt,
          Sonde_Numero_Serie: sensor.serialNumber,
          Coeff_X2: 0,
          Coeff_X: result.coeffX,
          Coeff_Constant: result.coeffConstant,
          Unite: session.standardUnit,
          Nb_Decimale: session.displayDecimals,
          Operateur: session.operator,
          SE_Numero: session.standardSerial,
          SE_Organisme: session.standardOrganization,
          SE_Date_Certif: session.standardCertificateDate ? new Date(session.standardCertificateDate) : null,
          SE_Numero_Certif: session.standardCertificateNumber,
          Mesure_Etalon1: result.standardValueOne,
          Mesure_Etalon2: result.standardValueTwo,
          Valeur_Brute1: result.rawValueOne,
          Valeur_Brute2: result.rawValueTwo,
          Ancienne_Mesure1: sensor.previousCoeffX * result.rawValueOne + sensor.previousCoeffConstant,
          Ancienne_Mesure2: sensor.previousCoeffX * result.rawValueTwo + sensor.previousCoeffConstant,
          Nouvelle_Mesure1: result.correctedValueOne,
          Nouvelle_Mesure2: result.correctedValueTwo,
          Id_Milieu: session.mediumId,
        },
      })

      rows.push({
        sensorId: sensor.id,
        serialNumber: sensor.serialNumber,
        adjustmentId: row.Id_Ajustage,
        exportFileName: buildAdjustmentExportFileName(sensor.serialNumber, adjustedAt),
        exportUrl: `/api/metrologie/ajustage/export/${row.Id_Ajustage}`,
      } satisfies PersistedAdjustment)
    }
    return rows
  })

  return createdRows
}

async function restoreSessionStates(session: AdjustmentSession) {
  const sensorUpdates = session.sensors.map((sensor) =>
    prisma.t_sonde.update({
      where: { Id_Sonde: sensor.id },
      data: {
        Surveillance_Etat: sensor.previousSensorState,
      },
    }),
  )

  const locationMap = new Map<number, { previousState: string | null; previousStateN1: string | null }>()
  for (const sensor of session.sensors) {
    if (!sensor.locationId) continue
    if (locationMap.has(sensor.locationId)) continue
    locationMap.set(sensor.locationId, {
      previousState: sensor.previousLocationState,
      previousStateN1: sensor.previousLocationStateN1,
    })
  }

  const locationUpdates = Array.from(locationMap.entries()).map(([locationId, value]) =>
    prisma.t_lieu.update({
      where: { Id_Lieu: locationId },
      data: {
        Lieu_Etat: value.previousState ?? "D",
        Lieu_Etat_N1: value.previousStateN1,
      },
    }),
  )

  await prisma.$transaction([...sensorUpdates, ...locationUpdates])
  await updateSensorMetrologyFlags(
    session.sensors.map((sensor) => sensor.id),
    {
      metrologyInProgress: 0,
      metrologyCommandSent: 0,
    },
  )
}

function releaseSensorLocks(session: AdjustmentSession) {
  for (const sensor of session.sensors) {
    if (sensorLocks.get(sensor.id) === session.id) {
      sensorLocks.delete(sensor.id)
    }
  }
}

async function finalizeSession(session: AdjustmentSession, status: SessionStatus, message: string | null) {
  if (session.loopTimer) {
    clearTimeout(session.loopTimer)
    session.loopTimer = null
  }

  session.stopRequested = true
  session.status = status
  session.currentPoint = null
  session.message = message
  session.lastUpdatedAt = nowIso()

  if (status === "completed" && session.persistedAdjustments.length === 0 && session.validatedPoints[1] && session.validatedPoints[2]) {
    session.persistedAdjustments = await persistFinalAdjustments(session)
  }

  try {
    await restoreSessionStates(session)
  } finally {
    releaseSensorLocks(session)
  }
}

async function runOneLoop(session: AdjustmentSession) {
  const standardReading = await readHotlineGspMeasurement({
    serial: session.standardSerial,
    manualPort: session.standardPort,
    manualModule: session.standardModuleName,
  })

  session.latestStandardReading = standardReading
  session.lastUpdatedAt = nowIso()
  await persistStandardReading(session.standardSerial, standardReading).catch((error) => {
    log.warn("METROLOGY_ADJUSTMENT", "standard_read_persist_failed", {
      sessionId: session.id,
      standardSerial: session.standardSerial,
      error: error instanceof Error ? error.message : String(error),
    })
  })

  if (session.currentPoint) {
    session.currentPoint.standardSamples.push({
      measuredAt: standardReading.measuredAt,
      value: standardReading.value,
      rawValue: standardReading.rawValue,
    })

    if (
      session.currentPoint.lastStandardValue != null &&
      standardReading.value != null &&
      Math.abs(standardReading.value - session.currentPoint.lastStandardValue) > session.plateauMaxGap
    ) {
      const failedPoint = session.currentPoint.pointIndex
      session.currentPoint = null
      session.message = `Le point ${failedPoint} a ete invalide : ecart de stabilite depasse.`
      session.lastError = session.message
      session.lastUpdatedAt = nowIso()
    } else if (standardReading.value != null) {
      session.currentPoint.lastStandardValue = standardReading.value
    }
  }

  for (const sensor of session.sensors) {
    const reading = await readHotlineGspMeasurement({
      serial: sensor.serialNumber,
      manualPort: sensor.modulePort,
      manualAddress: sensor.address,
      manualModule: sensor.moduleName,
    })

    session.latestSensorReadings[sensor.id] = reading
    await persistAdjustmentReading(sensor.serialNumber, reading).catch((error) => {
      log.warn("METROLOGY_ADJUSTMENT", "sensor_read_persist_failed", {
        sessionId: session.id,
        serial: sensor.serialNumber,
        error: error instanceof Error ? error.message : String(error),
      })
    })

    if (!session.currentPoint) continue
    if (!session.currentPoint.sensorSamples[sensor.id]) {
      session.currentPoint.sensorSamples[sensor.id] = []
    }
    session.currentPoint.sensorSamples[sensor.id].push({
      measuredAt: reading.measuredAt,
      value: reading.value,
      rawValue: reading.rawValue,
    })
  }

  if (!session.currentPoint) {
    session.lastUpdatedAt = nowIso()
    return
  }

  const plateauDurationMs = session.plateauDurationMinutes * 60_000
  if (Date.now() - session.currentPoint.startedAt < plateauDurationMs) {
    session.lastUpdatedAt = nowIso()
    return
  }

  const currentPoint = session.currentPoint
  const pointIndex = currentPoint.pointIndex
  const standardAverage = averageValues(
    currentPoint.standardSamples.map((sample) => sample.value),
    session.displayDecimals,
  )

  if (standardAverage == null) {
    session.currentPoint = null
    session.message = `Le point ${pointIndex} a ete invalide : aucune mesure etalon exploitable.`
    session.lastError = session.message
    session.lastUpdatedAt = nowIso()
    return
  }

  const sensorAverages: Record<number, number | null> = {}
  for (const sensor of session.sensors) {
    sensorAverages[sensor.id] = averageValues(
      (currentPoint.sensorSamples[sensor.id] ?? []).map((sample) => sample.value),
      session.displayDecimals,
    )
  }

  session.validatedPoints[pointIndex] = {
    pointIndex,
    targetValue: currentPoint.targetValue,
    startedAt: new Date(currentPoint.startedAt).toISOString(),
    completedAt: nowIso(),
    standardAverage,
    sensorAverages,
  }
  session.currentPoint = null
  session.message = `Point ${pointIndex} valide.`
  session.lastError = null
  session.lastUpdatedAt = nowIso()

  if (session.validatedPoints[1] && session.validatedPoints[2]) {
    await finalizeSession(session, "completed", "Les deux points d'ajustage sont valides.")
  }
}

async function scheduleLoop(session: AdjustmentSession) {
  if (session.stopRequested || session.status !== "running") return

  try {
    await runOneLoop(session)
  } catch (error) {
    session.lastError = error instanceof Error ? error.message : String(error)
    session.message = "Erreur durant la sequence d'ajustage."
    session.lastUpdatedAt = nowIso()
    await finalizeSession(session, "failed", session.message)
    log.error("METROLOGY_ADJUSTMENT", "session_loop_failed", {
      sessionId: session.id,
      error: session.lastError,
    })
    return
  }

  if (session.stopRequested || session.status !== "running") return
  session.loopTimer = setTimeout(() => {
    void scheduleLoop(session)
  }, DEFAULT_LOOP_INTERVAL_MS + EXTRA_LOOP_INTERVAL_MS)
}

export async function getAdjustmentSessionForUser(userId: number) {
  const session = sessionsByUserId.get(userId) ?? null
  return session ? toPublicSession(session) : null
}

export async function startAdjustmentSession(user: JWTPayload, input: StartAdjustmentInput, ip?: string) {
  const existingSession = sessionsByUserId.get(user.userId)
  if (existingSession && (existingSession.status === "running" || existingSession.status === "idle")) {
    throw new Error("Une session d'ajustage est deja en cours pour cet utilisateur.")
  }

  await ensureAdjustmentStateExists()

  const standard = await prisma.t_etalon.findUnique({
    where: { Id_Etalon: input.standardId },
    select: {
      Id_Etalon: true,
      Etalon_Numero_Serie: true,
      Est_Sonde_Externe: true,
      Port_Serie: true,
      Id_Module: true,
      Nb_Decimale: true,
      Incertitude_Max: true,
    },
  })

  if (!standard?.Etalon_Numero_Serie) {
    throw new Error("Etalon introuvable.")
  }

  const standardTypeRows = await prisma.t_etalon_type.findMany({
    select: { Type_Etalon: true },
  })
  const standardType = inferStandardTypeCode(standard.Etalon_Numero_Serie, standardTypeRows)

  if (standard.Est_Sonde_Externe) {
    throw new Error("L'ajustage automatique n'est pas disponible avec une sonde etalon externe.")
  }

  if (standardType !== "SPET") {
    throw new Error("L'ajustage automatique est actuellement limite aux etalons SPET.")
  }

  const standardModule = standard.Id_Module
    ? await prisma.t_module.findUnique({
        where: { Id_Module: standard.Id_Module },
        select: { Module_Numero_Serie: true, Port_Serie: true },
      })
    : null

  const standardCertif = await prisma.t_certif.findFirst({
    where: { Etalon_Numero_Serie: standard.Etalon_Numero_Serie },
    orderBy: [{ Date: "desc" }, { Id_Certif: "desc" }],
    select: {
      Organisme: true,
      Date: true,
      Numero: true,
      Unite: true,
    },
  })

  const standardTypeInfo = standardType
    ? await prisma.t_etalon_type.findFirst({
        where: { Type_Etalon: standardType },
        select: { Resolution: true },
      })
    : null

  const standardPort = standardModule?.Port_Serie?.trim() || standard.Port_Serie?.trim() || ""
  if (!standardPort) {
    throw new Error("Aucun port serie n'est defini pour l'etalon selectionne.")
  }

  const sensorRows = await prisma.t_sonde.findMany({
    where: {
      Id_Sonde: { in: input.selectedSensorIds },
      Sonde_Numero_Serie: { not: null },
    },
    select: {
      Id_Sonde: true,
      Sonde_Numero_Serie: true,
      Adresse_Sonde: true,
      Surveillance_Etat: true,
      Id_Module: true,
      Sonde_Offset: true,
      t_lieu: {
        where: { Est_Archive: false },
        take: 1,
        select: {
          Id_Lieu: true,
          Nom_Lieu: true,
          Lieu_Etat: true,
          Lieu_Etat_N1: true,
        },
      },
    },
  })

  if (sensorRows.length !== input.selectedSensorIds.length) {
    throw new Error("Une ou plusieurs sondes selectionnees sont introuvables.")
  }

  const moduleIds = Array.from(
    new Set(sensorRows.map((sensor) => sensor.Id_Module).filter((value): value is number => typeof value === "number")),
  )
  const modules = moduleIds.length
    ? await prisma.t_module.findMany({
        where: { Id_Module: { in: moduleIds } },
        select: {
          Id_Module: true,
          Module_Numero_Serie: true,
          Emplacement: true,
          Port_Serie: true,
        },
      })
    : []
  const moduleById = new Map(modules.map((module) => [module.Id_Module, module]))

  const latestAdjustments = await prisma.t_ajustage.findMany({
    where: {
      Sonde_Numero_Serie: {
        in: sensorRows
          .map((sensor) => sensor.Sonde_Numero_Serie?.trim())
          .filter((value): value is string => Boolean(value)),
      },
    },
    orderBy: [{ Date_Heure_Ajustage: "desc" }, { Id_Ajustage: "desc" }],
    select: {
      Sonde_Numero_Serie: true,
      Coeff_X: true,
      Coeff_Constant: true,
    },
  })
  const latestAdjustmentBySerial = new Map<string, { coeffX: number; coeffConstant: number }>()
  for (const row of latestAdjustments) {
    const serial = row.Sonde_Numero_Serie?.trim()
    if (!serial || latestAdjustmentBySerial.has(serial)) continue
    latestAdjustmentBySerial.set(serial, {
      coeffX: typeof row.Coeff_X === "number" ? row.Coeff_X : 1,
      coeffConstant: typeof row.Coeff_Constant === "number" ? row.Coeff_Constant : 0,
    })
  }

  const sensors: ManagedSensor[] = sensorRows.map((sensor) => {
    const serial = sensor.Sonde_Numero_Serie?.trim() ?? ""
    if (!serial) throw new Error("Une sonde selectionnee ne possede pas de numero de serie.")
    if (getSensorFamilyFromSerial(serial) !== "GSP") {
      throw new Error(`L'ajustage automatique est actuellement limite aux sondes GSP (${serial}).`)
    }

    const module = sensor.Id_Module ? moduleById.get(sensor.Id_Module) ?? null : null
    if (!module?.Port_Serie) {
      throw new Error(`Le port serie est introuvable pour la sonde ${serial}.`)
    }

    if (sensorLocks.has(sensor.Id_Sonde)) {
      throw new Error(`La sonde ${serial} est deja utilisee dans une autre session d'ajustage.`)
    }

    const previousAdjustment = latestAdjustmentBySerial.get(serial)

    return {
      id: sensor.Id_Sonde,
      serialNumber: serial,
      locationId: sensor.t_lieu[0]?.Id_Lieu ?? null,
      locationName: sensor.t_lieu[0]?.Nom_Lieu ?? null,
      moduleId: sensor.Id_Module ?? null,
      moduleName: module?.Module_Numero_Serie ?? module?.Emplacement ?? null,
      modulePort: module?.Port_Serie ?? null,
      currentCalibrationValue: typeof sensor.Sonde_Offset === "number" ? sensor.Sonde_Offset : 0,
      address: sensor.Adresse_Sonde?.trim() || null,
      previousSensorState: sensor.Surveillance_Etat,
      previousLocationState: sensor.t_lieu[0]?.Lieu_Etat ?? null,
      previousLocationStateN1: sensor.t_lieu[0]?.Lieu_Etat_N1 ?? null,
      previousCoeffX: previousAdjustment?.coeffX ?? 1,
      previousCoeffConstant: previousAdjustment?.coeffConstant ?? 0,
    }
  })

  const session: AdjustmentSession = {
    id: randomUUID(),
    userId: user.userId,
    username: user.username,
    userProfile: user.profile,
    startedAt: nowIso(),
    operator: input.operator.trim() || user.username,
    displayDecimals: Math.max(0, Math.min(input.displayDecimals, 6)),
    standardId: standard.Id_Etalon,
    standardSerial: standard.Etalon_Numero_Serie,
    standardType,
    standardModuleId: standard.Id_Module ?? null,
    standardModuleName: standardModule?.Module_Numero_Serie ?? null,
    standardPort,
    standardOrganization: standardCertif?.Organisme ?? null,
    standardCertificateDate: standardCertif?.Date ? standardCertif.Date.toISOString() : null,
    standardCertificateNumber: standardCertif?.Numero ?? null,
    standardUnit: standardCertif?.Unite ?? null,
    standardResolution: formatDecimalValue(standardTypeInfo?.Resolution),
    standardDecimals: standard.Nb_Decimale ?? null,
    standardUncertainty:
      standard.Incertitude_Max == null ? null : Number(String(standard.Incertitude_Max).replace(",", ".")),
    standardIsExternal: Boolean(standard.Est_Sonde_Externe),
    mediumId: input.mediumId,
    plateauDurationMinutes: Math.max(1, input.plateauDurationMinutes),
    plateauMaxGap: Math.max(0, input.plateauMaxGap),
    sensors,
    status: "running",
    stopRequested: false,
    latestStandardReading: null,
    latestSensorReadings: {},
    currentPoint: null,
    validatedPoints: {},
    message: "Sequence d'ajustage demarree.",
    lastError: null,
    lastUpdatedAt: nowIso(),
    persistedAdjustments: [],
    loopTimer: null,
  }

  await prisma.$transaction(async (tx) => {
    for (const sensor of sensors) {
      await tx.t_sonde.update({
        where: { Id_Sonde: sensor.id },
        data: {
          Surveillance_Etat: "A",
          Etat_Sonde_N1: sensor.previousSensorState,
        },
      })
    }

    const updatedLocationIds = new Set<number>()
    for (const sensor of sensors) {
      if (!sensor.locationId || updatedLocationIds.has(sensor.locationId)) continue
      updatedLocationIds.add(sensor.locationId)
      await tx.t_lieu.update({
        where: { Id_Lieu: sensor.locationId },
        data: {
          Lieu_Etat: "A",
          Lieu_Etat_N1: sensor.previousLocationState,
        },
      })
    }
  })

  await updateSensorMetrologyFlags(
    sensors.map((sensor) => sensor.id),
    {
      metrologyInProgress: 1,
    },
  )

  for (const sensor of sensors) {
    sensorLocks.set(sensor.id, session.id)
  }

  sessionsByUserId.set(user.userId, session)
  log.audit("CA", {
    user: user.username,
    userId: user.userId,
    userProfile: user.profile,
    ip,
    resource: "Ajustage (Demarrage)",
    resourceId: session.id,
    changes: {
      standard: session.standardSerial,
      sensorIds: sensors.map((sensor) => sensor.id),
      sensorSerials: sensors.map((sensor) => sensor.serialNumber),
      plateauDurationMinutes: session.plateauDurationMinutes,
      plateauMaxGap: session.plateauMaxGap,
    },
    success: true,
  })

  void scheduleLoop(session)
  return toPublicSession(session)
}

export async function validateAdjustmentPoint(
  userId: number,
  pointIndex: PointIndex,
  targetValue: number,
) {
  const session = sessionsByUserId.get(userId)
  if (!session) throw new Error("Aucune session d'ajustage en cours.")
  if (session.status !== "running") throw new Error("La session d'ajustage n'est plus active.")
  if (session.currentPoint) throw new Error("Un point est deja en cours de validation.")
  if (pointIndex === 2 && !session.validatedPoints[1]) {
    throw new Error("Le premier point doit etre valide avant le second.")
  }
  if (session.validatedPoints[pointIndex]) {
    throw new Error(`Le point ${pointIndex} a deja ete valide.`)
  }

  session.currentPoint = {
    pointIndex,
    targetValue,
    startedAt: Date.now(),
    standardSamples: [],
    sensorSamples: {},
    lastStandardValue: null,
  }
  session.message = `Validation du point ${pointIndex} en cours.`
  session.lastError = null
  session.lastUpdatedAt = nowIso()
  return toPublicSession(session)
}

export async function stopAdjustmentSession(userId: number, cancelResults: boolean, ip?: string) {
  const session = sessionsByUserId.get(userId)
  if (!session) return null

  const hadValidatedPoint = Boolean(session.validatedPoints[1] || session.validatedPoints[2])
  if (cancelResults) {
    session.validatedPoints = {}
    session.currentPoint = null
  } else {
    session.currentPoint = null
  }

  await finalizeSession(session, cancelResults ? "cancelled" : "completed", cancelResults ? "Ajustage annule." : "Ajustage arrete.")

  log.audit("CA", {
    user: session.username,
    userId: session.userId,
    userProfile: session.userProfile,
    ip,
    resource: "Ajustage (Arret)",
    resourceId: session.id,
    changes: {
      cancelResults,
      hadValidatedPoint,
      validatedPointCount: Number(Boolean(session.validatedPoints[1])) + Number(Boolean(session.validatedPoints[2])),
    },
    success: true,
  })

  return toPublicSession(session)
}

export function shouldConfirmAdjustmentStop(userId: number) {
  const session = sessionsByUserId.get(userId)
  if (!session) return false
  return !session.validatedPoints[1] && !session.validatedPoints[2]
}
