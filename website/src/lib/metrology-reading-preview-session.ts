import { hasMainDbColumn } from "@/lib/db-schema"
import { log } from "@/lib/logger"
import { getTableReference, isMssqlProvider, quoteIdentifier } from "@/lib/metrology-db"
import { prisma } from "@/lib/prisma"

export type MetrologyPreviewOperation = "AJUSTAGE" | "ETALONNAGE"

type SensorStateSnapshot = {
  id: number
  serialNumber: string
  surveillanceState: string
  previousState: string | null
}

type MetrologyPreviewSession = {
  userId: number
  operation: MetrologyPreviewOperation
  sensorIds: number[]
  sensors: SensorStateSnapshot[]
  startedAt: string
  lastTouchedAt: string
  expirationTimer: ReturnType<typeof setTimeout> | null
}

type GlobalMetrologyPreviewState = {
  metrologyPreviewSessionsByUserId?: Map<number, MetrologyPreviewSession>
}

// The UI polls every 60 seconds when at least one GSO is selected. Keeping a
// 150-second idle window prevents a browser close/navigation from leaving
// sensors in a metrology state indefinitely while still tolerating a late poll.
const PREVIEW_IDLE_TIMEOUT_MS = 150_000
const PREVIEW_RESTORE_RETRY_MS = 10_000

const globalState = globalThis as typeof globalThis & GlobalMetrologyPreviewState
const sessionsByUserId = (globalState.metrologyPreviewSessionsByUserId ??= new Map<number, MetrologyPreviewSession>())

function normalizeIds(ids: number[]) {
  return [...new Set(ids)].sort((a, b) => a - b)
}

function sameIds(left: number[], right: number[]) {
  return left.length === right.length && left.every((id, index) => id === right[index])
}

