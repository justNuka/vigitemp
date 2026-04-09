import type { SensorWithSelection } from "./sensor-types"

export const MOCK_SENSORS: SensorWithSelection[] = [
  {
    Id_Sonde: 1,
    Sonde_Numero_Serie: "SONDE001",
    Adresse_Sonde: "192.168.1.10",
    Port_Serie: "COM1",
    Lieu: "Salle froide 1",
    Module: "MOD-001",
    Signal_Lu: "23,4 ?C",
    Taux_Reponse: 98.5,
  },
  {
    Id_Sonde: 2,
    Sonde_Numero_Serie: "SONDE002",
    Adresse_Sonde: "192.168.1.11",
    Port_Serie: "COM2",
    Lieu: "Laboratoire nord",
    Module: "MOD-002",
    Signal_Lu: "52,1 %HR",
    Taux_Reponse: 92.0,
  },
  {
    Id_Sonde: 3,
    Sonde_Numero_Serie: "SONDE003",
    Adresse_Sonde: "192.168.1.12",
    Port_Serie: "COM3",
    Lieu: "Chambre 2",
    Module: "MOD-003",
    Signal_Lu: null,
    Taux_Reponse: 45.0,
  },
]


