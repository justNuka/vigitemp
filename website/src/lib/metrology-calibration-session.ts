import { randomUUID } from "crypto"

import type { AdjustmentSensorRow } from "@/hooks/useAdjustmentSensors"
import { serializeStoredDbDateTime } from "@/lib/date-display"
import { hasMainDbColumn } from "@/lib/db-schema"
import { getHotlineServerConfig } from "@/lib/hotline-config"
import type { JWTPayload } from "@/lib/jwt"
import { log } from "@/lib/logger"
import { getSensorFamilyFromSerial } from "@/lib/sensor-naming"
import { prisma, prismaMesure } from "@/lib/prisma"
import { getTableReference, isMssqlProvider, quoteIdentifier } from "@/lib/metrology-db"

const DEFAULT_SERVER_PORT = 5310
const DEFAULT_SERVER_BDD_ID = 1
const CALIBRATION_INTERVAL_MS = 60_000

type CalibrationStatus = "running" | "completed" | "failed"

export type CalibrationReading = {
  value: number | null
  rawValue: string | null
  unit: string | null
  measuredAt: string
  source: "GSP" | "GSO"
  error: string | null
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

type CalibrationSession = {
  id: string
  userId: number
  username: string
  userProfile: string
  operator: string
  startedAt: string
  stoppedAt: string | null
  intervalSeconds: number
  status: CalibrationStatus
  stopRequested: boolean
  sensors: ManagedCalibrationSensor[]
  latestReadings: Record<number, CalibrationReading>
  readingCounts: Record<number, number>
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
  latestReadings: Record<number, CalibrationReading>
  readingCounts: Record<number, number>
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

const globalState = globalThis as typeof globalThis & GlobalCalibrationState
const sessionsByUserId = (globalState.calibrationSessionsByUserId ??= new Map<number, CalibrationSession>())
const sensorLocks = (globalState.calibrationSensorLocks ??= new Map<number, string>())

function nowIso() {
  return new Date().toISOString()
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."))
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

function toPublicSession(session: CalibrationSession): PublicCalibrationSession {
  return {
    id: session.id,
    operator: session.operator,
    startedAt: session.startedAt,
    stoppedAt: session.stoppedAt,
    intervalSeconds: session.intervalSeconds,
    status: session.status,
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
    latestReadings: session.latestReadings,
    readingCounts: session.readingCounts,
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
  const modulesById = new Map(modules.map((module) => [module.Id_Module, module]))

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
      unit: row.t_sonde_type?.Unite?.trim() || null,
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

async function readGspMeasurement(sensor: ManagedCalibrationSensor): Promise<CalibrationReading> {
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
        serial: sensor.serialNumber,
        action: "read",
        operationContext: "ETALONNAGE",
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
    if (!success) {
      return {
        value: null,
        rawValue: raw?.RawValue == null ? null : String(raw.RawValue),
        unit: raw?.Unit == null ? sensor.unit : String(raw.Unit),
        measuredAt,
        source: "GSP",
        error: String(raw?.Error ?? raw?.error ?? payload?.message ?? "Lecture impossible"),
      }
    }
    return {
      value: asFiniteNumber(raw?.Value),
      rawValue: raw?.RawValue == null ? null : String(raw.RawValue),
      unit: raw?.Unit == null ? sensor.unit : String(raw.Unit),
      measuredAt,
      source: "GSP",
      error: null,
    }
  } catch (error) {
    return {
      value: null,
      rawValue: null,
      unit: sensor.unit,
      measuredAt,
      source: "GSP",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function readLatestGsoMeasurement(
  sensor: ManagedCalibrationSensor,
  after: Date,
): Promise<CalibrationReading | null> {
  const address = sensor.address?.trim() || sensor.serialNumber
  const rows = isMssqlProvider()
    ? await prismaMesure.$queryRawUnsafe<GsoCalibrationMeasurementRow[]>(
        `SELECT TOP (1)
           ${quoteIdentifier("Valeur")},
           ${quoteIdentifier("Valeur_Brute")},
           ${quoteIdentifier("Unite")},
           ${quoteIdentifier("Date_Heure_Mesure")}
         FROM ${quoteIdentifier("tm_mesures_etalonnage")}
         WHERE (
           ${quoteIdentifier("Sonde_Numero_serie")} = @P1
           OR ${quoteIdentifier("Adresse_Sonde")} = @P2
         )
           AND ${quoteIdentifier("Date_Heure_Mesure")} > @P3
         ORDER BY ${quoteIdentifier("Date_Heure_Mesure")} DESC,
                  ${quoteIdentifier("Id_Mesure_Etalonnage")} DESC`,
        sensor.serialNumber,
        address,
        after,
      )
    : await prismaMesure.$queryRawUnsafe<GsoCalibrationMeasurementRow[]>(
        `SELECT
           ${quoteIdentifier("Valeur")},
           ${quoteIdentifier("Valeur_Brute")},
           ${quoteIdentifier("Unite")},
           ${quoteIdentifier("Date_Heure_Mesure")}
         FROM ${quoteIdentifier("tm_mesures_etalonnage")}
         WHERE (
           ${quoteIdentifier("Sonde_Numero_serie")} = ?
           OR ${quoteIdentifier("Adresse_Sonde")} = ?
         )
           AND ${quoteIdentifier("Date_Heure_Mesure")} > ?
         ORDER BY ${quoteIdentifier("Date_Heure_Mesure")} DESC,
                  ${quoteIdentifier("Id_Mesure_Etalonnage")} DESC
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
    unit: row.Unite?.trim() || sensor.unit,
    measuredAt: measuredAt ?? nowIso(),
    source: "GSO",
    error: value == null ? "Mesure GSO invalide" : null,
  }
}

async function persistCalibrationReading(
  sensor: ManagedCalibrationSensor,
  reading: CalibrationReading,
  order: number,
) {
  if (reading.value == null) return
  const measuredAt = new Date(reading.measuredAt)
  await prismaMesure.$executeRaw`
    INSERT INTO tm_mesures_etalonnage
      (Id_Serveur_BDD, Valeur, Valeur_Brute, Unite, Date_Heure_Mesure,
       Sonde_Numero_serie, Adresse_Sonde, Numero_Ordre, Mesure_Sonde, Mesure_Etalon)
    VALUES
      (${DEFAULT_SERVER_BDD_ID}, ${reading.value}, ${asFiniteNumber(reading.rawValue)}, ${reading.unit}, ${measuredAt},
       ${sensor.serialNumber}, ${sensor.address}, ${order}, ${reading.value}, ${null})
  `
}

async function readSensor(session: CalibrationSession, sensor: ManagedCalibrationSensor) {
  const previous = session.latestReadings[sensor.id]
  const reading = sensor.isGso
    ? await readLatestGsoMeasurement(sensor, previous ? new Date(previous.measuredAt) : new Date(session.startedAt))
    : await readGspMeasurement(sensor)

  if (!reading) return
  session.latestReadings[sensor.id] = reading
  session.lastUpdatedAt = nowIso()

  if (reading.value != null) {
    const order = (session.readingCounts[sensor.id] ?? 0) + 1
    session.readingCounts[sensor.id] = order
    if (!sensor.isGso) {
      try {
        await persistCalibrationReading(sensor, reading, order)
      } catch (error) {
        log.warn("METROLOGY_CALIBRATION", "measurement_persist_failed", {
          sessionId: session.id,
          serial: sensor.serialNumber,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }
}

async function runMeasurementLoop(session: CalibrationSession) {
  if (session.stopRequested || session.status !== "running") return
  const loopStartedAt = Date.now()

  for (const sensor of session.sensors) {
    if (session.stopRequested || session.status !== "running") break
    try {
      await readSensor(session, sensor)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      session.latestReadings[sensor.id] = {
        value: null,
        rawValue: null,
        unit: sensor.unit,
        measuredAt: nowIso(),
        source: sensor.isGso ? "GSO" : "GSP",
        error: message,
      }
      session.lastError = message
      session.lastUpdatedAt = nowIso()
      log.warn("METROLOGY_CALIBRATION", "measurement_read_failed", {
        sessionId: session.id,
        serial: sensor.serialNumber,
        error: message,
      })
    }
  }

  if (session.stopRequested || session.status !== "running") return
  const delay = Math.max(0, CALIBRATION_INTERVAL_MS - (Date.now() - loopStartedAt))
  session.loopTimer = setTimeout(() => void runMeasurementLoop(session), delay)
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
  let stateError: unknown = null
  try {
    await restoreManagedSensors(session.sensors)
  } catch (error) {
    stateError = error
  }
  if (stateError) throw stateError
}

function releaseSensorLocks(session: CalibrationSession) {
  for (const sensor of session.sensors) {
    if (sensorLocks.get(sensor.id) === session.id) sensorLocks.delete(sensor.id)
  }
}

export async function getCalibrationSessionForUser(userId: number) {
  const session = sessionsByUserId.get(userId)
  return session ? toPublicSession(session) : null
}

export async function startCalibrationSession(
  user: JWTPayload,
  input: { selectedSensorIds: number[]; operator: string },
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

  const session: CalibrationSession = {
    id: randomUUID(),
    userId: user.userId,
    username: user.username,
    userProfile: user.profile,
    operator: input.operator.trim() || user.username,
    startedAt: nowIso(),
    stoppedAt: null,
    intervalSeconds: 60,
    status: "running",
    stopRequested: false,
    sensors,
    latestReadings: {},
    readingCounts: {},
    message: null,
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
    log.info("METROLOGY_CALIBRATION", "session_started", {
      sessionId: session.id,
      userId: user.userId,
      sensors: sensors.map((sensor) => sensor.serialNumber),
    })
    void runMeasurementLoop(session)
    return toPublicSession(session)
  } catch (error) {
    sessionsByUserId.set(user.userId, session)
    await restoreSessionStates(session).catch(() => undefined)
    sessionsByUserId.delete(user.userId)
    releaseSensorLocks(session)
    throw error
  }
}

export async function addCalibrationSensor(userId: number, sensorId: number) {
  const session = sessionsByUserId.get(userId)
  if (!session || session.status !== "running") {
    throw new Error("Aucune session d'etalonnage active.")
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
    session.stoppedAt = nowIso()
    session.message = "Etalonnage arrete. Les etats de surveillance ont ete restaures."
    session.lastUpdatedAt = nowIso()
    log.info("METROLOGY_CALIBRATION", "session_stopped", {
      sessionId: session.id,
      userId,
      readingCounts: session.readingCounts,
    })
  } catch (error) {
    session.status = "failed"
    session.lastError = error instanceof Error ? error.message : String(error)
    session.lastUpdatedAt = nowIso()
    throw error
  } finally {
    releaseSensorLocks(session)
  }

  return toPublicSession(session)
}
