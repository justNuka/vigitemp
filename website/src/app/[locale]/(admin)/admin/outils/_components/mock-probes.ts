import type { ProbeWithSelection } from "./probe-types"

export const MOCK_PROBES: ProbeWithSelection[] = [
  {
    Id_Sonde: 1,
    Sonde_Numero_Serie: "SONDE001",
    Adresse_Sonde: "192.168.1.10",
    Port_Serie: "COM1",
    Module: "MOD-001",
    Relai_1: "Relai_1",
    Relai_2: "Relai_2",
    Relai_3: "Relai_3",
    Relai_4: "Relai_4",
    Signal_Lu: "ok",
    Taux_Reponse: 98.5,
  },
  {
    Id_Sonde: 2,
    Sonde_Numero_Serie: "SONDE002",
    Adresse_Sonde: "192.168.1.11",
    Port_Serie: "COM2",
    Module: "MOD-002",
    Relai_1: "Relai_1",
    Relai_2: "Relai_2",
    Relai_3: "Relai_3",
    Relai_4: "Relai_4",
    Signal_Lu: "warning",
    Taux_Reponse: 92.0,
  },
  {
    Id_Sonde: 3,
    Sonde_Numero_Serie: "SONDE003",
    Adresse_Sonde: "192.168.1.12",
    Port_Serie: "COM3",
    Module: "MOD-003",
    Relai_1: "Relai_1",
    Relai_2: "Relai_2",
    Relai_3: "Relai_3",
    Relai_4: "Relai_4",
    Signal_Lu: "error",
    Taux_Reponse: 45.0,
  },
]

