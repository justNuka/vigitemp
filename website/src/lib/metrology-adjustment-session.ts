import { randomUUID } from "crypto"

import { log } from "@/lib/logger"
import { getHotlineServerConfig } from "@/lib/hotline-config"
import { getSensorFamilyFromSerial } from "@/lib/sensor-naming"
import { inferStandardTypeCode } from "@/lib/standard-types"
import { prisma, prismaMesure } from "@/lib/prisma"
import { buildAdjustmentExportFileName } from "@/lib/adjustment-export"
import { hasMainDbColumn } from "@/lib/db-schema"
import { getTableReference, isMssqlProvider, quoteIdentifier } from "@/lib/metrology-db"
import { restoreGspMetrologyConfigurationOnce } from "@/lib/metrology-gsp-configuration-restore"
import type { GspCoefficientOverride } from "@/lib/metrology-gsp-configuration"
import type { AdjustmentSensorRow } from "@/hooks/useAdjustmentSensors"
import type { JWTPayload } from "@/lib/jwt"

const DEFAULT_SERVER_PORT = 5310
const DEFAULT_SERVER_BDD_ID = 1
const MIN_MEASUREMENT_INTERVAL_SECONDS = 15
const ADJUSTMENT_MAX_DURATION_MS = 90 * 60 * 1000
const ADJUSTMENT_EXTENSION_MS = 30 * 60 * 1000
const ADJUSTMENT_EXTENSION_THRESHOLD_MS = 30 * 60 * 1000

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
  startedAt: number
  targetValue: number | null
  standardSamples: PlateauSample[]
  sensorSamples: Record<number, PlateauSample[]>
  lastStandardValue: number | null
}

type PlateauStatus = {
  status: "idle" | "running" | "waiting" | "failed" | "ready" | "validated"
  pointIndex: PointIndex | null
  startedAt: string | null
  endedAt: string | null
  standardSampleCount: number
  lastGap: number | null
  maxGap: number
  resetCount: number
  lastResetAt: string | null
}

type ManagedSensor = AdjustmentSensorRow & {
  address: string | null
  previousSensorState: string
  previousSensorStateN1: string | null
  locations: Array<{
    id: number
    previousState: string | null
    previousStateN1: string | null
  }>
  previousCoeffX2: number
  previousCoeffX: number
  previousCoeffConstant: number
  currentCoeffA: number
  currentCoeffB: number
  currentCoeffC: number
}

type GsoAdjustmentMeasurementRow = {
  Valeur: number | string | null
  Valeur_Brute: number | string | null
  Unite: string | null
  Date_Heure_Mesure: Date | string
}

type PersistedAdjustment = {
  sensorId: number
  serialNumber: string
  adjustmentId: number
  exportFileName: string
  exportUrl: string
}

type CoefficientApplicationState = {
  status: "not-applicable" | "pending" | "applied" | "declined"
  gspSensorCount: number
  gsoSensorCount: number
  previousConfigurationRestored: boolean
}

type AdjustmentSession = {
  id: string
  userId: number
  username: string
  userProfile: string
  startedAt: string
  expiresAt: string
  extensionCount: number
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
  measurementIntervalSeconds: number
  sensors: ManagedSensor[]
  status: SessionStatus
  stopRequested: boolean
  latestStandardReading: RuntimeReading | null
  latestSensorReadings: Record<number, RuntimeReading>
  currentPoint: RunningPoint | null
  plateauStatus: PlateauStatus
  coefficientsLocked: boolean
  coefficientApplication: CoefficientApplicationState
  validatedPoints: Partial<Record<PointIndex, ValidatedPoint>>
  message: string | null
  lastError: string | null
  lastUpdatedAt: string
  persistedAdjustments: PersistedAdjustment[]
  loopTimer: ReturnType<typeof setTimeout> | null
  expirationTimer: ReturnType<typeof setTimeout> | null
}

type StartAdjustmentInput = {
  selectedSensorIds: number[]
  operator: string
  displayDecimals: number
  standardId: number
  mediumId: number | null
  plateauDurationMinutes: number
  plateauMaxGap: number
  measurementIntervalSeconds: number
}

