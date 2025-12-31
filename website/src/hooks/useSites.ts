import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/http";

export interface SiteAdmin {
  Id_Site: number;
  Code_Site: string | null;
  Libelle_Site: string | null;
  Commentaire: string | null;
  Est_Archive: boolean | null;
}

export interface SiteSimple {
  id: number;
  name: string;
}

async function fetchSitesAdmin(): Promise<SiteAdmin[]> {
  return getJson<SiteAdmin[]>("/api/sites?format=admin");
}

async function fetchSitesSimple(): Promise<SiteSimple[]> {
  return getJson<SiteSimple[]>("/api/sites");
}

export function useSites(enabled = true) {
  return useQuery({
    queryKey: ["sites"],
    queryFn: fetchSitesAdmin,
    enabled,
    refetchInterval: 60000, // 1 minute
  });
}

export function useSitesSimple(enabled = true) {
  return useQuery({
    queryKey: ["sites-simple"],
    queryFn: fetchSitesSimple,
    enabled,
    refetchInterval: 60000, // 1 minute
  });
}
