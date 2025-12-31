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
  Etat_Sonde: string | null;
}

export function useModules() {
  return useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      return getJson<Module[]>("/api/modules");
    },
    staleTime: 60000, // 1 minute
  });
}

export function useModuleSondes(moduleId: number | null) {
  return useQuery({
    queryKey: ["modules", moduleId, "sondes"],
    queryFn: async () => {
      if (!moduleId) return [];
      return getJson<Sonde[]>(`/api/modules/${moduleId}/sondes`);
    },
    enabled: !!moduleId,
    staleTime: 60000, // 1 minute
  });
}

export interface ModuleType {
  Id_Module_Type: number;
  Libelle_Type_Module: string | null;
  Libelle_Module: string | null;
}

export function useModuleTypes() {
  return useQuery({
    queryKey: ["module-types"],
    queryFn: async () => {
      return getJson<ModuleType[]>("/api/modules/types");
    },
    staleTime: 60000, // 1 minute
  });
}
