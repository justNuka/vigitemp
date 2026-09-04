import { randomUUID } from "crypto"

import type { AdjustmentSensorRow } from "@/hooks/useAdjustmentSensors"
import { serializeStoredDbDateTime } from "@/lib/date-display"
import { hasMainDbColumn } from "@/lib/db-schema"
import { getHotlineServerConfig } from "@/lib/hotline-config"
import type { JWTPayload } from "@/lib/jwt"
import { log } from "@/lib/logger"
import {
  calculateCalibrationResult,
  CALIBRATION_SAMPLE_COUNT,
  DEFAULT_SENSOR_RESOLUTION,
} from "@/lib/metrology-calibration-calculations"
import { restoreCalibrationSensorStates } from "@/lib/metrology-calibration-sensor-state"
import {
  fetchEtalonById,
  fetchIntercomparisonMediaRows,
  getTableReference,
  isMssqlProvider,
  quoteIdentifier,
} from "@/lib/metrology-db"
import { getSensorFamilyFromSerial } from "@/lib/sensor-naming"
import { inferStandardTypeCode } from "@/lib/standard-types"
import { prisma, prismaMesure } from "@/lib/prisma"

const DEFAULT_SERVER_PORT = 5310
const DEFAULT_SERVER_BDD_ID = 1
const CALIBRATION_INTERVAL_MS = 60_000

type CalibrationStatus = "running" | "completed" | "failed"
export type CalibrationPhase = "reading" | "acquiring" | "completed"

export type CalibrationReading = {
  value: number | null
  rawValue: string | null
  unit: string | null
  measuredAt: string
  source: "GSP" | "GSO"
  error: string | null
}

export type CalibrationSample = {
  order: number
  value: number
  measuredAt: string
  unit: string | null
}

export type CalibrationResult = {
  calibrationId: number
  sensorId: number
  serialNumber: string
  meanSensor: number
  meanStandard: number
  accuracyError: number
  uncertainty: number
  standardDeviation: number
}

type ManagedCalibrationSensor = AdjustmentSensorRow & {
  address: string | null
  previousSensorState: string
  previousSensorStateN1: string | null
  sensorStateChanged: boolean
  locations: Array<{
    id: number
    previousState: string | null
    previousStateN1: string | null
    stateChanged: boolean
  }>
}

type CalibrationReference = {
  standardId: number
  standardSerial: string
  standardModuleName: string | null
  standardPort: string
  standardUnit: string | null
  standardResolution: number
  standardUncertainty: number
  standardOrganization: string | null
  standardCertificateDate: string | null
  standardCertificateNumber: string | null
  mediumId: number
  mediumStability: number
  mediumHomogeneity: number
}

type CalibrationSession = CalibrationReference & {
  id: string
  userId: number
  username: string
  userProfile: string
  operator: string
  startedAt: string
  stoppedAt: string | null
  intervalSeconds: number
  status: CalibrationStatus
  phase: CalibrationPhase
  stopRequested: boolean
  sensors: ManagedCalibrationSensor[]
  latestStandardReading: CalibrationReading | null
  latestReadings: Record<number, CalibrationReading>
  readingCounts: Record<number, number>
  standardSamples: CalibrationSample[]
  sensorSamples: Record<number, CalibrationSample[]>
  results: Record<number, CalibrationResult>
  message: string | null
  lastError: string | null
  lastUpdatedAt: string
  loopTimer: ReturnType<typeof setTimeout> | null
}

export type PublicCalibrationSession = {
  id: string
  operator: string
  startedAt: string
  stoppedAt: string | null
  intervalSeconds: number
  status: CalibrationStatus
  phase: CalibrationPhase
  standardId: number
  standardSerial: string
  standardUnit: string | null
  standardResolution: number
  standardUncertainty: number
  mediumId: number
  sensors: Array<{
    id: number
    serialNumber: string
    locationId: number | null
    locationName: string | null
    moduleId: number | null
    moduleName: string | null
    modulePort: string | null
    unit: string | null
    isGso: boolean
  }>
  latestStandardReading: CalibrationReading | null
  latestReadings: Record<number, CalibrationReading>
  readingCounts: Record<number, number>
  standardSamples: CalibrationSample[]
  sensorSamples: Record<number, CalibrationSample[]>
  results: Record<number, CalibrationResult>
  sampleTarget: number
  capturedSampleCount: number
  canStartAcquisition: boolean
  message: string | null
  lastError: string | null
  lastUpdatedAt: string
}

type GlobalCalibrationState = {
  calibrationSessionsByUserId?: Map<number, CalibrationSession>
  calibrationSensorLocks?: Map<number, string>
}

type GsoCalibrationMeasurementRow = {
  Valeur: unknown
  Valeur_Brute: unknown
  Unite: string | null
  Date_Heure_Mesure: Date | string
}

type CalibrationReadTarget = {
  serialNumber: string
  unit: string | null
  modulePort: string | null
  moduleName: string | null
  address: string | null
}

const globalState = globalThis as typeof globalThis & GlobalCalibrationState
const sessionsByUserId = (globalState.calibrationSessionsByUserId ??= new Map<number, CalibrationSession>())
const sensorLocks = (globalState.calibrationSensorLocks ??= new Map<number, string>())

