import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/http";

export interface Module {
  Id_Module: number;
  Module_Numero_Serie: string | null;
  Type_Module: number | null;
  Libelle_Type_Module: string | null;
  Port_Serie: string | null;
  Emplacement: string | null;
  Id_Serveur: number | null;
  sondes_count: number;
}

export interface Sonde {
  Id_Sonde: number;
  Sonde_Numero_Serie: string | null;
  Adresse_Sonde: string | null;
  Port_Serie: string | null;
  Surveillance_Etat: string | null;
}

export function useModules(enabled: boolean = true) {
  return useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      return getJson<Module[]>("/api/modules");
    },
    staleTime: 60000, // 1 minute
    enabled,
  });
}

export function useModuleSondes(moduleId: number | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ["modules", moduleId, "sondes"],
    queryFn: async () => {
      if (!moduleId) return [];
      return getJson<Sonde[]>(`/api/modules/${moduleId}/sondes`);
    },
    enabled: !!moduleId && enabled,
    staleTime: 60000, // 1 minute
  });
}

export interface ModuleType {
  Id_Module_Type: number;
  Libelle_Type_Module: string | null;
  Libelle_Module: string | null;
}

export function useModuleTypes(enabled: boolean = true) {
  return useQuery({
    queryKey: ["module-types"],
    queryFn: async () => {
      return getJson<ModuleType[]>("/api/modules/types");
    },
    staleTime: 60000, // 1 minute
    enabled,
  });
}
