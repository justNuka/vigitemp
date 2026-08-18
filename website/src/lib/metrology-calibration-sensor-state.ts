import { prisma } from "@/lib/prisma"

type CalibrationSensorStateSnapshot = {
  id: number
  surveillanceState: string
  previousState: string | null
}

type GlobalCalibrationSensorState = {
  calibrationSensorStateSnapshots?: Map<number, CalibrationSensorStateSnapshot[]>
}

const globalState = globalThis as typeof globalThis & GlobalCalibrationSensorState
const snapshotsByUserId = (globalState.calibrationSensorStateSnapshots ??= new Map<number, CalibrationSensorStateSnapshot[]>())

export async function captureCalibrationSensorStates(userId: number, sensorIds: number[]) {
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
  snapshotsByUserId.delete(userId)
}

export async function setCalibrationSensorsToCalibrationState(userId: number) {
  const snapshots = snapshotsByUserId.get(userId)
  if (!snapshots?.length) {
    throw new Error("Etat initial des sondes d'etalonnage introuvable.")
  }

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
  const snapshots = snapshotsByUserId.get(userId)
  if (!snapshots?.length) return

  await prisma.$transaction(
    snapshots.map((snapshot) => prisma.t_sonde.update({
      where: { Id_Sonde: snapshot.id },
      data: {
        Surveillance_Etat: snapshot.surveillanceState,
        Etat_Sonde_N1: snapshot.previousState,
      },
    })),
  )

  snapshotsByUserId.delete(userId)
}
