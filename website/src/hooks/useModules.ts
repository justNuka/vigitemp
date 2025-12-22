import { useQuery } from "@tanstack/react-query";

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
      const res = await fetch("/api/modules");
      if (!res.ok) throw new Error("Erreur lors du chargement des modules");
      return res.json() as Promise<Module[]>;
    },
    staleTime: 60000, // 1 minute
  });
}

export function useModuleSondes(moduleId: number | null) {
  return useQuery({
    queryKey: ["modules", moduleId, "sondes"],
    queryFn: async () => {
      if (!moduleId) return [];
      const res = await fetch(`/api/modules/${moduleId}/sondes`);
      if (!res.ok) throw new Error("Erreur lors du chargement des sondes");
      return res.json() as Promise<Sonde[]>;
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
      const res = await fetch("/api/modules/types");
      if (!res.ok) throw new Error("Erreur lors du chargement des types");
      return res.json() as Promise<ModuleType[]>;
    },
    staleTime: 60000, // 1 minute
  });
}