function getTargetState(operation: MetrologyPreviewOperation) {
  return operation === "ETALONNAGE" ? "E" : "A"
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

function clearExpirationTimer(session: MetrologyPreviewSession) {
  if (session.expirationTimer) clearTimeout(session.expirationTimer)
  session.expirationTimer = null
}

async function restorePreviewSession(session: MetrologyPreviewSession, reason: string) {
  clearExpirationTimer(session)

  const errors: Array<{ sensorId?: number; error: unknown }> = []

  // Restore each sensor independently. One malformed/deleted row must not keep
  // every other selected sensor blocked in E/A.
  for (const sensor of session.sensors) {
    try {
      await prisma.t_sonde.update({
        where: { Id_Sonde: sensor.id },
        data: {
          Surveillance_Etat: sensor.surveillanceState,
          Etat_Sonde_N1: sensor.previousState,
        },
      })
    } catch (error) {
      errors.push({ sensorId: sensor.id, error })
    }
  }

  try {
    await updateSensorMetrologyFlags(session.sensorIds, {
      metrologyInProgress: 0,
      metrologyCommandSent: 0,
    })
  } catch (error) {
    errors.push({ error })
  }

  if (errors.length > 0) {
    log.error("METROLOGY_READING", "preview_restore_failed", {
      userId: session.userId,
      operation: session.operation,
      reason,
      errors: errors.map((item) => ({
        sensorId: item.sensorId ?? null,
        error: item.error instanceof Error ? item.error.message : String(item.error),
      })),
    })

    // Keep the snapshot and retry in the background instead of losing the only
    // copy of the original states.
    if (sessionsByUserId.get(session.userId) === session) {
      session.expirationTimer = setTimeout(() => {
        void restorePreviewSession(session, "retry").catch(() => undefined)
      }, PREVIEW_RESTORE_RETRY_MS)
    }
    throw new Error("Impossible de restaurer completement les sondes apres la lecture simple.")
  }

  if (sessionsByUserId.get(session.userId) === session) {
    sessionsByUserId.delete(session.userId)
  }

  log.info("METROLOGY_READING", "preview_stopped", {
    userId: session.userId,
    operation: session.operation,
    reason,
    sensors: session.sensors.map((sensor) => sensor.serialNumber),
  })
}

function scheduleExpiration(session: MetrologyPreviewSession) {
  clearExpirationTimer(session)
  session.expirationTimer = setTimeout(() => {
    session.expirationTimer = null
    void restorePreviewSession(session, "idle_timeout").catch(() => undefined)
  }, PREVIEW_IDLE_TIMEOUT_MS)
}

export async function ensureMetrologyReadingPreviewSession(
  userId: number,
  selectedSensorIds: number[],
  operation: MetrologyPreviewOperation,
) {
  const sensorIds = normalizeIds(selectedSensorIds)
  const existing = sessionsByUserId.get(userId)

  if (existing && existing.operation === operation && sameIds(existing.sensorIds, sensorIds)) {
    existing.lastTouchedAt = new Date().toISOString()
    scheduleExpiration(existing)
    return {
      startedAt: existing.startedAt,
      operation: existing.operation,
      sensorIds: existing.sensorIds,
    }
  }

  if (existing) {
    await restorePreviewSession(existing, "replaced")
  }

  const rows = await prisma.t_sonde.findMany({
    where: { Id_Sonde: { in: sensorIds } },
    select: {
      Id_Sonde: true,
      Sonde_Numero_Serie: true,
      Surveillance_Etat: true,
      Etat_Sonde_N1: true,
    },
  })

  if (rows.length !== sensorIds.length) {
    throw new Error("Une ou plusieurs sondes sont introuvables.")
  }

  const sensors: SensorStateSnapshot[] = rows.map((row) => {
    const serialNumber = row.Sonde_Numero_Serie?.trim()
    if (!serialNumber) throw new Error("Une sonde selectionnee ne possede pas de numero de serie.")
    if (["A", "E"].includes(row.Surveillance_Etat)) {
      throw new Error(`La sonde ${serialNumber} est deja utilisee par une operation de metrologie.`)
    }
    return {
      id: row.Id_Sonde,
      serialNumber,
      surveillanceState: row.Surveillance_Etat,
      previousState: row.Etat_Sonde_N1,
    }
  })

  const startedAt = new Date().toISOString()
  const session: MetrologyPreviewSession = {
    userId,
    operation,
    sensorIds,
    sensors,
    startedAt,
    lastTouchedAt: startedAt,
    expirationTimer: null,
  }
  sessionsByUserId.set(userId, session)

  try {
    const targetState = getTargetState(operation)
    await prisma.$transaction(
      sensors.map((sensor) => prisma.t_sonde.update({
        where: { Id_Sonde: sensor.id },
        data: {
          Surveillance_Etat: targetState,
          Etat_Sonde_N1: sensor.surveillanceState,
        },
      })),
    )
    await updateSensorMetrologyFlags(sensorIds, {
      metrologyInProgress: 1,
      metrologyCommandSent: 0,
    })
    scheduleExpiration(session)
  } catch (error) {
    await restorePreviewSession(session, "start_rollback").catch(() => undefined)
    throw error
  }

  log.info("METROLOGY_READING", "preview_started", {
    userId,
    operation,
    targetState: getTargetState(operation),
    sensors: sensors.map((sensor) => sensor.serialNumber),
  })

  return { startedAt, operation, sensorIds }
}

export function requireMetrologyReadingPreviewSession(
  userId: number,
  operation: MetrologyPreviewOperation,
  requiredSensorIds: number[],
) {
  const session = sessionsByUserId.get(userId)
  if (!session || session.operation !== operation) {
    throw new Error("La lecture des sondes doit etre active pour valider les coefficients.")
  }

  const requiredIds = normalizeIds(requiredSensorIds)
  const activeIds = new Set(session.sensorIds)
  if (requiredIds.length === 0 || requiredIds.some((sensorId) => !activeIds.has(sensorId))) {
    throw new Error("Les coefficients ne peuvent etre modifies que pour les sondes de la lecture active.")
  }

  session.lastTouchedAt = new Date().toISOString()
  scheduleExpiration(session)
  return {
    startedAt: session.startedAt,
    operation: session.operation,
    sensorIds: [...session.sensorIds],
  }
}

export async function stopMetrologyReadingPreviewSession(userId: number) {
  const session = sessionsByUserId.get(userId)
  if (!session) return false
  await restorePreviewSession(session, "manual_or_operation_start")
  return true
}
