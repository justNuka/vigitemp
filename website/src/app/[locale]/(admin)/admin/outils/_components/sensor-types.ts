export type Sensor = {
  Id_Sonde: number
  Sonde_Numero_Serie: string
  Adresse_Sonde: string
  Port_Serie: string
  Lieu: string
  Module: string
  Signal_Lu: string | null
  Taux_Reponse: number
}

export type SensorWithSelection = Sensor & { selected?: boolean }


