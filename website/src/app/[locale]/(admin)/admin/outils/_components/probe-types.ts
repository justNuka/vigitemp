export type ProbeStatus = "ok" | "warning" | "error" | (string & {})

export type Probe = {
  Id_Sonde: number
  Sonde_Numero_Serie: string
  Adresse_Sonde: string
  Port_Serie: string
  Module: string
  Relai_1: string
  Relai_2: string
  Relai_3: string
  Relai_4: string
  Signal_Lu: ProbeStatus
  Taux_Reponse: number
}

export type ProbeWithSelection = Probe & { selected?: boolean }

