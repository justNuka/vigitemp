import { useQuery } from "@tanstack/react-query";

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
  const response = await fetch("/api/sites?format=admin");
  if (!response.ok) throw new Error("Failed to fetch sites");
  return response.json();
}

async function fetchSitesSimple(): Promise<SiteSimple[]> {
  const response = await fetch("/api/sites");
  if (!response.ok) throw new Error("Failed to fetch sites");
  return response.json();
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