function nowIso() {
  return new Date().toISOString()
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (value != null) {
    const parsed = Number(String(value).replace(",", "."))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function normalizeUnitKey(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase().replace(/\s+/g, "") || null
  if (!normalized) return null
  if (["c", "°c", "degc", "celsius"].includes(normalized)) return "temperature:c"
  if (["%", "%rh", "rh", "%hr", "hr"].includes(normalized)) return "humidity:%"
  return normalized
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

function hasUsableReading(reading: CalibrationReading | null | undefined) {
  return typeof reading?.value === "number" && Number.isFinite(reading.value)
}

function canStartAcquisition(session: CalibrationSession) {
  return (
    session.status === "running" &&
    session.phase === "reading" &&
    hasUsableReading(session.latestStandardReading) &&
    session.sensors.length > 0 &&
    session.sensors.every((sensor) => hasUsableReading(session.latestReadings[sensor.id]))
  )
}

function toPublicSession(session: CalibrationSession): PublicCalibrationSession {
  return {
    id: session.id,
    operator: session.operator,
    startedAt: session.startedAt,
    stoppedAt: session.stoppedAt,
    intervalSeconds: session.intervalSeconds,
    status: session.status,
    phase: session.phase,
    standardId: session.standardId,
    standardSerial: session.standardSerial,
    standardUnit: session.standardUnit,
    standardResolution: session.standardResolution,
    standardUncertainty: session.standardUncertainty,
    mediumId: session.mediumId,
    sensors: session.sensors.map((sensor) => ({
      id: sensor.id,
      serialNumber: sensor.serialNumber,
      locationId: sensor.locationId,
      locationName: sensor.locationName,
      moduleId: sensor.moduleId,
      moduleName: sensor.moduleName,
      modulePort: sensor.modulePort,
      unit: sensor.unit,
      isGso: sensor.isGso,
    })),
    latestStandardReading: session.latestStandardReading,
    latestReadings: session.latestReadings,
    readingCounts: session.readingCounts,
    standardSamples: session.standardSamples,
    sensorSamples: session.sensorSamples,
    results: session.results,
    sampleTarget: CALIBRATION_SAMPLE_COUNT,
    capturedSampleCount: session.standardSamples.length,
    canStartAcquisition: canStartAcquisition(session),
    message: session.message,
    lastError: session.lastError,
    lastUpdatedAt: session.lastUpdatedAt,
  }
}

async function updateSensorMetrologyFlags(
  sensorIds: number[],
  values: { metrologyInProgress?: number; metrologyCommandSent?: number },
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

  const sql = `UPDATE ${getTableReference("t_sonde")} SET ${assignments.join(", ")} WHERE ${quoteIdentifier("Id_Sonde")} IN (${sensorIds.join(",")})`
  await prisma.$executeRawUnsafe(sql, ...params)
}

async function loadManagedSensors(selectedIds: number[]) {
  const rows = await prisma.t_sonde.findMany({
    where: { Id_Sonde: { in: selectedIds } },
    select: {
      Id_Sonde: true,
      Adresse_Sonde: true,
      Sonde_Numero_Serie: true,
      Surveillance_Etat: true,
      Etat_Sonde_N1: true,
      Id_Module: true,
      Est_Sonde_GSO: true,
      t_sonde_type: { select: { Unite: true } },
      t_lieu: {
        where: { Est_Archive: false },
        select: { Id_Lieu: true, Nom_Lieu: true, Lieu_Etat: true, Lieu_Etat_N1: true },
      },
    },
  })
  if (rows.length !== selectedIds.length) throw new Error("Une ou plusieurs sondes sont introuvables.")

  const moduleIds = rows.map((row) => row.Id_Module).filter((id): id is number => typeof id === "number")
  const modules = moduleIds.length
    ? await prisma.t_module.findMany({
        where: { Id_Module: { in: moduleIds } },
        select: { Id_Module: true, Module_Numero_Serie: true, Emplacement: true, Port_Serie: true },
      })
    : []
  const modulesById = new Map(modules.map((moduleRow) => [moduleRow.Id_Module, moduleRow]))
  const serialNumbers = rows
    .map((row) => row.Sonde_Numero_Serie?.trim())
    .filter((serial): serial is string => Boolean(serial))
  const latestAdjustments = serialNumbers.length
    ? await prisma.t_ajustage.findMany({
        where: { Sonde_Numero_Serie: { in: serialNumbers }, Unite: { not: null } },
        select: {
          Sonde_Numero_Serie: true,
          Unite: true,
          Date_Heure_Ajustage: true,
          Id_Ajustage: true,
        },
        orderBy: [{ Date_Heure_Ajustage: "desc" }, { Id_Ajustage: "desc" }],
      })
    : []
  const adjustmentUnitBySerial = new Map<string, string>()
  for (const adjustment of latestAdjustments) {
    const serial = adjustment.Sonde_Numero_Serie?.trim()
    const unit = adjustment.Unite?.trim()
    if (serial && unit && !adjustmentUnitBySerial.has(serial)) {
      adjustmentUnitBySerial.set(serial, unit)
    }
  }

  return rows.map((row): ManagedCalibrationSensor => {
    const serial = row.Sonde_Numero_Serie?.trim()
    if (!serial) throw new Error("Une sonde selectionnee ne possede pas de numero de serie.")
    if (!row.Est_Sonde_GSO && getSensorFamilyFromSerial(serial) !== "GSP") {
      throw new Error(`L'etalonnage automatique est limite aux sondes GSP et GSO (${serial}).`)
    }
    if (["A", "E"].includes(row.Surveillance_Etat)) {
      throw new Error(`La sonde ${serial} est deja utilisee par une operation de metrologie.`)
    }
    const moduleRow = row.Id_Module == null ? null : modulesById.get(row.Id_Module)
    if (!row.Est_Sonde_GSO && !moduleRow?.Port_Serie) {
      throw new Error(`Aucun port serie n'est configure pour la sonde ${serial}.`)
    }
    const firstLocation = row.t_lieu[0]
    return {
      id: row.Id_Sonde,
      serialNumber: serial,
      locationId: firstLocation?.Id_Lieu ?? null,
      locationName: firstLocation?.Nom_Lieu ?? null,
      unit: adjustmentUnitBySerial.get(serial) ?? row.t_sonde_type?.Unite?.trim() ?? null,
      moduleId: row.Id_Module,
      moduleName: moduleRow?.Module_Numero_Serie ?? moduleRow?.Emplacement ?? null,
      modulePort: moduleRow?.Port_Serie ?? null,
      currentCalibrationValue: 0,
      isGso: Boolean(row.Est_Sonde_GSO),
      address: row.Adresse_Sonde,
      previousSensorState: row.Surveillance_Etat,
      previousSensorStateN1: row.Etat_Sonde_N1,
      sensorStateChanged: row.Surveillance_Etat === "S",
      locations: row.t_lieu.map((location) => ({
        id: location.Id_Lieu,
        previousState: location.Lieu_Etat,
        previousStateN1: location.Lieu_Etat_N1,
        stateChanged: location.Lieu_Etat === "S",
      })),
    }
  })
}

async function loadCalibrationReference(
  standardId: number,
  mediumId: number,
  expectedUnit: string | null,
): Promise<CalibrationReference> {
  // Les écrans Étalons/Milieux supportent plusieurs générations de schéma.
  // Le démarrage d'une campagne doit utiliser exactement la même couche de
  // compatibilité au lieu de laisser Prisma sélectionner des colonnes optionnelles.
  const standard = await fetchEtalonById(standardId)
  const standardSerial = standard?.Etalon_Numero_Serie == null
    ? ""
    : String(standard.Etalon_Numero_Serie).trim()
  const standardArchived = Boolean(Number(standard?.Est_Archive ?? 0))
  if (!standard || !standardSerial || standardArchived) {
    throw new Error("L'étalon introuvable ou archivé.")
  }
  if (Boolean(Number(standard.Est_Sonde_Externe ?? 0))) {
    throw new Error("L'étalonnage à 10 mesures nécessite un étalon interrogé automatiquement.")
  }

  const typeRows = await prisma.t_etalon_type.findMany({
    select: { Type_Etalon: true, Resolution: true },
  })
  const standardType = inferStandardTypeCode(standardSerial, typeRows)
  if (standardType !== "SPET") {
    throw new Error("L'etalonnage automatique est actuellement limite aux etalons SPET.")
  }
  const typeInfo = typeRows.find((row) => String(row.Type_Etalon).trim().toUpperCase() === standardType)
  const standardResolution = asFiniteNumber(typeInfo?.Resolution)

  const hasUncertaintyMax = await hasMainDbColumn("t_etalon", "Incertitude_Max")
  let standardUncertainty: number | null = null
  if (hasUncertaintyMax) {
    const sql = isMssqlProvider()
      ? `SELECT TOP 1 ${quoteIdentifier("Incertitude_Max")} AS Incertitude_Max FROM ${getTableReference("t_etalon")} WHERE ${quoteIdentifier("Id_Etalon")} = @P1`
      : `SELECT ${quoteIdentifier("Incertitude_Max")} AS Incertitude_Max FROM ${getTableReference("t_etalon")} WHERE ${quoteIdentifier("Id_Etalon")} = ? LIMIT 1`
    const rows = await prisma.$queryRawUnsafe<Array<{ Incertitude_Max: unknown }>>(sql, standardId)
    standardUncertainty = asFiniteNumber(rows[0]?.Incertitude_Max)
  } else {
    // Anciennes bases : l'incertitude de l'étalon était portée par la colonne
    // Incertitude. Ne pas imposer une migration pour démarrer une campagne.
    standardUncertainty = asFiniteNumber(standard.Incertitude)
  }

  if (standardResolution == null || standardResolution < 0) {
    throw new Error("La résolution de l'étalon doit être renseignée.")
  }
  if (standardUncertainty == null || standardUncertainty < 0) {
    throw new Error("L'incertitude maximale de l'étalon doit être renseignée.")
  }

  const moduleIdValue = asFiniteNumber(standard.Id_Module)
  const standardModuleId = moduleIdValue != null && Number.isInteger(moduleIdValue) && moduleIdValue > 0
    ? moduleIdValue
    : null
  const standardModule = standardModuleId
    ? await prisma.t_module.findUnique({
        where: { Id_Module: standardModuleId },
        select: { Module_Numero_Serie: true, Port_Serie: true },
      })
    : null
  const directPort = standard.Port_Serie == null ? "" : String(standard.Port_Serie).trim()
  const standardPort = standardModule?.Port_Serie?.trim() || directPort
  if (!standardPort) throw new Error("Aucun port série n'est défini pour l'étalon sélectionné.")

  const certificate = await prisma.t_certif.findFirst({
    where: { Etalon_Numero_Serie: standardSerial },
    orderBy: [{ Date: "desc" }, { Id_Certif: "desc" }],
    select: { Organisme: true, Date: true, Numero: true, Unite: true },
  })
  const standardUnit = certificate?.Unite?.trim() || null
  const expectedUnitKey = normalizeUnitKey(expectedUnit)
  const standardUnitKey = normalizeUnitKey(standardUnit)
  if (expectedUnitKey && standardUnitKey && expectedUnitKey !== standardUnitKey) {
    throw new Error("L'étalon doit utiliser la même unité que les sondes sélectionnées.")
  }

  const mediumRows = await fetchIntercomparisonMediaRows("all")
  const medium = mediumRows.find((row) => asFiniteNumber(row.Id_Milieu) === mediumId)
  const mediumArchived = Boolean(Number(medium?.Est_Archive ?? 0))
  if (!medium || mediumArchived) {
    throw new Error("Milieu d'intercomparaison introuvable ou archive.")
  }
  const mediumStability = asFiniteNumber(medium.Stabilite)
  const mediumHomogeneity = asFiniteNumber(medium.Homogeneite)
  if (mediumStability == null || mediumStability < 0 || mediumHomogeneity == null || mediumHomogeneity < 0) {
    throw new Error("La stabilité et l'homogenéite du milieu doivent être renseignées.")
  }

  return {
    standardId,
    standardSerial,
    standardModuleName: standardModule?.Module_Numero_Serie ?? null,
    standardPort,
    standardUnit,
    standardResolution,
    standardUncertainty,
    standardOrganization: certificate?.Organisme ?? null,
    standardCertificateDate: certificate?.Date ? certificate.Date.toISOString() : null,
    standardCertificateNumber: certificate?.Numero ?? null,
    mediumId,
    mediumStability,
    mediumHomogeneity,
  }
}

async function readGspMeasurement(target: CalibrationReadTarget): Promise<CalibrationReading> {
  const measuredAt = nowIso()
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
        serial: target.serialNumber,
        action: "read",
        operationContext: "ETALONNAGE",
        manualPort: normalizeSerialPortName(target.modulePort),
        manualAddress: target.address?.trim() || undefined,
        manualModule: target.moduleName?.trim() || undefined,
        readTimeoutMs: 6000,
        writeTimeoutMs: 4000,
        gsp: { listenWindowMs: 500 },
      }),
    })
    const payload = await response.json().catch(() => null)
    const raw = payload?.data ?? payload ?? {}
    const success = response.ok && Boolean(raw?.Success ?? raw?.success ?? payload?.ok ?? false)
    if (!success) {
      return {
        value: null,
        rawValue: raw?.RawValue == null ? null : String(raw.RawValue),
        unit: target.unit ?? (raw?.Unit == null ? null : String(raw.Unit)),
        measuredAt,
        source: "GSP",
        error: String(raw?.Error ?? raw?.error ?? payload?.message ?? "Lecture impossible"),
      }
    }
    return {
      value: asFiniteNumber(raw?.Value),
      rawValue: raw?.RawValue == null ? null : String(raw.RawValue),
      unit: target.unit ?? (raw?.Unit == null ? null : String(raw.Unit)),
      measuredAt,
      source: "GSP",
      error: null,
    }
  } catch (error) {
    return {
      value: null,
      rawValue: null,
      unit: target.unit,
      measuredAt,
      source: "GSP",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function readCalibrationStandardPreview(
  standardId: number,
  mediumId: number,
): Promise<CalibrationReading> {
  const reference = await loadCalibrationReference(standardId, mediumId, null)
  return readGspMeasurement({
    serialNumber: reference.standardSerial,
    unit: reference.standardUnit,
    modulePort: reference.standardPort,
    moduleName: reference.standardModuleName,
    address: null,
  })
}

async function readLatestGsoMeasurement(
  sensor: ManagedCalibrationSensor,
  after: Date,
): Promise<CalibrationReading | null> {
  const address = sensor.address?.trim() || sensor.serialNumber
  const rows = isMssqlProvider()
    ? await prismaMesure.$queryRawUnsafe<GsoCalibrationMeasurementRow[]>(
        `SELECT TOP (1)
           ${quoteIdentifier("Valeur")}, ${quoteIdentifier("Valeur_Brute")}, ${quoteIdentifier("Unite")},
           ${quoteIdentifier("Date_Heure_Mesure")}
         FROM ${quoteIdentifier("tm_mesures_etalonnage")}
         WHERE (${quoteIdentifier("Sonde_Numero_serie")} = @P1 OR ${quoteIdentifier("Adresse_Sonde")} = @P2)
           AND ${quoteIdentifier("Date_Heure_Mesure")} > @P3
         ORDER BY ${quoteIdentifier("Date_Heure_Mesure")} DESC, ${quoteIdentifier("Id_Mesure_Etalonnage")} DESC`,
        sensor.serialNumber,
        address,
        after,
      )
    : await prismaMesure.$queryRawUnsafe<GsoCalibrationMeasurementRow[]>(
        `SELECT ${quoteIdentifier("Valeur")}, ${quoteIdentifier("Valeur_Brute")}, ${quoteIdentifier("Unite")},
                ${quoteIdentifier("Date_Heure_Mesure")}
         FROM ${quoteIdentifier("tm_mesures_etalonnage")}
         WHERE (${quoteIdentifier("Sonde_Numero_serie")} = ? OR ${quoteIdentifier("Adresse_Sonde")} = ?)
           AND ${quoteIdentifier("Date_Heure_Mesure")} > ?
         ORDER BY ${quoteIdentifier("Date_Heure_Mesure")} DESC, ${quoteIdentifier("Id_Mesure_Etalonnage")} DESC
         LIMIT 1`,
        sensor.serialNumber,
        address,
        after,
      )

  const row = rows[0]
  if (!row) return null
  const value = asFiniteNumber(row.Valeur) ?? asFiniteNumber(row.Valeur_Brute)
  const measuredAt = serializeStoredDbDateTime(row.Date_Heure_Mesure)
  return {
    value,
    rawValue: row.Valeur_Brute == null ? null : String(row.Valeur_Brute),
    unit: sensor.unit ?? row.Unite?.trim() ?? null,
    measuredAt: measuredAt ?? nowIso(),
    source: "GSO",
    error: value == null ? "Mesure GSO invalide" : null,
  }
}

async function persistCalibrationReading(
  sensor: ManagedCalibrationSensor,
  reading: CalibrationReading,
  order: number | null,
  standardValue: number | null,
) {
  if (reading.value == null) return
  const measuredAt = new Date(reading.measuredAt)
  await prismaMesure.$executeRaw`
    INSERT INTO tm_mesures_etalonnage
      (Id_Serveur_BDD, Valeur, Valeur_Brute, Unite, Date_Heure_Mesure,
       Sonde_Numero_serie, Adresse_Sonde, Numero_Ordre, Mesure_Sonde, Mesure_Etalon)
    VALUES
      (${DEFAULT_SERVER_BDD_ID}, ${reading.value}, ${asFiniteNumber(reading.rawValue)}, ${reading.unit}, ${measuredAt},
       ${sensor.serialNumber}, ${sensor.address}, ${order}, ${reading.value}, ${standardValue})
  `
}

async function restoreManagedSensors(sensors: ManagedCalibrationSensor[]) {
  const sensorUpdates = sensors.map((sensor) => prisma.t_sonde.update({
    where: { Id_Sonde: sensor.id },
    data: {
      Surveillance_Etat: sensor.previousSensorState,
      Etat_Sonde_N1: sensor.previousSensorStateN1,
    },
  }))
  const locations = new Map<number, ManagedCalibrationSensor["locations"][number]>()
  for (const sensor of sensors) {
    for (const location of sensor.locations) {
      if (!locations.has(location.id)) locations.set(location.id, location)
    }
  }
  const locationUpdates = [...locations.values()].map((location) => prisma.t_lieu.update({
    where: { Id_Lieu: location.id },
    data: {
      Lieu_Etat: location.previousState ?? "D",
      Lieu_Etat_N1: location.previousStateN1,
    },
  }))

  if (sensorUpdates.length || locationUpdates.length) {
    await prisma.$transaction([...sensorUpdates, ...locationUpdates])
  }
  await updateSensorMetrologyFlags(sensors.map((sensor) => sensor.id), {
    metrologyInProgress: 0,
    metrologyCommandSent: 0,
  })
}

async function restoreSessionStates(session: CalibrationSession) {
  let firstError: unknown = null
  try {
    await restoreManagedSensors(session.sensors)
  } catch (error) {
    firstError = error
  }
  try {
    await restoreCalibrationSensorStates(session.userId)
  } catch (error) {
    firstError ??= error
  }
  if (firstError) throw firstError
}

function releaseSensorLocks(session: CalibrationSession) {
  for (const sensor of session.sensors) {
    if (sensorLocks.get(sensor.id) === session.id) sensorLocks.delete(sensor.id)
  }
}

async function persistCalibrationResults(session: CalibrationSession) {
  if (session.standardSamples.length !== CALIBRATION_SAMPLE_COUNT) {
    throw new Error("La campagne ne contient pas les 10 mesures etalon attendues.")
  }

  const standardValues = session.standardSamples.map((sample) => sample.value)
  const completedAt = new Date()
  const results: Record<number, CalibrationResult> = {}

  await prisma.$transaction(async (tx) => {
    for (const sensor of session.sensors) {
      const samples = session.sensorSamples[sensor.id] ?? []
      if (samples.length !== CALIBRATION_SAMPLE_COUNT) {
        throw new Error(`La sonde ${sensor.serialNumber} ne contient pas 10 mesures exploitables.`)
      }

      const calculation = calculateCalibrationResult(
        samples.map((sample) => sample.value),
        standardValues,
        {
          standardResolution: session.standardResolution,
          standardUncertainty: session.standardUncertainty,
          mediumStability: session.mediumStability,
          mediumHomogeneity: session.mediumHomogeneity,
          sensorResolution: DEFAULT_SENSOR_RESOLUTION,
        },
      )

      const calibration = await tx.t_etalonnage.create({
        data: {
          Date_Heure_Etalonnage: completedAt,
          Sonde_Numero_Serie: sensor.serialNumber,
          Operateur: session.operator,
          Etalon_Numero_Serie: session.standardSerial,
          Date_Certif: session.standardCertificateDate ? new Date(session.standardCertificateDate) : null,
          Organisme: session.standardOrganization,
          Num_Certif: session.standardCertificateNumber,
          Unite: sensor.unit ?? session.standardUnit,
          Incertitude: calculation.uncertainty,
          Moyenne_Etalon: calculation.meanStandard,
          Moyenne_Sonde: calculation.meanSensor,
          Repetabilite: String(calculation.standardDeviation),
          Id_Bain: session.mediumId,
          Err_Justesse: calculation.accuracyError,
        },
      })

      await tx.t_etalonnage_mesure.createMany({
        data: samples.map((sample, index) => ({
          Id_Etalonnage: calibration.Id_Etalonnage,
          Numero_Ordre: sample.order,
          Mesure_Sonde: sample.value,
          Mesure_Etalon: session.standardSamples[index]?.value ?? null,
        })),
      })

      results[sensor.id] = {
        calibrationId: calibration.Id_Etalonnage,
        sensorId: sensor.id,
        serialNumber: sensor.serialNumber,
        meanSensor: calculation.meanSensor,
        meanStandard: calculation.meanStandard,
        accuracyError: calculation.accuracyError,
        uncertainty: calculation.uncertainty,
        standardDeviation: calculation.standardDeviation,
      }
    }
  })

  return results
}

async function completeCalibrationAcquisition(session: CalibrationSession) {
  if (session.loopTimer) clearTimeout(session.loopTimer)
  session.loopTimer = null
  session.stopRequested = true

  try {
    session.results = await persistCalibrationResults(session)
    session.status = "completed"
    session.phase = "completed"
    session.stoppedAt = nowIso()
    session.message = `Etalonnage termine : ${CALIBRATION_SAMPLE_COUNT} mesures valides ont ete enregistrees.`
    session.lastError = null
    session.lastUpdatedAt = nowIso()
    log.info("METROLOGY_CALIBRATION", "acquisition_completed", {
      sessionId: session.id,
      userId: session.userId,
      standard: session.standardSerial,
      sampleCount: session.standardSamples.length,
      sensors: session.sensors.map((sensor) => sensor.serialNumber),
    })
  } catch (error) {
    session.status = "failed"
    session.phase = "completed"
    session.stoppedAt = nowIso()
    session.lastError = error instanceof Error ? error.message : String(error)
    session.message = "Le calcul ou l'enregistrement de l'etalonnage a echoue."
    session.lastUpdatedAt = nowIso()
    log.error("METROLOGY_CALIBRATION", "acquisition_completion_failed", {
      sessionId: session.id,
      userId: session.userId,
      error: session.lastError,
    })
  }

  try {
    await restoreSessionStates(session)
  } catch (error) {
    session.status = "failed"
    session.lastError = error instanceof Error ? error.message : String(error)
    session.message = "L'etalonnage est termine mais la restauration des etats a rencontre une erreur."
    session.lastUpdatedAt = nowIso()
  } finally {
    releaseSensorLocks(session)
  }
}

async function runMeasurementLoop(session: CalibrationSession) {
  session.loopTimer = null
  if (session.stopRequested || session.status !== "running") return
  const loopStartedAt = Date.now()

  const standardReading = await readGspMeasurement({
    serialNumber: session.standardSerial,
    unit: session.standardUnit,
    modulePort: session.standardPort,
    moduleName: session.standardModuleName,
    address: null,
  })
  session.latestStandardReading = standardReading
  session.lastUpdatedAt = nowIso()

  const cycleReadings = new Map<number, CalibrationReading>()
  for (const sensor of session.sensors) {
    if (session.stopRequested || session.status !== "running") break
    try {
      const previous = session.latestReadings[sensor.id]
      const reading = sensor.isGso
        ? await readLatestGsoMeasurement(sensor, previous ? new Date(previous.measuredAt) : new Date(session.startedAt))
        : await readGspMeasurement(sensor)
      if (!reading) continue

      session.latestReadings[sensor.id] = reading
      cycleReadings.set(sensor.id, reading)
      session.lastUpdatedAt = nowIso()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const failedReading: CalibrationReading = {
        value: null,
        rawValue: null,
        unit: sensor.unit,
        measuredAt: nowIso(),
        source: sensor.isGso ? "GSO" : "GSP",
        error: message,
      }
      session.latestReadings[sensor.id] = failedReading
      cycleReadings.set(sensor.id, failedReading)
      session.lastError = message
      session.lastUpdatedAt = nowIso()
      log.warn("METROLOGY_CALIBRATION", "measurement_read_failed", {
        sessionId: session.id,
        serial: sensor.serialNumber,
        error: message,
      })
    }
  }

  const acquisitionOrder = session.phase === "acquiring" ? session.standardSamples.length + 1 : null
  const standardValue = hasUsableReading(standardReading) ? standardReading.value : null
  for (const sensor of session.sensors) {
    const reading = cycleReadings.get(sensor.id)
    if (!sensor.isGso && reading?.value != null) {
      await persistCalibrationReading(sensor, reading, acquisitionOrder, standardValue).catch((error) => {
        log.warn("METROLOGY_CALIBRATION", "measurement_persist_failed", {
          sessionId: session.id,
          serial: sensor.serialNumber,
          error: error instanceof Error ? error.message : String(error),
        })
      })
    }
  }

  if (session.phase === "acquiring") {
    const completeCycle =
      standardValue != null &&
      session.sensors.every((sensor) => {
        const reading = cycleReadings.get(sensor.id)
        return typeof reading?.value === "number" && Number.isFinite(reading.value)
      })

    if (completeCycle && acquisitionOrder != null) {
      session.standardSamples.push({
        order: acquisitionOrder,
        value: standardValue,
        measuredAt: standardReading.measuredAt,
        unit: standardReading.unit ?? session.standardUnit,
      })

      for (const sensor of session.sensors) {
        const reading = cycleReadings.get(sensor.id)!
        const sensorSamples = (session.sensorSamples[sensor.id] ??= [])
        sensorSamples.push({
          order: acquisitionOrder,
          value: reading.value!,
          measuredAt: reading.measuredAt,
          unit: reading.unit ?? sensor.unit,
        })
        session.readingCounts[sensor.id] = acquisitionOrder
      }

      session.message = `Acquisition etalonnage : ${acquisitionOrder}/${CALIBRATION_SAMPLE_COUNT} mesure(s) valide(s).`
      session.lastError = null
      session.lastUpdatedAt = nowIso()

      if (session.standardSamples.length >= CALIBRATION_SAMPLE_COUNT) {
        await completeCalibrationAcquisition(session)
        return
      }
    } else {
      session.message = `Acquisition etalonnage : ${session.standardSamples.length}/${CALIBRATION_SAMPLE_COUNT}. Attente d'un cycle complet et valide.`
      session.lastUpdatedAt = nowIso()
    }
  } else {
    session.message = canStartAcquisition(session)
      ? "Lecture active. Toutes les valeurs necessaires sont disponibles pour demarrer l'etalonnage."
      : "Lecture active. Attente d'une valeur valide pour l'etalon et chaque sonde."
    session.lastUpdatedAt = nowIso()
  }

  if (session.stopRequested || session.status !== "running") return
  const delay = Math.max(0, CALIBRATION_INTERVAL_MS - (Date.now() - loopStartedAt))
  session.loopTimer = setTimeout(() => void runMeasurementLoop(session), delay)
}

export async function getCalibrationSessionForUser(userId: number) {
  const session = sessionsByUserId.get(userId)
  return session ? toPublicSession(session) : null
}

export async function startCalibrationSession(
  user: JWTPayload,
  input: { selectedSensorIds: number[]; operator: string; standardId: number; mediumId: number },
) {
  const existing = sessionsByUserId.get(user.userId)
  if (existing?.status === "running") {
    throw new Error("Une session d'etalonnage est deja en cours pour cet utilisateur.")
  }

  const selectedIds = [...new Set(input.selectedSensorIds)]
  const lockedId = selectedIds.find((id) => sensorLocks.has(id))
  if (lockedId) throw new Error("Une des sondes selectionnees est deja utilisee par un etalonnage.")

  const sensors = await loadManagedSensors(selectedIds)
  const unitKeys = new Set(sensors.map((sensor) => normalizeUnitKey(sensor.unit)).filter(Boolean))
  if (unitKeys.size > 1) throw new Error("Toutes les sondes d'un etalonnage doivent utiliser la meme unite.")
  const reference = await loadCalibrationReference(input.standardId, input.mediumId, sensors[0]?.unit ?? null)

  const session: CalibrationSession = {
    ...reference,
    id: randomUUID(),
    userId: user.userId,
    username: user.username,
    userProfile: user.profile,
    operator: input.operator.trim() || user.username,
    startedAt: nowIso(),
    stoppedAt: null,
    intervalSeconds: CALIBRATION_INTERVAL_MS / 1000,
    status: "running",
    phase: "acquiring",
    stopRequested: false,
    sensors,
    latestStandardReading: null,
    latestReadings: {},
    readingCounts: Object.fromEntries(sensors.map((sensor) => [sensor.id, 0])),
    standardSamples: [],
    sensorSamples: Object.fromEntries(sensors.map((sensor) => [sensor.id, []])),
    results: {},
    message: `Acquisition etalonnage demarree : 0/${CALIBRATION_SAMPLE_COUNT}.`,
    lastError: null,
    lastUpdatedAt: nowIso(),
    loopTimer: null,
  }

  const sensorUpdates = sensors
    .filter((sensor) => sensor.sensorStateChanged)
    .map((sensor) => prisma.t_sonde.update({
      where: { Id_Sonde: sensor.id },
      data: { Surveillance_Etat: "D", Etat_Sonde_N1: sensor.previousSensorState },
    }))
  const locationMap = new Map<number, ManagedCalibrationSensor["locations"][number]>()
  for (const sensor of sensors) {
    for (const location of sensor.locations) {
      if (location.stateChanged && !locationMap.has(location.id)) locationMap.set(location.id, location)
    }
  }
  const locationUpdates = [...locationMap.values()].map((location) => prisma.t_lieu.update({
    where: { Id_Lieu: location.id },
    data: { Lieu_Etat: "D", Lieu_Etat_N1: location.previousState },
  }))

  try {
    if (sensorUpdates.length || locationUpdates.length) {
      await prisma.$transaction([...sensorUpdates, ...locationUpdates])
    }
    await updateSensorMetrologyFlags(sensors.map((sensor) => sensor.id), { metrologyInProgress: 1 })
    for (const sensor of sensors) sensorLocks.set(sensor.id, session.id)
    sessionsByUserId.set(user.userId, session)
    log.info("METROLOGY_CALIBRATION", "operation_started", {
      sessionId: session.id,
      userId: user.userId,
      standard: session.standardSerial,
      mediumId: session.mediumId,
      sensors: sensors.map((sensor) => sensor.serialNumber),
    })
    session.loopTimer = setTimeout(() => void runMeasurementLoop(session), 500)
    return toPublicSession(session)
  } catch (error) {
    sessionsByUserId.set(user.userId, session)
    await restoreSessionStates(session).catch(() => undefined)
    sessionsByUserId.delete(user.userId)
    releaseSensorLocks(session)
    throw error
  }
}

export async function startCalibrationAcquisition(userId: number) {
  const session = sessionsByUserId.get(userId)
  if (!session || session.status !== "running") throw new Error("Aucune session d'etalonnage active.")
  if (session.phase !== "reading") throw new Error("L'acquisition est deja lancee ou terminee.")
  if (!canStartAcquisition(session)) {
    throw new Error("Une premiere lecture valide de l'etalon et de chaque sonde est requise.")
  }

  session.phase = "acquiring"
  session.standardSamples = []
  session.sensorSamples = Object.fromEntries(session.sensors.map((sensor) => [sensor.id, []]))
  session.readingCounts = Object.fromEntries(session.sensors.map((sensor) => [sensor.id, 0]))
  session.results = {}
  session.message = `Acquisition etalonnage demarree : 0/${CALIBRATION_SAMPLE_COUNT}.`
  session.lastError = null
  session.lastUpdatedAt = nowIso()

  log.info("METROLOGY_CALIBRATION", "acquisition_started", {
    sessionId: session.id,
    userId,
    standard: session.standardSerial,
    sensors: session.sensors.map((sensor) => sensor.serialNumber),
    sampleTarget: CALIBRATION_SAMPLE_COUNT,
  })

  return toPublicSession(session)
}

export async function addCalibrationSensor(userId: number, sensorId: number) {
  const session = sessionsByUserId.get(userId)
  if (!session || session.status !== "running") throw new Error("Aucune session d'etalonnage active.")
  if (session.phase !== "reading") {
    throw new Error("Impossible d'ajouter une sonde apres le demarrage des 10 mesures.")
  }
  if (session.sensors.some((sensor) => sensor.id === sensorId)) return toPublicSession(session)
  if (sensorLocks.has(sensorId)) throw new Error("Cette sonde est deja utilisee par un autre etalonnage.")

  const [sensor] = await loadManagedSensors([sensorId])
  const currentUnit = normalizeUnitKey(session.sensors[0]?.unit)
  const addedUnit = normalizeUnitKey(sensor.unit)
  if (currentUnit && addedUnit !== currentUnit) {
    throw new Error("La sonde ajoutee doit utiliser la meme unite que l'etalonnage en cours.")
  }

  try {
    const locationUpdates = sensor.locations
      .filter((location) => location.stateChanged)
      .map((location) => prisma.t_lieu.update({
        where: { Id_Lieu: location.id },
        data: { Lieu_Etat: "D", Lieu_Etat_N1: location.previousState },
      }))
    await prisma.$transaction([
      prisma.t_sonde.update({
        where: { Id_Sonde: sensor.id },
        data: { Surveillance_Etat: "E", Etat_Sonde_N1: sensor.previousSensorState },
      }),
      ...locationUpdates,
    ])
    await updateSensorMetrologyFlags([sensor.id], { metrologyInProgress: 1 })
    sensorLocks.set(sensor.id, session.id)
    session.sensors.push(sensor)
    session.readingCounts[sensor.id] = 0
    session.sensorSamples[sensor.id] = []
    delete session.latestReadings[sensor.id]
    session.lastUpdatedAt = nowIso()
    log.info("METROLOGY_CALIBRATION", "sensor_added", {
      sessionId: session.id,
      userId,
      sensor: sensor.serialNumber,
    })
    return toPublicSession(session)
  } catch (error) {
    sensorLocks.delete(sensor.id)
    await restoreManagedSensors([sensor]).catch(() => undefined)
    throw error
  }
}

export async function stopCalibrationSession(userId: number) {
  const session = sessionsByUserId.get(userId)
  if (!session) throw new Error("Aucune session d'etalonnage active.")
  if (session.status !== "running") return toPublicSession(session)

  session.stopRequested = true
  if (session.loopTimer) clearTimeout(session.loopTimer)
  session.loopTimer = null

  try {
    await restoreSessionStates(session)
    session.status = "completed"
    session.phase = "completed"
    session.stoppedAt = nowIso()
    session.message = "Lecture / etalonnage arrete. Les etats de surveillance ont ete restaures."
    session.lastUpdatedAt = nowIso()
    log.info("METROLOGY_CALIBRATION", "session_stopped", {
      sessionId: session.id,
      userId,
      phase: session.phase,
      readingCounts: session.readingCounts,
    })
  } catch (error) {
    session.status = "failed"
    session.phase = "completed"
    session.lastError = error instanceof Error ? error.message : String(error)
    session.lastUpdatedAt = nowIso()
    throw error
  } finally {
    releaseSensorLocks(session)
  }

  return toPublicSession(session)
}
