export type SensorTestStatus = "idle" | "waiting" | "success" | "partial" | "failed" | "no-data"

export type Sensor = {
  Id_Sonde: number
  Sonde_Numero_Serie: string
  Adresse_Sonde: string | null
  Port_Serie: string | null
  Lieu: string | null
  Module: string | null
  Famille_Sonde: string
  Surveillance_Etat: string | null
  Frequence_Mesure: number | null
  Frequence_Recup: number | null
  Signal_Lu: string | null
  Taux_Reponse: number | null
  Nombre_Total: number
  Nombre_Recu: number
  Test_Status: SensorTestStatus
  Derniere_Reponse: string | null
  Rssi: string | null
}

export type SensorWithSelection = Sensor & { selected?: boolean }

export type SensorTestCatalogPayload = {
  sensors: Array<{
    id: number
    serialNumber: string
    address: string | null
    sensorType: string | null
    family: string
    location: string | null
    module: string | null
    modulePort: string | null
    surveillanceState: string | null
    frequencyMeasure: number | null
    frequencyRecovery: number | null
  }>
}

export type SensorTestSnapshotPayload = {
  startedAt: string
  readAt: string
  results: Array<{
    sensorId: number
    totalAttempts: number
    receivedAttempts: number
    responseRate: number | null
    lastValue: number | null
    lastRawValue: number | null
    unit: string | null
    rssi: string | null
    lastAttemptAt: string | null
    lastResponseAt: string | null
  }>
  summary: {
    totalAttempts: number
    receivedAttempts: number
    responseRate: number | null
  }
}