type PublicSession = {
  id: string
  status: SessionStatus
  startedAt: string
  expiresAt: string
  extensionCount: number
  canExtend: boolean
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
  measurementIntervalSeconds: number
  sensors: Array<{
    id: number
    serialNumber: string
    locationId: number | null
    locationName: string | null
    moduleId: number | null
    moduleName: string | null
    modulePort: string | null
    isGso: boolean
    coeffA: number
    coeffB: number
    coeffC: number
  }>
  latestStandardReading: RuntimeReading | null
  latestSensorReadings: Record<number, RuntimeReading>
  currentPoint: {
    pointIndex: PointIndex
    startedAt: string | null
  } | null
  plateauStatus: PlateauStatus
  coefficientsLocked: boolean
  coefficientApplication: CoefficientApplicationState
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

type AdjustmentStandardMeasurementSchema = {
  hasUnit: boolean
  hasAddress: boolean
  dateColumn: "Date_Heure_Mesure" | "Date_Heure"
}

let adjustmentStandardMeasurementSchemaPromise: Promise<AdjustmentStandardMeasurementSchema> | null = null

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

function keepLatestValidReading(previous: RuntimeReading | null | undefined, next: RuntimeReading) {
  if (next.value != null || previous?.value == null) return next
  return previous
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

  if (values.metrologyInProgress !== undefined && (await hasMainDbColumn("t_sonde", "Metrologie_en_cours"))) {
    assignments.push(
      `${quoteIdentifier("Metrologie_en_cours")} = ${isMssqlProvider() ? `@P${params.length + 1}` : "?"}`,
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
      operationContext: "AJUSTAGE",
      manualPort: normalizeSerialPortName(request.manualPort),
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

function normalizeSerialPortName(value: string | null | undefined) {
  const trimmed = value?.trim()
  if (!trimmed) return undefined
  if (/^\d+$/.test(trimmed)) return `COM${trimmed}`

  const comMatch = /^COM\s*(\d+)$/i.exec(trimmed)
  return comMatch ? `COM${comMatch[1]}` : trimmed
}

async function getAdjustmentStandardMeasurementSchema(): Promise<AdjustmentStandardMeasurementSchema> {
  if (adjustmentStandardMeasurementSchemaPromise) return adjustmentStandardMeasurementSchemaPromise

  const schemaPromise: Promise<AdjustmentStandardMeasurementSchema> = (async () => {
    const rows = isMssqlProvider()
      ? await prismaMesure.$queryRaw<Array<{ COLUMN_NAME: string }>>`
          SELECT COLUMN_NAME
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = 'dbo'
            AND TABLE_NAME = 'tm_mesures_ajustage_etalon'
        `
      : await prismaMesure.$queryRaw<Array<{ COLUMN_NAME: string }>>`
          SELECT COLUMN_NAME
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'tm_mesures_ajustage_etalon'
        `

    const columns = new Set(rows.map((row) => String(row.COLUMN_NAME).toLowerCase()))
    const dateColumn: AdjustmentStandardMeasurementSchema["dateColumn"] = columns.has("date_heure_mesure")
      ? "Date_Heure_Mesure"
      : "Date_Heure"
    return {
      hasUnit: columns.has("unite"),
      hasAddress: columns.has("adresse_sonde"),
      dateColumn,
    }
  })().catch(() => ({
    hasUnit: false,
    hasAddress: false,
    dateColumn: "Date_Heure_Mesure",
  }))

  adjustmentStandardMeasurementSchemaPromise = schemaPromise
  return schemaPromise
}

async function persistAdjustmentReading(serial: string, reading: RuntimeReading) {
  await prismaMesure.$executeRaw`
    INSERT INTO tm_mesures_ajustage
      (Id_Serveur_BDD, Sonde_Numero_Serie, Valeur, Valeur_Brute, Unite, Date_Heure_Mesure, Adresse_Sonde, Est_Valeur_Null)
    VALUES
      (
        ${DEFAULT_SERVER_BDD_ID},
        ${serial},
        ${reading.value},
        ${reading.value},
        ${reading.unit},
        ${new Date(reading.measuredAt)},
        ${serial},
        ${reading.value == null ? 1 : 0}
      )
  `
}

async function readLatestGsoAdjustmentMeasurement(
  session: AdjustmentSession,
  sensor: ManagedSensor,
): Promise<RuntimeReading | null> {
  const previousReading = session.latestSensorReadings[sensor.id]
  const cutoff = new Date(previousReading?.measuredAt ?? session.startedAt)
  const address = sensor.address?.trim() || sensor.serialNumber
  const rows = isMssqlProvider()
    ? await prismaMesure.$queryRawUnsafe<GsoAdjustmentMeasurementRow[]>(
        `SELECT TOP (1)
           ${quoteIdentifier("Valeur")},
           ${quoteIdentifier("Valeur_Brute")},
           ${quoteIdentifier("Unite")},
           ${quoteIdentifier("Date_Heure_Mesure")}
         FROM ${quoteIdentifier("tm_mesures_ajustage")}
         WHERE (
           ${quoteIdentifier("Sonde_Numero_Serie")} = @P1
           OR ${quoteIdentifier("Adresse_Sonde")} = @P2
         )
           AND ${quoteIdentifier("Date_Heure_Mesure")} > @P3
         ORDER BY ${quoteIdentifier("Date_Heure_Mesure")} DESC, ${quoteIdentifier("Id_Mesure_Ajustage")} DESC`,
        sensor.serialNumber,
        address,
        cutoff,
      )
    : await prismaMesure.$queryRawUnsafe<GsoAdjustmentMeasurementRow[]>(
        `SELECT
           ${quoteIdentifier("Valeur")},
           ${quoteIdentifier("Valeur_Brute")},
           ${quoteIdentifier("Unite")},
           ${quoteIdentifier("Date_Heure_Mesure")}
         FROM ${quoteIdentifier("tm_mesures_ajustage")}
         WHERE (
           ${quoteIdentifier("Sonde_Numero_Serie")} = ?
           OR ${quoteIdentifier("Adresse_Sonde")} = ?
         )
           AND ${quoteIdentifier("Date_Heure_Mesure")} > ?
         ORDER BY ${quoteIdentifier("Date_Heure_Mesure")} DESC, ${quoteIdentifier("Id_Mesure_Ajustage")} DESC
         LIMIT 1`,
        sensor.serialNumber,
        address,
        cutoff,
      )

  const row = rows[0]
  if (!row) return null

  const measuredAt = new Date(row.Date_Heure_Mesure)
  const value = asFiniteNumber(row.Valeur) ?? asFiniteNumber(row.Valeur_Brute)
  return {
    value,
    rawValue: null,
    unit: row.Unite?.trim() || sensor.unit,
    error: value == null ? "Mesure GSO invalide" : null,
    measuredAt: Number.isNaN(measuredAt.getTime()) ? nowIso() : measuredAt.toISOString(),
  }
}

async function persistStandardReading(serial: string, reading: RuntimeReading) {
  const schema = await getAdjustmentStandardMeasurementSchema()
  const columns = [
    "Id_Serveur_BDD",
    "Etalon_Numero_Serie",
    "Valeur",
    "Valeur_Brute",
    schema.dateColumn,
    "Est_Valeur_Null",
  ]
  const values: unknown[] = [
    DEFAULT_SERVER_BDD_ID,
    serial,
    reading.value,
    reading.value,
    new Date(reading.measuredAt),
    reading.value == null ? 1 : 0,
  ]

  if (schema.hasUnit) {
    columns.push("Unite")
    values.push(reading.unit)
  }
  if (schema.hasAddress) {
    columns.push("Adresse_Sonde")
    values.push(serial)
  }

  const placeholders = values.map((_, index) => (isMssqlProvider() ? `@P${index + 1}` : "?"))
  const sql = `INSERT INTO ${quoteIdentifier("tm_mesures_ajustage_etalon")} (${columns
    .map(quoteIdentifier)
    .join(", ")}) VALUES (${placeholders.join(", ")})`
  await prismaMesure.$executeRawUnsafe(sql, ...values)
}

function toPublicSession(session: AdjustmentSession): PublicSession {
  const remainingMs = new Date(session.expiresAt).getTime() - Date.now()

  return {
    id: session.id,
    status: session.status,
    startedAt: session.startedAt,
    expiresAt: session.expiresAt,
    extensionCount: session.extensionCount,
    canExtend:
      session.status === "running" &&
      session.extensionCount === 0 &&
      remainingMs > 0 &&
      remainingMs <= ADJUSTMENT_EXTENSION_THRESHOLD_MS,
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
    measurementIntervalSeconds: session.measurementIntervalSeconds,
    sensors: session.sensors.map((sensor) => ({
      id: sensor.id,
      serialNumber: sensor.serialNumber,
      locationId: sensor.locationId,
      locationName: sensor.locationName,
      moduleId: sensor.moduleId,
      moduleName: sensor.moduleName,
      modulePort: sensor.modulePort,
      isGso: sensor.isGso,
      coeffA: sensor.currentCoeffA,
      coeffB: sensor.currentCoeffB,
      coeffC: sensor.currentCoeffC,
    })),
    latestStandardReading: session.latestStandardReading,
    latestSensorReadings: session.latestSensorReadings,
    currentPoint: session.currentPoint
      ? {
          pointIndex: session.currentPoint.pointIndex,
          startedAt:
            session.currentPoint.startedAt == null
              ? null
              : new Date(session.currentPoint.startedAt).toISOString(),
        }
      : null,
    plateauStatus: session.plateauStatus,
    coefficientsLocked: session.coefficientsLocked,
    coefficientApplication: session.coefficientApplication,
    validatedPoints: session.validatedPoints,
    message: session.message,
    lastError: session.lastError,
    canStartPointTwo:
      Boolean(session.validatedPoints[1]) &&
      !session.validatedPoints[2] &&
      session.currentPoint?.pointIndex === 2,
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
          Ancienne_Mesure1:
            Math.abs(sensor.previousCoeffX2) > 1e-12
              ? sensor.previousCoeffX2 * result.rawValueOne ** 2 +
                sensor.previousCoeffX * result.rawValueOne +
                sensor.previousCoeffConstant
              : sensor.previousCoeffX * result.rawValueOne + sensor.previousCoeffConstant,
          Ancienne_Mesure2:
            Math.abs(sensor.previousCoeffX2) > 1e-12
              ? sensor.previousCoeffX2 * result.rawValueTwo ** 2 +
                sensor.previousCoeffX * result.rawValueTwo +
                sensor.previousCoeffConstant
              : sensor.previousCoeffX * result.rawValueTwo + sensor.previousCoeffConstant,
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

function getAdjustmentGspSensors(session: AdjustmentSession) {
  return session.sensors.filter((sensor) => !sensor.isGso && getSensorFamilyFromSerial(sensor.serialNumber) === "GSP")
}

function buildPreviousCoefficientOverrides(session: AdjustmentSession) {
  return Object.fromEntries(
    getAdjustmentGspSensors(session).map((sensor) => [
      sensor.id,
      {
        coeffX2: sensor.previousCoeffX2,
        coeffX: sensor.previousCoeffX,
        coeffConstant: sensor.previousCoeffConstant,
      } satisfies GspCoefficientOverride,
    ]),
  ) satisfies Record<number, GspCoefficientOverride>
}

async function restorePreviousAdjustmentGspConfiguration(session: AdjustmentSession) {
  const gspSensors = getAdjustmentGspSensors(session)
  if (gspSensors.length === 0) return

  await restoreGspMetrologyConfigurationOnce(
    `adjustment:${session.id}:previous`,
    gspSensors.map((sensor) => sensor.id),
    "AJUSTAGE",
    buildPreviousCoefficientOverrides(session),
  )
}

async function restoreSessionStates(session: AdjustmentSession) {
  const sensorUpdates = session.sensors.map((sensor) =>
    prisma.t_sonde.update({
      where: { Id_Sonde: sensor.id },
      data: {
        Surveillance_Etat: sensor.previousSensorState,
        Etat_Sonde_N1: sensor.previousSensorStateN1,
      },
    }),
  )

  const locationMap = new Map<number, { previousState: string | null; previousStateN1: string | null }>()
  for (const sensor of session.sensors) {
    for (const location of sensor.locations) {
      if (locationMap.has(location.id)) continue
      locationMap.set(location.id, {
        previousState: location.previousState,
        previousStateN1: location.previousStateN1,
      })
    }
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

  let stateRestoreError: unknown = null
  try {
    await prisma.$transaction([...sensorUpdates, ...locationUpdates])
  } catch (error) {
    stateRestoreError = error
  }

  try {
    await updateSensorMetrologyFlags(
      session.sensors.map((sensor) => sensor.id),
      {
        metrologyInProgress: 0,
        metrologyCommandSent: 0,
      },
    )
  } catch (flagRestoreError) {
    if (stateRestoreError) {
      log.error("METROLOGY_ADJUSTMENT", "adjustment_state_and_flags_restore_failed", {
        sessionId: session.id,
        stateError: stateRestoreError,
        flagError: flagRestoreError,
      })
      throw stateRestoreError
    }
    throw flagRestoreError
  }

  if (stateRestoreError) {
    throw stateRestoreError
  }
}

function releaseSensorLocks(session: AdjustmentSession) {
  for (const sensor of session.sensors) {
    if (sensorLocks.get(sensor.id) === session.id) {
      sensorLocks.delete(sensor.id)
    }
  }
}

function ensureSessionDeadline(session: AdjustmentSession) {
  const expiresAtMs = new Date(session.expiresAt).getTime()
  if (!Number.isFinite(expiresAtMs)) {
    session.expiresAt = new Date(
      new Date(session.startedAt).getTime() + ADJUSTMENT_MAX_DURATION_MS,
    ).toISOString()
  }
  if (!Number.isFinite(session.extensionCount)) {
    session.extensionCount = 0
  }
}

async function finalizeSession(session: AdjustmentSession, status: SessionStatus, message: string | null) {
  if (session.loopTimer) {
    clearTimeout(session.loopTimer)
    session.loopTimer = null
  }
  if (session.expirationTimer) {
    clearTimeout(session.expirationTimer)
    session.expirationTimer = null
  }

  session.stopRequested = true
  session.status = status
  session.currentPoint = null
  session.message = message
  session.lastUpdatedAt = nowIso()

  if (status === "completed" && session.persistedAdjustments.length === 0 && session.validatedPoints[1] && session.validatedPoints[2]) {
    session.persistedAdjustments = await persistFinalAdjustments(session)

    const gspSensorCount = getAdjustmentGspSensors(session).length
    session.coefficientApplication = {
      status: gspSensorCount > 0 ? "pending" : "not-applicable",
      gspSensorCount,
      gsoSensorCount: session.sensors.filter((sensor) => sensor.isGso).length,
      previousConfigurationRestored: false,
    }

    if (gspSensorCount > 0) {
      try {
        await restorePreviousAdjustmentGspConfiguration(session)
        session.coefficientApplication.previousConfigurationRestored = true
      } catch (error) {
        session.lastError =
          "Les coefficients précédents n'ont pas pu être restaurés automatiquement sur les sondes GSP."
        log.error("METROLOGY_ADJUSTMENT", "previous_coefficients_restore_failed", {
          sessionId: session.id,
          sensorIds: getAdjustmentGspSensors(session).map((sensor) => sensor.id),
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }

  try {
    await restoreSessionStates(session)
  } finally {
    releaseSensorLocks(session)
  }
}

async function expireSession(session: AdjustmentSession) {
  if (session.status !== "running" && session.status !== "idle") return

  session.validatedPoints = {}
  session.currentPoint = null
  await finalizeSession(
    session,
    "cancelled",
    "Ajustage annule automatiquement apres expiration de la duree maximale.",
  )

  log.warn("METROLOGY_ADJUSTMENT", "session_expired", {
    sessionId: session.id,
    userId: session.userId,
    startedAt: session.startedAt,
    expiresAt: session.expiresAt,
  })
  log.audit("CA", {
    user: session.username,
    userId: session.userId,
    userProfile: session.userProfile,
    resource: "Ajustage (Expiration)",
    resourceId: session.id,
    changes: {
      automaticCancellation: true,
      expiresAt: session.expiresAt,
    },
    success: true,
  })
}

function scheduleSessionExpiration(session: AdjustmentSession) {
  if (session.expirationTimer) {
    clearTimeout(session.expirationTimer)
  }

  const remainingMs = new Date(session.expiresAt).getTime() - Date.now()
  if (remainingMs <= 0) {
    session.expirationTimer = null
    void expireSession(session).catch((error) => {
      log.error("METROLOGY_ADJUSTMENT", "session_expiration_failed", {
        sessionId: session.id,
        error: error instanceof Error ? error.message : String(error),
      })
    })
    return
  }

  session.expirationTimer = setTimeout(() => {
    session.expirationTimer = null
    void expireSession(session).catch((error) => {
      log.error("METROLOGY_ADJUSTMENT", "session_expiration_failed", {
        sessionId: session.id,
        error: error instanceof Error ? error.message : String(error),
      })
    })
  }, remainingMs)
}

function createRunningPoint(
  pointIndex: PointIndex,
  startedAt: number,
  targetValue: number | null = null,
): RunningPoint {
  return {
    pointIndex,
    startedAt,
    targetValue,
    standardSamples: [],
    sensorSamples: {},
    lastStandardValue: null,
  }
}

function createWaitingPlateauStatus(
  pointIndex: PointIndex,
  maxGap: number,
  resetCount = 0,
): PlateauStatus {
  return {
    status: "waiting",
    pointIndex,
    startedAt: null,
    endedAt: null,
    standardSampleCount: 0,
    lastGap: null,
    maxGap,
    resetCount,
    lastResetAt: null,
  }
}

function applyStandardReadingToPlateau(session: AdjustmentSession, reading: RuntimeReading) {
  if (!session.currentPoint || reading.value == null) return

  const currentPoint = session.currentPoint
  const sample = {
    measuredAt: reading.measuredAt,
    value: reading.value,
    rawValue: reading.rawValue,
  }
  const previousStandardValue = currentPoint.lastStandardValue
  const measuredGap =
    previousStandardValue == null ? null : Math.abs(reading.value - previousStandardValue)

  if (measuredGap != null && measuredGap > session.plateauMaxGap) {
    const restartedAt = Date.now()
    currentPoint.startedAt = restartedAt
    currentPoint.standardSamples = [sample]
    currentPoint.sensorSamples = {}
    currentPoint.lastStandardValue = reading.value
    session.plateauStatus = {
      status: "running",
      pointIndex: currentPoint.pointIndex,
      startedAt: new Date(restartedAt).toISOString(),
      endedAt: null,
      standardSampleCount: 1,
      lastGap: measuredGap,
      maxGap: session.plateauMaxGap,
      resetCount: session.plateauStatus.resetCount + 1,
      lastResetAt: new Date(restartedAt).toISOString(),
    }
    session.message =
      `Plateau du point ${currentPoint.pointIndex} redémarré : ` +
      `écart ${measuredGap} supérieur au maximum ${session.plateauMaxGap}.`
  } else {
    currentPoint.standardSamples.push(sample)
    currentPoint.lastStandardValue = reading.value
    session.plateauStatus = {
      ...session.plateauStatus,
      status: "running",
      standardSampleCount: currentPoint.standardSamples.length,
      lastGap: measuredGap,
    }
  }

  session.lastError = null
  session.lastUpdatedAt = nowIso()
}

async function completeAdjustmentPoint(session: AdjustmentSession) {
  const currentPoint = session.currentPoint
  if (!currentPoint) return

  const pointIndex = currentPoint.pointIndex
  const standardAverage = session.standardIsExternal
    ? roundValue(currentPoint.targetValue, session.displayDecimals)
    : averageValues(
        currentPoint.standardSamples.map((sample) => sample.value),
        session.displayDecimals,
      )

  if (standardAverage == null) {
    throw new Error(`Aucune mesure étalon exploitable pour le point ${pointIndex}.`)
  }

  const sensorAverages: Record<number, number | null> = {}
  for (const sensor of session.sensors) {
    const sensorAverage = averageValues(
      (currentPoint.sensorSamples[sensor.id] ?? []).map((sample) => sample.value),
      session.displayDecimals,
    )
    if (sensorAverage == null) {
      throw new Error(`Aucune mesure exploitable pour la sonde ${sensor.serialNumber}.`)
    }
    sensorAverages[sensor.id] = sensorAverage
  }

  const completedAt = nowIso()
  session.validatedPoints[pointIndex] = {
    pointIndex,
    targetValue: standardAverage,
    startedAt: new Date(currentPoint.startedAt).toISOString(),
    completedAt,
    standardAverage,
    sensorAverages,
  }
  session.plateauStatus = {
    ...session.plateauStatus,
    status: "validated",
    endedAt: completedAt,
  }
  session.currentPoint = null
  session.message = `Point ${pointIndex} validé automatiquement avec la moyenne du plateau.`
  session.lastError = null
  session.lastUpdatedAt = completedAt

  if (pointIndex === 2) {
    await finalizeSession(session, "completed", "Les deux points d'ajustage sont validés automatiquement.")
  }
}

async function runOneLoop(session: AdjustmentSession) {
  if (!session.standardIsExternal) {
    const standardReading = await readHotlineGspMeasurement({
      serial: session.standardSerial,
      manualPort: session.standardPort,
      manualModule: session.standardModuleName,
    })
    session.latestStandardReading = keepLatestValidReading(session.latestStandardReading, standardReading)
    session.lastUpdatedAt = nowIso()
    await persistStandardReading(session.standardSerial, standardReading).catch((error) => {
      log.warn("METROLOGY_ADJUSTMENT", "standard_read_persist_failed", {
        sessionId: session.id,
        standardSerial: session.standardSerial,
        error: error instanceof Error ? error.message : String(error),
      })
    })
    applyStandardReadingToPlateau(session, standardReading)
  }

  for (const sensor of session.sensors) {
    const reading = sensor.isGso
      ? await readLatestGsoAdjustmentMeasurement(session, sensor)
      : await readHotlineGspMeasurement({
          serial: sensor.serialNumber,
          manualPort: sensor.modulePort,
          manualAddress: sensor.address,
          manualModule: sensor.moduleName,
        })

    if (!reading) continue

    session.latestSensorReadings[sensor.id] = keepLatestValidReading(
      session.latestSensorReadings[sensor.id],
      reading,
    )
    if (!sensor.isGso) {
      await persistAdjustmentReading(sensor.serialNumber, reading).catch((error) => {
        log.warn("METROLOGY_ADJUSTMENT", "sensor_read_persist_failed", {
          sessionId: session.id,
          serial: sensor.serialNumber,
          error: error instanceof Error ? error.message : String(error),
        })
      })
    }

    if (!session.currentPoint || session.currentPoint.startedAt == null) continue
    if (!session.currentPoint.sensorSamples[sensor.id]) {
      session.currentPoint.sensorSamples[sensor.id] = []
    }
    if (reading.value != null) {
      session.currentPoint.sensorSamples[sensor.id].push({
        measuredAt: reading.measuredAt,
        value: reading.value,
        rawValue: reading.rawValue,
      })
    }
  }

  if (!session.currentPoint || session.currentPoint.startedAt == null) {
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
  const validStandardSampleCount = currentPoint.standardSamples.filter((sample) => sample.value != null).length
  const sensorsWithoutSample = session.sensors.filter(
    (sensor) => !(currentPoint.sensorSamples[sensor.id] ?? []).some((sample) => sample.value != null),
  )
  const missingStandardSamples = !session.standardIsExternal && validStandardSampleCount < 2

  if (missingStandardSamples || sensorsWithoutSample.length > 0) {
    const pendingParts: string[] = []
    if (missingStandardSamples) {
      pendingParts.push(`${2 - validStandardSampleCount} mesure(s) étalon`)
    }
    if (sensorsWithoutSample.length > 0) {
      pendingParts.push(`${sensorsWithoutSample.length} sonde(s)`)
    }
    session.plateauStatus = {
      ...session.plateauStatus,
      status: "waiting",
      standardSampleCount: validStandardSampleCount,
    }
    session.message = `Plateau terminé pour le point ${pointIndex}, attente de ${pendingParts.join(" et ")}.`
    session.lastError = null
    session.lastUpdatedAt = nowIso()
    return
  }

  await completeAdjustmentPoint(session)
}

async function scheduleLoop(session: AdjustmentSession) {
  if (session.stopRequested || session.status !== "running") return
  session.loopTimer = null

  const loopStartedAt = Date.now()
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
  const elapsedMs = Date.now() - loopStartedAt
  const remainingDelayMs = Math.max(0, session.measurementIntervalSeconds * 1000 - elapsedMs)
  session.loopTimer = setTimeout(() => {
    void scheduleLoop(session)
  }, remainingDelayMs)
}

export async function getAdjustmentSessionForUser(userId: number) {
  const session = sessionsByUserId.get(userId) ?? null
  if (session && (session.status === "running" || session.status === "idle")) {
    ensureSessionDeadline(session)
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      await expireSession(session)
    } else if (!session.expirationTimer) {
      scheduleSessionExpiration(session)
    }
  }
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

  if (!standard.Est_Sonde_Externe && standardType !== "SPET") {
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
  if (!standard.Est_Sonde_Externe && !standardPort) {
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
      Etat_Sonde_N1: true,
      Id_Module: true,
      Sonde_Offset: true,
      Est_Sonde_GSO: true,
      t_sonde_type: {
        select: {
          Unite: true,
        },
      },
      t_lieu: {
        where: { Est_Archive: false },
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
      Coeff_X2: true,
      Coeff_X: true,
      Coeff_Constant: true,
      Unite: true,
    },
  })
  const latestAdjustmentBySerial = new Map<
    string,
    {
      coeffX2: number
      coeffX: number
      coeffConstant: number
      coeffA: number
      coeffB: number
      coeffC: number
      unit: string | null
    }
  >()
  for (const row of latestAdjustments) {
    const serial = row.Sonde_Numero_Serie?.trim()
    if (!serial || latestAdjustmentBySerial.has(serial)) continue
    const coeffX2 = typeof row.Coeff_X2 === "number" ? row.Coeff_X2 : 0
    const coeffX = typeof row.Coeff_X === "number" ? row.Coeff_X : 1
    const coeffConstant = typeof row.Coeff_Constant === "number" ? row.Coeff_Constant : 0
    const usesThreeCoefficients = Math.abs(coeffX2) > 1e-12
    latestAdjustmentBySerial.set(serial, {
      coeffX2,
      coeffX,
      coeffConstant,
      coeffA: usesThreeCoefficients ? coeffX2 : coeffX,
      coeffB: usesThreeCoefficients ? coeffX : coeffConstant,
      coeffC: usesThreeCoefficients ? coeffConstant : 0,
      unit: row.Unite?.trim() || null,
    })
  }

  const sensors: ManagedSensor[] = sensorRows.map((sensor) => {
    const serial = sensor.Sonde_Numero_Serie?.trim() ?? ""
    if (!serial) throw new Error("Une sonde selectionnee ne possede pas de numero de serie.")
    const isGso = Boolean(sensor.Est_Sonde_GSO)
    if (!isGso && getSensorFamilyFromSerial(serial) !== "GSP") {
      throw new Error(`La sonde ${serial} n'est ni une GSP ni une GSO ajustable.`)
    }

    const sensorModule = sensor.Id_Module ? moduleById.get(sensor.Id_Module) ?? null : null
    if (!isGso && !sensorModule?.Port_Serie) {
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
      moduleName: sensorModule?.Module_Numero_Serie ?? sensorModule?.Emplacement ?? null,
      modulePort: sensorModule?.Port_Serie ?? null,
      currentCalibrationValue: typeof sensor.Sonde_Offset === "number" ? sensor.Sonde_Offset : 0,
      isGso,
      unit: previousAdjustment?.unit ?? sensor.t_sonde_type?.Unite?.trim() ?? null,
      address: sensor.Adresse_Sonde?.trim() || null,
      previousSensorState: sensor.Surveillance_Etat,
      previousSensorStateN1: sensor.Etat_Sonde_N1 ?? null,
      locations: sensor.t_lieu.map((location) => ({
        id: location.Id_Lieu,
        previousState: location.Lieu_Etat ?? null,
        previousStateN1: location.Lieu_Etat_N1 ?? null,
      })),
      previousCoeffX2: previousAdjustment?.coeffX2 ?? 0,
      previousCoeffX: previousAdjustment?.coeffX ?? 1,
      previousCoeffConstant: previousAdjustment?.coeffConstant ?? 0,
      currentCoeffA: previousAdjustment?.coeffA ?? 1,
      currentCoeffB: previousAdjustment?.coeffB ?? 0,
      currentCoeffC: previousAdjustment?.coeffC ?? 0,
    }
  })

  const startedAt = nowIso()
  const standardIsExternal = Boolean(standard.Est_Sonde_Externe)
  const session: AdjustmentSession = {
    id: randomUUID(),
    userId: user.userId,
    username: user.username,
    userProfile: user.profile,
    startedAt,
    expiresAt: new Date(new Date(startedAt).getTime() + ADJUSTMENT_MAX_DURATION_MS).toISOString(),
    extensionCount: 0,
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
    standardIsExternal,
    mediumId: input.mediumId,
    plateauDurationMinutes: Math.max(1, input.plateauDurationMinutes),
    plateauMaxGap: Math.max(0, input.plateauMaxGap),
    measurementIntervalSeconds: sensors.some((sensor) => sensor.isGso)
      ? 60
      : input.measurementIntervalSeconds === 30
        ? 30
        : MIN_MEASUREMENT_INTERVAL_SECONDS,
    sensors,
    status: "running",
    stopRequested: false,
    latestStandardReading: null,
    latestSensorReadings: {},
    currentPoint: null,
    plateauStatus: {
      ...createWaitingPlateauStatus(1, Math.max(0, input.plateauMaxGap)),
      status: "idle",
    },
    coefficientsLocked: false,
    coefficientApplication: {
      status: "not-applicable",
      gspSensorCount: sensors.filter((sensor) => !sensor.isGso).length,
      gsoSensorCount: sensors.filter((sensor) => sensor.isGso).length,
      previousConfigurationRestored: false,
    },
    validatedPoints: {},
    message: standardIsExternal
      ? "Séquence d'ajustage démarrée. Lecture des sondes active ; lancez l'acquisition du premier point lorsque vous êtes prêt."
      : "Séquence d'ajustage démarrée. Lecture continue des sondes et de l'étalon active ; lancez l'acquisition du premier point lorsque vous êtes prêt.",
    lastError: null,
    lastUpdatedAt: nowIso(),
    persistedAdjustments: [],
    loopTimer: null,
    expirationTimer: null,
  }

  let sessionStatesApplied = false
  try {
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
        for (const location of sensor.locations) {
          if (updatedLocationIds.has(location.id)) continue
          updatedLocationIds.add(location.id)
          await tx.t_lieu.update({
            where: { Id_Lieu: location.id },
            data: {
              Lieu_Etat: "A",
              Lieu_Etat_N1: location.previousState,
            },
          })
        }
      }
    })
    sessionStatesApplied = true

    await updateSensorMetrologyFlags(
      sensors.map((sensor) => sensor.id),
      {
        metrologyInProgress: 1,
      },
    )
  } catch (error) {
    if (sessionStatesApplied) {
      try {
        await restoreSessionStates(session)
      } catch (cleanupError) {
        log.error("METROLOGY_ADJUSTMENT", "adjustment_start_cleanup_failed", {
          sessionId: session.id,
          startError: error,
          cleanupError,
        })
      }
    }
    throw error
  }

  for (const sensor of sensors) {
    sensorLocks.set(sensor.id, session.id)
  }

  sessionsByUserId.set(user.userId, session)
  scheduleSessionExpiration(session)
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
      measurementIntervalSeconds: session.measurementIntervalSeconds,
    },
    success: true,
  })

  void scheduleLoop(session)
  return toPublicSession(session)
}

export type AdjustmentCoefficientUpdate = {
  sensorId: number
  coeffA: number
  coeffB: number
  coeffC: number
}

export async function updateAdjustmentCoefficients(
  userId: number,
  updates: AdjustmentCoefficientUpdate[],
  ip?: string,
) {
  const session = sessionsByUserId.get(userId)
  if (!session || session.status !== "running") {
    throw new Error("Aucun ajustage en cours.")
  }
  if (session.coefficientsLocked) {
    throw new Error("Les coefficients sont verrouillés depuis le lancement de l'acquisition du premier point.")
  }
  if (updates.length === 0) {
    throw new Error("Aucun coefficient à valider.")
  }

  const updateBySensorId = new Map<number, AdjustmentCoefficientUpdate>()
  for (const update of updates) {
    if (
      !Number.isFinite(update.coeffA) ||
      !Number.isFinite(update.coeffB) ||
      !Number.isFinite(update.coeffC)
    ) {
      throw new Error("Les coefficients a, b et c doivent être des nombres valides.")
    }
    if (Math.abs(update.coeffC) > 1e-12 && Math.abs(update.coeffA) <= 1e-12) {
      throw new Error("Le coefficient a ne peut pas être nul lorsque c est utilisé.")
    }
    if (updateBySensorId.has(update.sensorId)) {
      throw new Error("Une sonde ne peut apparaître qu'une fois dans la validation.")
    }
    updateBySensorId.set(update.sensorId, update)
  }

  const sessionSensorIds = new Set(session.sensors.map((sensor) => sensor.id))
  if (
    updateBySensorId.size !== sessionSensorIds.size ||
    Array.from(updateBySensorId.keys()).some((sensorId) => !sessionSensorIds.has(sensorId))
  ) {
    throw new Error("Les coefficients doivent être renseignés pour toutes les sondes de l'ajustage.")
  }

  const adjustedAt = new Date()
  await prisma.$transaction(async (tx) => {
    for (const sensor of session.sensors) {
      const update = updateBySensorId.get(sensor.id)
      if (!update) continue

      const usesThreeCoefficients = Math.abs(update.coeffC) > 1e-12
      await tx.t_ajustage.create({
        data: {
          Date_Heure_Ajustage: adjustedAt,
          Sonde_Numero_Serie: sensor.serialNumber,
          Coeff_X2: usesThreeCoefficients ? update.coeffA : 0,
          Coeff_X: usesThreeCoefficients ? update.coeffB : update.coeffA,
          Coeff_Constant: usesThreeCoefficients ? update.coeffC : update.coeffB,
          Unite: sensor.unit ?? session.standardUnit,
          Nb_Decimale: session.displayDecimals,
          Operateur: session.operator,
          SE_Numero: session.standardSerial,
          SE_Organisme: session.standardOrganization,
          SE_Date_Certif: session.standardCertificateDate
            ? new Date(session.standardCertificateDate)
            : null,
          SE_Numero_Certif: session.standardCertificateNumber,
          Id_Milieu: session.mediumId,
        },
      })
    }

    const locationIds = Array.from(
      new Set(session.sensors.flatMap((sensor) => sensor.locations.map((location) => location.id))),
    )
    if (locationIds.length > 0) {
      await tx.t_lieu.updateMany({
        where: { Id_Lieu: { in: locationIds } },
        data: { Infos_Modifiees_Depuis_Derniere_Mesure: true },
      })
    }
  })

  for (const sensor of session.sensors) {
    const update = updateBySensorId.get(sensor.id)
    if (!update) continue
    sensor.currentCoeffA = update.coeffA
    sensor.currentCoeffB = update.coeffB
    sensor.currentCoeffC = update.coeffC
  }
  session.message =
    "Coefficients validés. Ils seront envoyés à la prochaine interrogation de chaque sonde."
  session.lastError = null
  session.lastUpdatedAt = nowIso()

  log.audit("CA", {
    user: session.username,
    userId: session.userId,
    userProfile: session.userProfile,
    ip,
    resource: "Ajustage (Coefficients)",
    resourceId: session.id,
    changes: {
      coefficients: updates,
      sentOnNextInterrogation: true,
    },
    success: true,
  })

  return toPublicSession(session)
}

export async function resolveAdjustmentCalculatedCoefficientApplication(
  userId: number,
  applyCalculatedCoefficients: boolean,
  ip?: string,
) {
  const session = sessionsByUserId.get(userId)
  if (!session || session.status !== "completed" || session.persistedAdjustments.length === 0) {
    throw new Error("Aucun ajustage terminé avec de nouveaux coefficients à appliquer.")
  }

  if (session.coefficientApplication.status === "not-applicable") {
    throw new Error("Aucune sonde GSP de cet ajustage ne nécessite d'envoi de coefficients.")
  }
  if (session.coefficientApplication.status !== "pending") {
    return toPublicSession(session)
  }

  const gspSensors = getAdjustmentGspSensors(session)
  if (gspSensors.length === 0) {
    session.coefficientApplication.status = "not-applicable"
    session.lastUpdatedAt = nowIso()
    return toPublicSession(session)
  }

  if (applyCalculatedCoefficients) {
    await restoreGspMetrologyConfigurationOnce(
      `adjustment:${session.id}:calculated`,
      gspSensors.map((sensor) => sensor.id),
      "AJUSTAGE",
    )
    session.coefficientApplication.status = "applied"
    session.message =
      gspSensors.length === 1
        ? "Les nouveaux coefficients calculés ont été envoyés à la sonde GSP."
        : `Les nouveaux coefficients calculés ont été envoyés aux ${gspSensors.length} sondes GSP.`
  } else {
    await restorePreviousAdjustmentGspConfiguration(session)
    session.coefficientApplication.previousConfigurationRestored = true
    session.coefficientApplication.status = "declined"
    session.message =
      "Les nouveaux coefficients restent enregistrés dans l'ajustage mais n'ont pas été envoyés aux sondes GSP. Les coefficients précédents restent appliqués sur les sondes."
  }

  session.lastError = null
  session.lastUpdatedAt = nowIso()

  log.audit("CA", {
    user: session.username,
    userId: session.userId,
    userProfile: session.userProfile,
    ip,
    resource: "Ajustage (Application coefficients calculés)",
    resourceId: session.id,
    changes: {
      applyCalculatedCoefficients,
      gspSensorIds: gspSensors.map((sensor) => sensor.id),
      gspSerialNumbers: gspSensors.map((sensor) => sensor.serialNumber),
      gsoSensorCount: session.coefficientApplication.gsoSensorCount,
    },
    success: true,
  })

  return toPublicSession(session)
}

export async function extendAdjustmentSession(userId: number, ip?: string) {
  const session = sessionsByUserId.get(userId)
  if (!session || session.status !== "running") {
    throw new Error("Aucun ajustage en cours.")
  }

  ensureSessionDeadline(session)
  const remainingMs = new Date(session.expiresAt).getTime() - Date.now()
  if (remainingMs <= 0) {
    await expireSession(session)
    throw new Error("La duree maximale de l'ajustage est expiree.")
  }
  if (session.extensionCount > 0) {
    throw new Error("La prolongation de 30 minutes a deja ete utilisee.")
  }
  if (remainingMs > ADJUSTMENT_EXTENSION_THRESHOLD_MS) {
    throw new Error("La prolongation sera disponible dans les 30 dernieres minutes.")
  }

  session.expiresAt = new Date(
    new Date(session.expiresAt).getTime() + ADJUSTMENT_EXTENSION_MS,
  ).toISOString()
  session.extensionCount += 1
  session.lastUpdatedAt = nowIso()
  scheduleSessionExpiration(session)

  log.audit("CA", {
    user: session.username,
    userId: session.userId,
    userProfile: session.userProfile,
    ip,
    resource: "Ajustage (Prolongation)",
    resourceId: session.id,
    changes: {
      addedMinutes: ADJUSTMENT_EXTENSION_MS / 60_000,
      expiresAt: session.expiresAt,
    },
    success: true,
  })

  return toPublicSession(session)
}

export async function startAdjustmentPointAcquisition(
  userId: number,
  pointIndex: PointIndex,
  targetValue?: number,
) {
  const session = sessionsByUserId.get(userId)
  if (!session) throw new Error("Aucune session d'ajustage en cours.")
  if (session.status !== "running") throw new Error("La session d'ajustage n'est plus active.")
  if (session.currentPoint) {
    throw new Error(`L'acquisition du point ${session.currentPoint.pointIndex} est déjà en cours.`)
  }
  if (pointIndex === 1 && session.validatedPoints[1]) {
    throw new Error("Le premier point a déjà été validé.")
  }
  if (pointIndex === 2 && !session.validatedPoints[1]) {
    throw new Error("Le premier point doit être validé avant de lancer le second.")
  }
  if (session.validatedPoints[pointIndex]) {
    throw new Error(`Le point ${pointIndex} a déjà été validé.`)
  }

  const unavailableSensors = session.sensors.filter(
    (sensor) => !Number.isFinite(session.latestSensorReadings[sensor.id]?.value),
  )
  if (unavailableSensors.length > 0) {
    throw new Error(
      `Attendez une mesure valide pour ${unavailableSensors.length} sonde(s) avant de lancer l'acquisition.`,
    )
  }
  if (!session.standardIsExternal && !Number.isFinite(session.latestStandardReading?.value)) {
    throw new Error("Attendez une mesure valide de l'étalon avant de lancer l'acquisition.")
  }
  if (session.standardIsExternal && !Number.isFinite(targetValue)) {
    throw new Error("La valeur du point étalon externe doit être renseignée.")
  }

  const startedAt = Date.now()
  session.currentPoint = createRunningPoint(
    pointIndex,
    startedAt,
    session.standardIsExternal ? Number(targetValue) : null,
  )
  session.plateauStatus = {
    status: "running",
    pointIndex,
    startedAt: new Date(startedAt).toISOString(),
    endedAt: null,
    standardSampleCount: 0,
    lastGap: null,
    maxGap: session.plateauMaxGap,
    resetCount: session.plateauStatus.resetCount,
    lastResetAt: null,
  }
  if (pointIndex === 1) {
    session.coefficientsLocked = true
  }
  session.message = `Acquisition du point ${pointIndex} lancée. Le plateau de stabilité est en cours.`
  session.lastError = null
  session.lastUpdatedAt = nowIso()

  if (session.standardIsExternal) {
    for (const sensor of session.sensors) {
      const reading = session.latestSensorReadings[sensor.id]
      if (!reading || reading.value == null) continue
      session.currentPoint.sensorSamples[sensor.id] = [{
        measuredAt: reading.measuredAt,
        value: reading.value,
        rawValue: reading.rawValue,
      }]
    }
    await completeAdjustmentPoint(session)
    return toPublicSession(session)
  }

  if (session.loopTimer) {
    clearTimeout(session.loopTimer)
    session.loopTimer = null
  }
  void scheduleLoop(session)
  return toPublicSession(session)
}

export async function submitExternalStandardReading(userId: number, value: number) {
  const session = sessionsByUserId.get(userId)
  if (!session || session.status !== "running") {
    throw new Error("Aucun ajustage en cours.")
  }
  if (!session.standardIsExternal) {
    throw new Error("La saisie manuelle est reservee aux etalons externes.")
  }
  if (!Number.isFinite(value)) {
    throw new Error("La mesure etalon doit etre un nombre valide.")
  }
  if (session.plateauStatus.status === "ready") {
    throw new Error("Le plateau est deja stable et peut etre valide.")
  }

  const reading: RuntimeReading = {
    value,
    rawValue: String(value),
    unit: session.standardUnit,
    error: null,
    measuredAt: nowIso(),
  }
  session.latestStandardReading = reading
  await persistStandardReading(session.standardSerial, reading).catch((error) => {
    log.warn("METROLOGY_ADJUSTMENT", "external_standard_persist_failed", {
      sessionId: session.id,
      standardSerial: session.standardSerial,
      error: error instanceof Error ? error.message : String(error),
    })
  })

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

  await finalizeSession(session, cancelResults ? "cancelled" : "completed", cancelResults ? "Ajustage annulé." : "Ajustage arreté.")

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
