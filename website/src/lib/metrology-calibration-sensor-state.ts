import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"

type CalibrationSensorStateSnapshot = {
  id: number
  surveillanceState: string
  previousState: string | null
}

type GlobalCalibrationSensorState = {
  calibrationSensorStateSnapshots?: Map<number, CalibrationSensorStateSnapshot[]>
  calibrationSensorRestoreTimers?: Map<number, ReturnType<typeof setTimeout>>
}

const RESTORE_RETRY_MS = 10_000
const globalState = globalThis as typeof globalThis & GlobalCalibrationSensorState
const snapshotsByUserId = (globalState.calibrationSensorStateSnapshots ??= new Map<number, CalibrationSensorStateSnapshot[]>())
const restoreTimersByUserId = (globalState.calibrationSensorRestoreTimers ??= new Map<number, ReturnType<typeof setTimeout>>())

function clearRestoreTimer(userId: number) {
  const timer = restoreTimersByUserId.get(userId)
  if (timer) clearTimeout(timer)
  restoreTimersByUserId.delete(userId)
}

function scheduleRestoreRetry(userId: number) {
  clearRestoreTimer(userId)
  const timer = setTimeout(() => {
    restoreTimersByUserId.delete(userId)
    void restoreCalibrationSensorStates(userId).catch(() => undefined)
  }, RESTORE_RETRY_MS)
  restoreTimersByUserId.set(userId, timer)
}

export async function captureCalibrationSensorStates(userId: number, sensorIds: number[]) {
  clearRestoreTimer(userId)
  const ids = [...new Set(sensorIds)]
  const sensors = await prisma.t_sonde.findMany({
    where: { Id_Sonde: { in: ids } },
    select: {
      Id_Sonde: true,
      Surveillance_Etat: true,
      Etat_Sonde_N1: true,
    },
  })

  if (sensors.length !== ids.length) {
    throw new Error("Une ou plusieurs sondes sont introuvables.")
  }

  const snapshots = sensors.map((sensor) => ({
    id: sensor.Id_Sonde,
    surveillanceState: sensor.Surveillance_Etat,
    previousState: sensor.Etat_Sonde_N1,
  }))

  snapshotsByUserId.set(userId, snapshots)
  return snapshots
}

export function clearCalibrationSensorStates(userId: number) {
  clearRestoreTimer(userId)
  snapshotsByUserId.delete(userId)
}

export async function setCalibrationSensorsToCalibrationState(userId: number) {
  const snapshots = snapshotsByUserId.get(userId)
  if (!snapshots?.length) {
    throw new Error("Etat initial des sondes d'etalonnage introuvable.")
  }

  // All selected sensors must enter E, regardless of their initial S/D state.
  // The original state remains stored in memory and in Etat_Sonde_N1.
  await prisma.$transaction(
    snapshots.map((snapshot) => prisma.t_sonde.update({
      where: { Id_Sonde: snapshot.id },
      data: {
        Surveillance_Etat: "E",
        Etat_Sonde_N1: snapshot.surveillanceState,
      },
    })),
  )
}

export async function restoreCalibrationSensorStates(userId: number) {
  clearRestoreTimer(userId)
  const snapshots = snapshotsByUserId.get(userId)
  if (!snapshots?.length) return

  const failures: Array<{ sensorId: number; error: unknown }> = []

  // Restore probes independently. A single failing update must not roll back the
  // restoration of all the other selected probes and leave them blocked in E.
  for (const snapshot of snapshots) {
    try {
      await prisma.t_sonde.update({
        where: { Id_Sonde: snapshot.id },
        data: {
          Surveillance_Etat: snapshot.surveillanceState,
          Etat_Sonde_N1: snapshot.previousState,
        },
      })
    } catch (error) {
      failures.push({ sensorId: snapshot.id, error })
    }
  }

  if (failures.length > 0) {
    log.error("METROLOGY_CALIBRATION", "sensor_state_restore_partial_failure", {
      userId,
      failures: failures.map((failure) => ({
        sensorId: failure.sensorId,
        error: failure.error instanceof Error ? failure.error.message : String(failure.error),
      })),
    })
    // Keep the original snapshots and retry independently from the calibration
    // session status. This also covers a session already marked as failed.
    scheduleRestoreRetry(userId)
    throw new Error("Une ou plusieurs sondes n'ont pas pu retrouver leur etat initial.")
  }

  snapshotsByUserId.delete(userId)
}
